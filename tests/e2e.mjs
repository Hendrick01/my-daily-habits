// Testes ponta a ponta sem dependências extras: sobe o `vite preview` e controla o
// Chrome headless pelo DevTools Protocol (WebSocket e fetch nativos do Node 22).
//
//   npm run test:e2e                         build + testes
//   E2E_URL=https://... node tests/e2e.mjs   roda contra um site já publicado
//   CHROME_BIN=/caminho/do/chrome            se o Chrome não estiver no PATH
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import assert from "node:assert/strict";
import { preview } from "vite";

const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- servidor e navegador ----------

const server = process.env.E2E_URL ? null : await preview({ preview: { port: 4174, strictPort: true }, logLevel: "silent" });
const APP = (process.env.E2E_URL ?? server.resolvedUrls.local[0]).replace(/\/$/, "");

const profile = await mkdtemp(join(tmpdir(), "mdh-e2e-"));
const chrome = spawn(
  process.env.CHROME_BIN ?? "google-chrome",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    ...(process.env.CI ? ["--no-sandbox"] : []),
    `--user-data-dir=${profile}`,
    "--remote-debugging-port=0",
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function devtoolsPort() {
  for (let i = 0; i < 100; i++) {
    const content = await readFile(join(profile, "DevToolsActivePort"), "utf8").catch(() => "");
    if (content) return content.split("\n")[0];
    await wait(100);
  }
  throw new Error("O Chrome não abriu a porta de depuração.");
}

const port = await devtoolsPort();
const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((target) => target.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve));

let nextId = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  pending.get(message.id)?.(message);
  pending.delete(message.id);
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, (message) => (message.error ? reject(new Error(`${method}: ${message.error.message}`)) : resolve(message.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
}

// ---------- ajudantes ----------

// Roda código na página (pode usar await) e devolve o valor retornado.
async function js(code) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression: `(async () => { ${code} })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
}

// Espera a tela chegar no estado esperado (valor igual, regex ou função), em vez de pausas fixas.
async function expectJs(expression, expected, timeout = 5000) {
  const matches =
    expected instanceof RegExp
      ? (value) => typeof value === "string" && expected.test(value)
      : typeof expected === "function"
        ? expected
        : (value) => isDeepStrictEqual(value, expected);
  const deadline = Date.now() + timeout;
  let last;
  while (Date.now() < deadline) {
    try {
      last = await js(`return ${expression}`);
      if (matches(last)) return last;
    } catch (error) {
      last = error.message;
    }
    await wait(50);
  }
  assert.fail(`${expression}\n  esperado: ${expected}\n  obtido:   ${JSON.stringify(last)}`);
}

async function go(path) {
  await send("Page.navigate", { url: APP + path });
  await expectJs(`document.readyState === "complete" && !!document.querySelector("main.app")`, true);
}

const fill = (selector, value) => `{
  const input = document.querySelector(${JSON.stringify(selector)});
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ${JSON.stringify(value)});
  input.dispatchEvent(new Event("input", { bubbles: true }));
}`;
const choose = (selector, value) => `{
  const select = document.querySelector(${JSON.stringify(selector)});
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(select, ${JSON.stringify(value)});
  select.dispatchEvent(new Event("change", { bubbles: true }));
}`;
const click = (selector) => `document.querySelector(${JSON.stringify(selector)}).click();`;
const clickText = (selector, text) =>
  `[...document.querySelectorAll(${JSON.stringify(selector)})].find((el) => el.textContent.includes(${JSON.stringify(text)})).click();`;
const resetData = (value = "{oops") => js(`localStorage.setItem("my-daily-habits:habits", ${JSON.stringify(value)});`);
const cards = `document.querySelectorAll(".habit-card").length`;
const saved = `JSON.parse(localStorage.getItem("my-daily-habits:habits"))`;

async function chooseFile(path) {
  const { root } = await send("DOM.getDocument");
  const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector: 'input[type="file"]' });
  await send("DOM.setFileInputFiles", { nodeId, files: [path] });
}

const tests = [];
const test = (name, run) => tests.push({ name, run });

// ---------- dados e hoje ----------

test("dados antigos (completed: true) são migrados", async () => {
  await resetData(JSON.stringify([{ id: "x", title: "Antigo", goal: "g", completed: true }]));
  await go("/");
  await expectJs(`document.querySelectorAll(".habit-card.is-complete").length`, 1);
  const habit = await js(`return ${saved}[0]`);
  assert.ok(habit.completedDates.length === 1 && !("completed" in habit) && habit.schedule.type === "daily");
});

test("JSON inválido volta aos 3 hábitos iniciais", async () => {
  await resetData();
  await go("/");
  await expectJs(cards, 3);
});

test("marcar hábito atualiza contador, título da aba e sequência", async () => {
  await js(`document.querySelectorAll(".check")[1].click();`);
  await expectJs(`document.querySelector(".hero-count").textContent`, /2 de 3 hábitos concluídos\./);
  await expectJs(`document.title`, "2/3 hábitos concluídos");
  await expectJs(`document.querySelectorAll(".streak").length`, 2);
});

test("tudo concluído mostra comemoração", async () => {
  await js(`document.querySelectorAll(".check")[2].click();`);
  await expectJs(`!!document.querySelector(".celebrate")`, true);
});

test("virada do dia: com o app aberto, a lista recomeça e a sequência continua", async () => {
  await resetData();
  await go("/");
  await expectJs(`document.querySelector(".hero-count").textContent`, /^1 de 3/);
  await js(`
    const RealDate = Date, shift = 24 * 60 * 60 * 1000;
    globalThis.Date = class extends RealDate {
      constructor(...args) { super(...(args.length ? args : [RealDate.now() + shift])); }
      static now() { return RealDate.now() + shift; }
    };
    document.dispatchEvent(new Event("visibilitychange"));`);
  await expectJs(`document.querySelector(".hero-count").textContent`, /^0 de 3/);
  await expectJs(`document.querySelector(".streak")?.textContent.trim()`, "🔥 1 dia");
});

// ---------- cadastro ----------

test("formulário vazio mostra erro e não cadastra", async () => {
  await resetData();
  await go("/novo");
  await js(click(".form button[type=submit]"));
  await expectJs(`document.querySelector(".form-error")?.textContent`, "Preencha o hábito e a meta.");
});

test("cadastro válido volta para / com o hábito novo", async () => {
  await js(`${fill('input[name="habit"]', "Correr")} ${fill('input[name="goal"]', "3 km")}`);
  await js(click(".form button[type=submit]"));
  await expectJs(`location.pathname`, "/");
  await expectJs(cards, 4);
});

test("cadastro com emoji aparece no cartão", async () => {
  await go("/novo");
  await js(`${fill('input[name="habit"]', "Tocar violão")} ${fill('input[name="goal"]', "15 minutos")} ${click('input[aria-label="Ícone 🎸"]')}`);
  await js(click(".form button[type=submit]"));
  await expectJs(`[...document.querySelectorAll(".habit-card .habit-emoji")].map((e) => e.textContent)`, (emojis) => emojis.includes("🎸"));
});

test("ideia rápida adiciona com um clique e some da lista", async () => {
  await go("/novo");
  await js(clickText(".chip", "Meditar"));
  await expectJs(cards, 6);
  await go("/novo");
  await expectJs(`[...document.querySelectorAll(".chip")].some((chip) => chip.textContent.includes("Meditar"))`, false);
});

test("filtro de hábitos (Pendentes / Concluídos)", async () => {
  await go("/habitos");
  await js(clickText(".segmented button", "Pendentes"));
  await expectJs(cards, 5);
  await js(clickText(".segmented button", "Concluídos"));
  await expectJs(cards, 1);
});

// ---------- frequência ----------

test("frequência: dias da semana fora de hoje não aparecem em 'Hoje'", async () => {
  await resetData();
  await go("/novo");
  await js(`${fill('input[name="habit"]', "Natação")} ${fill('input[name="goal"]', "1 hora")} ${click('input[name="schedule"][value="weekdays"]')}`);
  await expectJs(`document.querySelectorAll(".day-option input").length`, 7);
  await js(`
    const boxes = [...document.querySelectorAll(".day-option input")];
    boxes.filter((box) => box.checked).forEach((box) => box.click());
    boxes[(new Date().getDay() + 1) % 7].click();`);
  await js(click(".form button[type=submit]"));
  await expectJs(`location.pathname`, "/");
  await expectJs(cards, 3);
  await expectJs(`document.querySelector(".off-today")?.textContent`, /1 hábito fora de hoje/);
  await go("/habitos");
  await expectJs(cards, 4);
  await expectJs(`[...document.querySelectorAll(".schedule-tag")].map((tag) => tag.textContent)`, (tags) => tags.length === 1);
});

test("frequência: dias da semana sem nenhum dia marcado mostra erro", async () => {
  await go("/novo");
  await js(`${fill('input[name="habit"]', "X")} ${fill('input[name="goal"]', "Y")} ${click('input[name="schedule"][value="weekdays"]')}`);
  await expectJs(`document.querySelectorAll(".day-option input").length`, 7);
  await js(`[...document.querySelectorAll(".day-option input")].filter((box) => box.checked).forEach((box) => box.click());`);
  await js(click(".form button[type=submit]"));
  await expectJs(`document.querySelector(".form-error")?.textContent`, "Escolha pelo menos um dia da semana.");
});

test("frequência: meta semanal mostra o progresso da semana", async () => {
  await resetData();
  await go("/novo");
  await js(`${fill('input[name="habit"]', "Academia")} ${fill('input[name="goal"]', "1 hora")} ${click('input[name="schedule"][value="weekly"]')}`);
  await expectJs(`!!document.querySelector('input[name="times"]')`, true);
  await js(fill('input[name="times"]', "2"));
  await js(click(".form button[type=submit]"));
  await expectJs(`location.pathname`, "/");
  await expectJs(`document.querySelector(".schedule-tag")?.textContent`, "0/2 esta semana");
  await expectJs(`document.querySelector(".hero-count").textContent`, /^1 de 4/);
  await js(`[...document.querySelectorAll(".habit-card")].find((card) => card.textContent.includes("Academia")).querySelector(".check").click();`);
  await expectJs(`document.querySelector(".schedule-tag")?.textContent`, "1/2 esta semana");
  await expectJs(`document.querySelector(".hero-count").textContent`, /^2 de 4/);
});

// ---------- partes do dia ----------

const remedio = `[...document.querySelectorAll(".habit-card")].find((card) => card.textContent.includes("Remédio"))`;

test("partes: cadastro com 'Manhã, tarde e noite' cria 3 partes no cartão", async () => {
  await resetData();
  await go("/novo");
  await js(`${fill('input[name="habit"]', "Remédio")} ${fill('input[name="goal"]', "1 comprimido")}`);
  await js(clickText(".chip", "Manhã, tarde e noite"));
  await expectJs(`document.querySelectorAll(".parts-editor li").length`, 3);
  await js(click(".form button[type=submit]"));
  await expectJs(`location.pathname`, "/");
  await expectJs(`${remedio}?.querySelector(".check-count")?.textContent`, "0/3");
  await expectJs(`[...${remedio}.querySelectorAll(".part-chip")].map((chip) => chip.textContent)`, ["Manhã · 08:00", "Tarde · 13:00", "Noite · 20:00"]);
});

test("partes: botão principal marca a próxima; o dia só conclui com todas", async () => {
  await js(`${remedio}.querySelector(".check").click();`);
  await expectJs(`${remedio}.querySelector(".check-count")?.textContent`, "1/3");
  await expectJs(`${remedio}.querySelector(".habit-status").textContent`, "1 de 3");
  await expectJs(`${remedio}.querySelector(".part-chip").getAttribute("aria-pressed")`, "true");
  await js(`${remedio}.querySelectorAll(".part-chip")[2].click();`);
  await expectJs(`${remedio}.querySelector(".check-count")?.textContent`, "2/3");
  await expectJs(`document.querySelector(".hero-count").textContent`, /^1 de 4/);
  await js(`${remedio}.querySelectorAll(".part-chip")[1].click();`);
  await expectJs(`${remedio}.classList.contains("is-complete")`, true);
  await expectJs(`document.querySelector(".hero-count").textContent`, /^2 de 4/);
});

test("partes: editar removendo uma parte mantém o progresso das outras", async () => {
  const id = await js(`return ${saved}.find((habit) => habit.title === "Remédio").id`);
  await go(`/habitos/${id}`);
  await expectJs(`document.querySelector(".card h3")?.textContent`, "Partes de hoje · 3 de 3");
  await js(clickText(".btn", "Editar"));
  await expectJs(`document.querySelectorAll(".parts-editor li").length`, 3);
  await js(`document.querySelectorAll(".remove-part")[1].click();`);
  await expectJs(`document.querySelectorAll(".parts-editor li").length`, 2);
  await js(click(".form button[type=submit]"));
  await expectJs(`document.querySelector(".card h3")?.textContent`, "Partes de hoje · 2 de 2");
});

test("partes: uma parte só com horário vira etiqueta ⏰ no cartão", async () => {
  await go("/novo");
  await js(`${fill('input[name="habit"]', "Vitamina")} ${fill('input[name="goal"]', "1 cápsula")}`);
  await js(clickText(".chip", "+ Adicionar parte"));
  await expectJs(`document.querySelectorAll(".parts-editor li").length`, 1);
  await js(fill('input[name="part-time"]', "07:30"));
  await js(click(".form button[type=submit]"));
  await expectJs(`location.pathname`, "/");
  await expectJs(`[...document.querySelectorAll(".habit-card")].find((card) => card.textContent.includes("Vitamina"))?.querySelector(".schedule-tag")?.textContent`, "⏰ 07:30");
  await expectJs(`[...document.querySelectorAll(".habit-card")].find((card) => card.textContent.includes("Vitamina"))?.querySelector(".check-count")`, null);
});

// ---------- detalhe ----------

test("detalhe: marcar ontem soma na sequência", async () => {
  await resetData();
  await go("/habitos/water");
  await expectJs(`document.querySelector(".stat strong").textContent`, "🔥 1");
  await js(`const dots = document.querySelectorAll(".week-dot"); dots[dots.length - 2].click();`);
  await expectJs(`document.querySelector(".stat strong").textContent`, "🔥 2");
  await expectJs(`[...document.querySelectorAll(".week-dot")].at(-2).getAttribute("aria-pressed")`, "true");
});

test("detalhe: editar título, meta e ícone", async () => {
  await js(clickText(".btn", "Editar"));
  await expectJs(`document.querySelector('input[name="habit"]')?.value`, "Beber água");
  await js(`${fill('input[name="habit"]', "Beber mais água")} ${fill('input[name="goal"]', "2 litros")} ${click('input[aria-label="Ícone 🎯"]')}`);
  await js(click(".form button[type=submit]"));
  await expectJs(`document.querySelector(".detail-head h2")?.textContent`, "🎯Beber mais água");
  await expectJs(`document.querySelector(".detail-head .muted").textContent`, "Meta: 2 litros");
});

test("detalhe: melhor sequência e calendário de 16 semanas", async () => {
  await expectJs(`[...document.querySelectorAll(".stat strong")][1].textContent`, "🏆 2");
  const expectedCells = await js(`return 15 * 7 + new Date().getDay() + 1`);
  await expectJs(`document.querySelectorAll(".heat-cell").length`, expectedCells);
  await expectJs(`document.querySelectorAll(".heat-cell.is-done").length`, 2);
});

test("detalhe: excluir pede confirmação e remove", async () => {
  await go("/habitos/walk");
  await js(clickText(".btn-danger", "Excluir"));
  await expectJs(`document.querySelector(".btn-danger").textContent`, "Confirmar exclusão");
  await js(click(".btn-danger"));
  await expectJs(`location.pathname`, "/habitos");
  await expectJs(cards, 2);
  // A exclusão fica guardada como "lápide" para sincronizar com outros aparelhos.
  await expectJs(`${saved}.find((habit) => habit.id === "walk")?.deleted`, true);
});

test("id inexistente mostra 'Hábito não encontrado'", async () => {
  await go("/habitos/nao-existe");
  await expectJs(`document.querySelector(".empty")?.textContent`, /Hábito não encontrado.*Voltar à lista/);
});

// ---------- backup ----------

test("backup: exportar gera JSON com os hábitos", async () => {
  await resetData();
  await go("/habitos");
  const exported = await js(`
    let blob;
    URL.createObjectURL = (file) => { blob = file; return "blob:teste"; };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = () => {};
    ${clickText(".btn", "Exportar")}
    return JSON.parse(await blob.text());`);
  assert.equal(exported.app, "my-daily-habits");
  assert.equal(exported.habits.length, 3);
  assert.ok(exported.habits.every((habit) => habit.schedule && Array.isArray(habit.completedDates)));
});

test("backup: importar pede confirmação e substitui", async () => {
  await chooseFile(fixture("backup-valido.json"));
  await expectJs(`document.querySelector(".confirm")?.textContent`, /Substituir seus 3 hábitos pelos 2 do arquivo/);
  await js(clickText(".confirm button", "Substituir"));
  await expectJs(cards, 2);
  await expectJs(`document.querySelector(".backup .status-msg")?.textContent`, /2 hábitos importados/);
});

test("backup: arquivo inválido mostra erro e não mexe nos dados", async () => {
  await chooseFile(fixture("backup-invalido.json"));
  await expectJs(`document.querySelector(".backup .status-msg")?.textContent`, /Arquivo inválido/);
  await expectJs(cards, 2);
});

// ---------- sugestões ----------

test("sugestões: sorteia 6 em português e adiciona com a meta", async () => {
  await go("/sugestoes");
  await js(clickText("button", "Buscar sugestões"));
  await expectJs(`document.querySelector(".status-msg")?.textContent`, "6 sugestões recebidas");
  const catalog = await js(`return (await (await fetch("/api/sugestoes.json")).json()).map((item) => item.title)`);
  await expectJs(`[...document.querySelectorAll(".suggestion strong")].map((e) => e.textContent)`, (titles) => titles.every((title) => catalog.includes(title)));
  const first = await js(`return { title: document.querySelector(".suggestion strong").textContent, goal: document.querySelector(".suggestion .muted").textContent.replace("Meta: ", "") }`);
  await js(click(".suggestion button"));
  await expectJs(`document.querySelector(".suggestion button").textContent`, "Adicionado ✓");
  await expectJs(`${saved}.find((habit) => habit.title === ${JSON.stringify(first.title)})?.goal`, first.goal);
});

test("sugestões: erro HTTP mostra o status e lista vazia", async () => {
  await js(`window.fetch = async () => new Response("not found", { status: 404 }); ${clickText("button", "Buscar sugestões")}`);
  await expectJs(`document.querySelector(".status-msg.is-error")?.textContent`, /Status da resposta: 404/);
  await expectJs(`document.querySelectorAll(".suggestion").length`, 0);
});

test("sugestões: resposta que não é JSON mostra mensagem amigável", async () => {
  await js(`window.fetch = async () => new Response("<!doctype html>", { status: 200 }); ${clickText("button", "Buscar sugestões")}`);
  await expectJs(`document.querySelector(".status-msg.is-error")?.textContent`, /formato esperado/);
});

// ---------- treino ----------

const training = `JSON.parse(localStorage.getItem("my-daily-habits:training") ?? "null")`;

test("treino: sem avaliação, mostra o convite para começar", async () => {
  await js(`localStorage.removeItem("my-daily-habits:training");`);
  await go("/treino");
  await expectJs(`document.querySelector(".training-start h2")?.textContent`, "Comece pela avaliação");
});

test("treino: avaliação valida medidas e mostra o IMC na hora", async () => {
  await go("/treino/avaliacao");
  await js(click(".assessment button[type=submit]"));
  await expectJs(`document.querySelector(".form-error")?.textContent`, /idade/);
  await js(`${fill('input[name="age"]', "29")} ${fill('input[name="weight"]', "82")} ${fill('input[name="height"]', "178")}`);
  await expectJs(`document.querySelector(".bmi-preview")?.textContent`, /25,9 · Sobrepeso/);
});

test("treino: avaliação gera plano ABC de hipertrofia na academia", async () => {
  await js(`[...document.querySelectorAll(".option-card")].find((card) => card.textContent.includes("Ganhar massa")).click();`);
  await js(`${choose('select[name="level"]', "2")} ${choose('select[name="days"]', "3")} ${choose('select[name="minutes"]', "60")}`);
  await js(click(".assessment button[type=submit]"));
  await expectJs(`location.pathname`, "/treino");
  await expectJs(`[...document.querySelectorAll(".workout-card strong")].map((e) => e.textContent)`, ["Treino A", "Treino B", "Treino C"]);
  await expectJs(`document.querySelector(".workout-card .muted")?.textContent`, /^Peito, Ombros e Tríceps · 9 exercícios/);
  await expectJs(`${training}.workouts[0].items[0].sets`, 4);
  await expectJs(`${training}.workouts[0].items[0].reps`, "8–12");
});

test("treino: PAR-Q com 'sim' mostra aviso de liberação médica", async () => {
  await go("/treino/avaliacao");
  await js(`document.querySelectorAll('input[name="parq-1"]')[1].click();`);
  await expectJs(`document.querySelector(".assessment .notice.is-warning")?.textContent`, /converse com um médico/);
  await js(clickText(".btn", "Só salvar a avaliação"));
  await expectJs(`document.querySelector(".notice.is-warning")?.textContent`, /converse com um médico/);
  await expectJs(`${training}.workouts.length`, 3);
});

test("treino: editor muda séries, reordena e remove", async () => {
  const id = await js(`return ${training}.workouts[0].id`);
  await go(`/treino/${id}`);
  await expectJs(`document.querySelectorAll(".workout-item").length`, 9);
  await js(fill('.workout-item input[name="sets"]', "3"));
  await expectJs(`${training}.workouts[0].items[0].sets`, 3);
  await js(fill('.workout-item input[name="load"]', "40"));
  await expectJs(`${training}.workouts[0].items[0].load`, "40");
  const second = await js(`return document.querySelectorAll(".item-title a")[1].textContent`);
  await js(`document.querySelectorAll(".item-actions button")[0 + 3].click();`); // ↑ do segundo item
  await expectJs(`document.querySelector(".item-title a").textContent`, second);
  await js(`document.querySelector('.item-actions button[aria-label^="Remover"]').click();`);
  await expectJs(`document.querySelectorAll(".workout-item").length`, 8);
});

test("treino: seletor busca sem acento e adiciona exercício", async () => {
  await js(clickText(".btn", "+ Adicionar exercício"));
  await js(fill('.picker input[name="search"]', "triceps frances"));
  await expectJs(`[...document.querySelectorAll(".picker-info strong")].map((e) => e.textContent)`, ["Tríceps francês com halter"]);
  await js(`document.querySelector(".picker-list button").click();`);
  await expectJs(`[...document.querySelectorAll(".item-title a")].at(-1).textContent`, "Tríceps francês com halter");
  await expectJs(`document.querySelector(".picker .status-msg")?.textContent`, /adicionado ao treino/);
});

test("treino: exercício próprio entra no treino e na biblioteca", async () => {
  const id = await js(`return ${training}.workouts[0].id`);
  await go(`/treino/exercicios/novo?treino=${id}`);
  await js(`${fill('input[name="name"]', "Remada no TRX")} ${choose('select[name="group"]', "costas")} ${fill('input[name="videoUrl"]', "javascript:alert(1)")}`);
  await js(click(".form button[type=submit]"));
  await expectJs(`document.querySelector(".form-error")?.textContent`, /https:\/\//);
  await js(fill('input[name="videoUrl"]', ""));
  await js(click(".form button[type=submit]"));
  await expectJs(`location.pathname`, `/treino/${id}`);
  await expectJs(`[...document.querySelectorAll(".item-title a")].at(-1).textContent`, "Remada no TRX");
  await go("/treino/exercicios");
  await js(fill('.library-filters input[name="search"]', "trx"));
  await expectJs(`[...document.querySelectorAll(".exercise-card strong")].map((e) => e.textContent)`, ["Remada no TRX"]);
});

test("treino: detalhe tem demonstração em 2 fotos, passo a passo e vídeo", async () => {
  await go("/treino/exercicios/agachamento-goblet");
  await expectJs(`[...document.querySelectorAll(".exercise-demo.is-large img")].map((img) => img.getAttribute("src").split("/").slice(-2).join("/"))`, ["Goblet_Squat/0.jpg", "Goblet_Squat/1.jpg"]);
  await expectJs(`document.querySelectorAll(".steps li").length`, 3);
  await expectJs(`document.querySelector('a[href*="youtube.com/results"]')?.getAttribute("target")`, "_blank");
  await js(clickText(".btn", "+ Adicionar ao treino"));
  await expectJs(`document.querySelector(".add-to-workout .status-msg")?.textContent`, /Adicionado ao Treino A/);
});

test("treino: biblioteca filtra por tipo e grupo", async () => {
  await go("/treino/exercicios");
  await js(clickText(".library-filters .segmented button", "Alongamento"));
  await js(choose('.library-filters select[name="group"]', "costas"));
  await expectJs(`document.querySelector(".results-count").textContent`, /^[1-9]\d* exercícios?$/);
  await expectJs(`[...document.querySelectorAll(".exercise-card .muted")].every((e) => e.textContent.startsWith("Costas"))`, true);
});

test("treino: catálogo completo carrega e busca (rede simulada)", async () => {
  await go("/treino/exercicios");
  await js(`window.fetch = async () => new Response(JSON.stringify([
    { id: "Air_Bike", name: "Air Bike", primaryMuscles: ["abdominals"], equipment: "body only", category: "strength", level: "beginner", images: ["Air_Bike/0.jpg"], instructions: ["Lie flat"] },
    { id: "Barbell_Squat", name: "Barbell Squat", primaryMuscles: ["quadriceps"], equipment: "barbell", category: "strength", level: "beginner", images: ["Barbell_Squat/0.jpg"], instructions: ["Stand"] }
  ]), { status: 200 });`);
  await js(clickText(".catalog .btn", "Carregar catálogo completo"));
  await expectJs(`document.querySelector(".catalog .status-msg")?.textContent`, /2 exercícios carregados/);
  await js(fill('.library-filters input[name="search"]', "squat"));
  await expectJs(`[...document.querySelectorAll(".catalog .exercise-card strong")].map((e) => e.textContent)`, ["Barbell Squat"]);
});

test("treino: planilha CSV com avaliação e exercícios", async () => {
  await go("/treino");
  const csv = await js(`
    let blob;
    URL.createObjectURL = (file) => { blob = file; return "blob:teste"; };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = () => {};
    ${clickText(".btn", "Exportar planilha")}
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? "BOM" : "sem BOM") + "|" + (await blob.text());`);
  assert.ok(csv.startsWith("BOM|"), "BOM para o Excel reconhecer acentos");
  assert.match(csv, /Objetivo;Ganhar massa muscular/);
  assert.match(csv, /IMC;25,9 \(Sobrepeso\)/);
  assert.match(csv, /Treino;Foco;Ordem;Exercício;Grupo;Séries;Repetições;Carga \(kg\);Descanso \(s\);Observações/);
  assert.match(csv, /Treino A;Peito, Ombros e Tríceps;1;.*;3;8–12;40;75;/, "edição de séries e carga vai para a planilha");
  assert.match(csv, /Remada no TRX/);
});

test("treino: cria o hábito 'Treinar' com a frequência do plano", async () => {
  await js(clickText(".btn", "Criar hábito"));
  await expectJs(`document.querySelector(".status-msg")?.textContent`, /3x por semana/);
  await expectJs(`${saved}.find((habit) => habit.title === "Treinar")?.schedule`, { type: "weekly", times: 3 });
  await expectJs(`[...document.querySelectorAll(".btn")].some((b) => b.textContent.includes("já existe"))`, true);
});

test("treino: objetivo 'Glúteos e pernas' muda o resumo e o plano", async () => {
  await js(`localStorage.removeItem("my-daily-habits:training");`);
  await go("/treino/avaliacao");
  await js(`${fill('input[name="age"]', "34")} ${fill('input[name="weight"]', "64")} ${fill('input[name="height"]', "165")}`);
  await js(`[...document.querySelectorAll(".option-card")].find((card) => card.textContent.includes("Glúteos e pernas")).click();`);
  await js(choose('select[name="level"]', "1"));
  await expectJs(`document.querySelector(".option-grid + .field-hint")?.textContent`, "No treino: 3 séries de 10–15 · descanso de 60 s · mais Glúteos e Pernas.");
  await js(click(".assessment button[type=submit]"));
  await expectJs(`location.pathname`, "/treino");
  await expectJs(`document.querySelectorAll(".workout-card").length`, 3);
  await expectJs(`${training}.workouts[0].items.some((item) => item.group === "gluteos" || item.group === "pernas")`, true);
  await expectJs(`document.querySelector(".profile-list dd")?.textContent`, "Glúteos e pernas");
});

// ---------- progresso, tema, PWA ----------

test("progresso mostra porcentagem sem NaN", async () => {
  await go("/progresso");
  await expectJs(`document.querySelector(".ring-inner strong")?.textContent`, /^\d+%$/);
});

test("sem hábitos, /progresso redireciona para /novo", async () => {
  await resetData("[]");
  await go("/progresso");
  await expectJs(`location.pathname`, "/novo");
});

test("alternar tema salva a escolha", async () => {
  await go("/");
  const before = await js(`return document.documentElement.dataset.theme`);
  await js(click("button.icon-button"));
  await expectJs(`document.documentElement.dataset.theme`, (theme) => theme !== before);
  await expectJs(`localStorage.getItem("my-daily-habits:theme") === document.documentElement.dataset.theme`, true);
});

test("conta: abre com o formulário de entrar (ou o aviso, sem nuvem)", async () => {
  await go("/conta");
  await expectJs(`document.querySelector(".page-head h1")?.textContent`, "Conta");
  await expectJs(
    `!!document.querySelector('input[name="email"]') || /não está disponível/.test(document.querySelector(".empty")?.textContent ?? "")`,
    true,
  );
});

test("PWA: manifest e ícones respondem", async () => {
  const manifest = await js(`return await (await fetch("/manifest.webmanifest")).json()`);
  assert.equal(manifest.display, "standalone");
  for (const icon of manifest.icons) {
    assert.equal(await js(`return (await fetch(${JSON.stringify(icon.src)})).status`), 200, icon.src);
  }
});

test("PWA: depois da primeira visita, abre sem internet", async () => {
  await resetData();
  await go("/");
  await js(`await navigator.serviceWorker.ready;`);
  await go("/");
  await expectJs(`!!navigator.serviceWorker.controller`, true);
  await send("Network.enable");
  await send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  try {
    await go("/habitos");
    await expectJs(cards, 3);
  } finally {
    await send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  }
});

// ---------- execução ----------

let failures = 0;
try {
  await send("Page.enable");
  await go("/");
  for (const { name, run } of tests) {
    try {
      await run();
      console.log(`✓ ${name}`);
    } catch (error) {
      failures += 1;
      console.log(`✗ ${name}\n  ${error.message.replaceAll("\n", "\n  ")}`);
    }
  }
} finally {
  ws.close();
  chrome.kill();
  await server?.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}

console.log(`\n${tests.length - failures}/${tests.length} testes passaram (${APP})`);
process.exitCode = failures ? 1 : 0;

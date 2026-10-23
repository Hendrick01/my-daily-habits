// Teste de sincronização real: dois "aparelhos" (dois Chromes com perfis separados) e contas descartáveis
// no Supabase de PRODUÇÃO. As contas e2e-*@mydailyhabits.dev são apagadas no fim, mesmo se uma etapa falhar.
//
//   npm run test:sync                          build (com o .env) + teste local
//   E2E_URL=https://... node tests/sync.mjs    contra um site já publicado
//
// Precisa do .env com VITE_SUPABASE_* e do Supabase CLI logado e ligado ao projeto (para apagar as contas).
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import assert from "node:assert/strict";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const server = spawn("npx", ["vite", "preview", "--port", "4175", "--strictPort"], { stdio: "ignore" });
for (let i = 0; i < 100; i++) { try { await fetch("http://localhost:4175/"); break; } catch { await wait(200); } }
const APP = process.env.E2E_URL ?? "http://localhost:4175";
const stampId = Date.now().toString(36);
const userA = { email: `e2e-a-${stampId}@mydailyhabits.dev`, password: `Senha-${stampId}-A!` };
const userC = { email: `e2e-c-${stampId}@mydailyhabits.dev`, password: `Senha-${stampId}-C!` };
console.log("contas:", userA.email, userC.email);

async function device(name) {
  const profile = await mkdtemp(join(tmpdir(), `mdh-${name}-`));
  const chrome = spawn("google-chrome", ["--headless=new", "--disable-gpu", "--no-first-run", `--user-data-dir=${profile}`, "--remote-debugging-port=0", "about:blank"], { stdio: "ignore" });
  let port;
  while (!port) {
    port = (await readFile(join(profile, "DevToolsActivePort"), "utf8").catch(() => "")).split("\n")[0];
    await wait(100);
  }
  const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    pending.get(m.id)?.(m);
    pending.delete(m.id);
  });
  const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
  const js = async (code) => {
    const { result } = await send("Runtime.evaluate", { expression: `(async () => { ${code} })()`, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description);
    return result.result.value;
  };
  const expectJs = async (expr, expected, timeout = 15000) => {
    const ok = expected instanceof RegExp ? (v) => typeof v === "string" && expected.test(v) : typeof expected === "function" ? expected : (v) => isDeepStrictEqual(v, expected);
    const end = Date.now() + timeout;
    let last;
    while (Date.now() < end) {
      try { last = await js(`return ${expr}`); if (ok(last)) return last; } catch (e) { last = e.message; }
      await wait(150);
    }
    assert.fail(`[${name}] ${expr}\n  esperado: ${expected}\n  obtido: ${JSON.stringify(last)}`);
  };
  const go = async (path) => {
    await send("Page.navigate", { url: APP + path });
    await expectJs(`document.readyState === "complete" && !!document.querySelector("main.app")`, true);
  };
  const fill = (selector, value) => js(`const i = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(i, ${JSON.stringify(value)}); i.dispatchEvent(new Event("input", { bubbles: true }));`);
  const clickText = (selector, text) => js(`[...document.querySelectorAll(${JSON.stringify(selector)})].find((el) => el.textContent.includes(${JSON.stringify(text)})).click();`);
  const titles = `[...document.querySelectorAll(".habit-card h2")].map((h) => h.textContent).sort()`;
  async function signIn(user, create) {
    await go("/conta");
    await expectJs(`!!document.querySelector('input[name="email"]')`, true);
    if (create) await clickText(".segmented button", "Criar conta");
    await fill('input[name="email"]', user.email);
    await fill('input[name="password"]', user.password);
    await js(`document.querySelector(".account-form button[type=submit]").click();`);
    await expectJs(`document.querySelector(".card")?.textContent ?? ""`, (t) => t.includes(user.email) || /incorretos|inválido|Erro|já tem/.test(t));
    const text = await js(`return document.querySelector(".card").textContent`);
    assert.ok(text.includes(user.email), `[${name}] login falhou: ${text}`);
    await expectJs(`document.querySelector(".status-msg")?.textContent ?? ""`, /Tudo sincronizado/);
  }
  const syncNow = async () => {
    await go("/conta");
    await clickText(".btn", "Sincronizar agora");
    await expectJs(`document.querySelector(".status-msg")?.textContent ?? ""`, /Tudo sincronizado às/);
  };
  const close = async () => { ws.close(); chrome.kill(); await rm(profile, { recursive: true, force: true }).catch(() => {}); };
  await send("Page.enable");
  return { js, expectJs, go, fill, clickText, titles, signIn, syncNow, close };
}

const results = [];
const step = async (name, run) => { await run(); results.push(`✓ ${name}`); console.log(`✓ ${name}`); };
const A = await device("A");
const B = await device("B");
try {
  await step("A cria conta e sobe os 3 hábitos iniciais", async () => {
    await A.signIn(userA, true);
    await A.go("/");
    await A.expectJs(A.titles, ["Beber água", "Caminhar", "Estudar React"]);
  });

  await step("A cadastra um hábito novo", async () => {
    await A.go("/novo");
    await A.fill('input[name="habit"]', "Sincronizado em A");
    await A.fill('input[name="goal"]', "1x");
    await A.js(`document.querySelector(".form button[type=submit]").click();`);
    await A.expectJs(`location.pathname`, "/");
    await A.syncNow();
  });

  await step("A cria um hábito com partes e marca uma; as partes viajam pela nuvem", async () => {
    await A.go("/novo");
    await A.fill('input[name="habit"]', "Remédio");
    await A.fill('input[name="goal"]', "1 comprimido");
    await A.clickText(".chip", "Manhã, tarde e noite");
    await A.js(`document.querySelector(".form button[type=submit]").click();`);
    await A.expectJs(`location.pathname`, "/");
    await A.js(`[...document.querySelectorAll(".habit-card")].find((c) => c.textContent.includes("Remédio")).querySelector(".check").click();`);
    await A.expectJs(`[...document.querySelectorAll(".habit-card")].find((c) => c.textContent.includes("Remédio")).querySelector(".check-count")?.textContent`, "1/3");
    await A.syncNow();
  });

  await step("A faz a avaliação de treino; o treino viaja pela nuvem", async () => {
    await A.go("/treino/avaliacao");
    await A.fill('input[name="age"]', "30");
    await A.fill('input[name="weight"]', "75");
    await A.fill('input[name="height"]', "175");
    await A.js(`document.querySelector(".assessment button[type=submit]").click();`);
    await A.expectJs(`location.pathname`, "/treino");
    await A.expectJs(`document.querySelectorAll(".workout-card").length`, 3);
    await new Promise((r) => setTimeout(r, 2500)); // sincroniza ~1 s depois da mudança
  });

  await step("B entra na mesma conta e recebe os 4 hábitos (sem duplicar os iniciais)", async () => {
    await B.signIn(userA, false);
    await B.go("/");
    await B.expectJs(B.titles, ["Beber água", "Caminhar", "Estudar React", "Remédio", "Sincronizado em A"]);
    await B.expectJs(`[...document.querySelectorAll(".habit-card")].find((c) => c.textContent.includes("Remédio"))?.querySelector(".check-count")?.textContent`, "1/3");
    await B.go("/treino");
    await B.expectJs(`[...document.querySelectorAll(".workout-card strong")].map((e) => e.textContent)`, ["Treino A", "Treino B", "Treino C"]);
    await B.expectJs(`document.querySelector(".profile-stats strong")?.textContent`, "24,5");
    await B.go("/");
  });

  await step("B marca o hábito como feito; A recebe a marcação", async () => {
    await B.js(`[...document.querySelectorAll(".habit-card")].find((c) => c.textContent.includes("Sincronizado em A")).querySelector(".check").click();`);
    await B.expectJs(`[...document.querySelectorAll(".habit-card.is-complete h2")].map((h) => h.textContent)`, (t) => t.includes("Sincronizado em A"));
    await B.syncNow();
    await A.syncNow();
    await A.go("/");
    await A.expectJs(`[...document.querySelectorAll(".habit-card.is-complete h2")].map((h) => h.textContent)`, (t) => t.includes("Sincronizado em A"));
  });

  await step("A exclui 'Caminhar'; some também em B", async () => {
    await A.go("/habitos/walk");
    await A.clickText(".btn-danger", "Excluir");
    await A.js(`document.querySelector(".btn-danger").click();`);
    await A.expectJs(`location.pathname`, "/habitos");
    await A.syncNow();
    await B.syncNow();
    await B.go("/");
    await B.expectJs(B.titles, ["Beber água", "Estudar React", "Remédio", "Sincronizado em A"]);
  });

  await step("B sai: o aparelho volta ao começo e os dados ficam na conta", async () => {
    await B.go("/conta");
    await B.clickText(".btn-danger", "Sair");
    await B.expectJs(`!!document.querySelector('input[name="email"]')`, true);
    await B.go("/");
    await B.expectJs(B.titles, ["Beber água", "Caminhar", "Estudar React"]);
  });

  await step("Outra conta (C) no aparelho B não vê nada da conta A", async () => {
    await B.signIn(userC, true);
    await B.go("/");
    await B.expectJs(B.titles, ["Beber água", "Caminhar", "Estudar React"]);
  });

  await step("C exclui a conta: some do banco com os hábitos, A fica intacta, C não entra mais", async () => {
    await B.go("/conta");
    await B.clickText(".btn-danger", "Excluir minha conta");
    await B.expectJs(`[...document.querySelectorAll(".btn-danger")].some((b) => b.textContent.includes("Confirmar"))`, true);
    await B.clickText(".btn-danger", "Confirmar");
    await B.expectJs(`document.querySelector(".notice")?.textContent ?? ""`, /Conta excluída/);
    await B.go("/");
    await B.expectJs(B.titles, ["Beber água", "Caminhar", "Estudar React"]);
    await B.go("/conta");
    await B.fill('input[name="email"]', userC.email);
    await B.fill('input[name="password"]', userC.password);
    await B.js(`document.querySelector(".account-form button[type=submit]").click();`);
    await B.expectJs(`document.querySelector(".form-error")?.textContent ?? ""`, /incorretos/);
    await A.syncNow();
    await A.go("/");
    await A.expectJs(A.titles, ["Beber água", "Estudar React", "Remédio", "Sincronizado em A"]);
  });
} finally {
  await A.close();
  await B.close();
  server.kill();
  const cleanup = spawnSync(
    "npx",
    ["--yes", "supabase@2.121.0", "db", "query", "--linked", "delete from auth.users where email like 'e2e-%@mydailyhabits.dev'"],
    { encoding: "utf8" },
  );
  console.log(cleanup.status === 0 ? "contas e2e apagadas do banco" : `⚠️ não consegui apagar as contas e2e:\n${cleanup.stderr}`);
}
console.log(`\n${results.length}/10 etapas`);

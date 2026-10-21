# Missões de documentação

Nome:
Repositório:

## Como preencher

Para cada missão, três coisas:
- **Resposta:** em suas palavras, 2 a 4 frases. Texto copiado da documentação vale zero.
- **Fonte:** a URL exata da página oficial onde você achou.
- **No meu código:** arquivo e o que você fez com essa informação.

Se você não conseguiu resolver uma missão, escreva o que tentou e onde travou.
Isso vale ponto parcial. Deixar em branco não vale nada.

---

## M1 — `value` sem `onChange`: qual aviso o React emite e por quê?

**Resposta:**

**Fonte:**

**No meu código:**

---

## M2 — O que `useParams` devolve num segmento que parece número?

**Resposta:**
O `habitId` que o hook `useParams()` extrai chega sempre como texto (`string`), porque as URLs web são fundamentalmente cadeias de caracteres. No meu projeto, os IDs ("water" e os gerados pelo `crypto.randomUUID()`) também são originalmente `string`. Por conta disso, posso compará-los usando igualdade estrita (`h.id === habitId`) sem sofrer com bugs de tipo e sem precisar converter valores.

**Fonte:**
- https://reactrouter.com/api/hooks/useParams
- MDN: Array.prototype.find()

**No meu código:**

---

## M3 — Além da classe `active`, como o `NavLink` informa que está ativo?

**Resposta:**

**Fonte:**

**No meu código:**

---

## M4 — O que a prop `replace` muda no `Navigate`?

**Resposta:**
A prop `replace` substitui a entrada atual no histórico de navegação do navegador em vez de adicionar uma nova. 
* Sem o `replace`: o navegador salva que você passou por `/progresso` e foi para `/novo`. Se você clicar no botão de "Voltar" do navegador na página `/novo`, ele tenta te levar para `/progresso`, que te expulsa imediatamente de volta para `/novo`. O usuário fica preso num "loop" no histórico.
* Com o `replace`: a rota `/progresso` não é gravada no histórico. O redirecionamento sobrescreve o acesso atual. Assim, ao clicar em "Voltar" a partir de `/novo`, o usuário retorna corretamente para a página em que estava antes de tentar acessar `/progresso`.

**Fonte:**

**No meu código:**

---

## M5 — Por que um 404 não rejeita a promessa do `fetch`?

**Resposta:**
A função `fetch` **não** lança uma exceção (não cai no bloco `catch`) quando o servidor responde com códigos de erro HTTP como 404 (Not Found) ou 500 (Internal Error). Ela só rejeita a Promise se houver uma falha real de rede (como estar sem internet, erro de DNS ou bloqueio de CORS). Por isso é obrigatório checar se a propriedade `response.ok` é verdadeira antes de ler os dados.

**Fonte:** https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

**No meu código:**

---

## M6 — Por que `import.meta.env` e não `process.env` no Vite?

**Resposta:**
No Vite, as variáveis de ambiente não são acessadas via `process.env` (como no Node.js comum), mas sim através de um objeto especial injetado pelo bundler chamado `import.meta.env`.

**Fonte:** https://vite.dev/guide/env-and-mode

**No meu código:**

---

## M7 — Um bug concreto causado por usar o índice como `key`

**Resposta:**

**Como reproduzir (pode ser um experimento temporário):**

**Fonte:**

---

## M8 — Por que um efeito parece rodar duas vezes em desenvolvimento?

**Resposta:**

**Fonte:**

**No meu código:**

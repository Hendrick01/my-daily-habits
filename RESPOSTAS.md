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

**Fonte:**

**No meu código:**

---

## M5 — Por que um 404 não rejeita a promessa do `fetch`?

**Resposta:**

**Fonte:**

**No meu código:**

---

## M6 — Por que `import.meta.env` e não `process.env` no Vite?

**Resposta:**

**Fonte:**

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

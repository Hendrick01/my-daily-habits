# Missões de documentação

Nome: Hendrick Silva Ferreira
Repositório: https://github.com/Hendrick01/my-daily-habits

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
Quando colocamos a prop `value` num `<input>` mas não passamos a função `onChange`, o React entende que o campo é estático. Se tentar digitar algo, nada acontece na tela e o console do navegador exibe o aviso completo: `Warning: You provided a 'value' prop to a form field without an 'onChange' handler. This will render a read-only field. If the field should be mutable use 'defaultValue'. Otherwise, set either 'onChange' or 'readOnly'.`

**Fonte:** https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable

**No meu código:** No `HabitForm.jsx`, os inputs de hábito e meta possuem o seu próprio `onChange` (ex: `onChange={(event) => setTitle(event.target.value)}`), que avisa o React para atualizar o estado cada vez que eu aperto uma tecla.

---

## M2 — O que `useParams` devolve num segmento que parece número?

**Resposta:**
O hook `useParams()` extrai todos os parâmetros definidos na rota do navegador exclusivamente como cadeias de texto (`string`). Se o identificador no sistema for numérico, a comparação direta com igualdade estrita (`===`) falha silenciosamente caso não haja conversão prévia com `Number()` ou `parseInt()`.

**Fonte:** https://reactrouter.com/api/hooks/useParams

**No meu código:** No arquivo `src/pages/HabitDetailsPage.jsx`, leio `habitId` via `useParams()`. Como os identificadores do meu contexto são strings (como `"water"` ou gerados via `crypto.randomUUID()`), posso aplicar a comparação `h.id === habitId` sem necessidade de conversão de tipo.

---

## M3 — Além da classe `active`, como o `NavLink` informa que está ativo?

**Resposta:**
Além de colocar automaticamente a classe `active`, o `<NavLink>` injeta o atributo `aria-current="page"` na tag `<a>` inspecionada no DevTools, sinalizando para leitores de tela qual é a página atual. A prop `end` garante que o link só fique ativo se a URL terminar exatamente ali. Sem o `end` no link da raiz (`/`), o botão "Hoje" ficaria marcado o tempo todo, já que todas as rotas (como `/novo` ou `/habitos`) começam com a barra.

**Fonte:** https://reactrouter.com/api/components/NavLink

**No meu código:** Uso o `<NavLink to="/" end>` no menu do `AppLayout.jsx` para garantir que o estilo de aba ativa alterne corretamente e não fique travado na página inicial.

---

## M4 — O que a prop `replace` muda no `Navigate`?

**Resposta:**
A prop `replace` no `<Navigate>` instrui o navegador a substituir a entrada atual na pilha de histórico em vez de empilhar uma nova URL. Sem o `replace`, o usuário redirecionado ao tentar voltar no navegador cai em um loop infinito, pois é arremessado de volta para a rota de destino.

**Fonte:** https://reactrouter.com/api/components/Navigate

**No meu código:** No arquivo `src/components/ProtectedProgressRoute.jsx`, utilizo `<Navigate to="/novo" replace />` para que acessos à rota `/progresso` sem hábitos cadastrados redirecionem o usuário para `/novo` mantendo a navegação do botão "Voltar" funcional.

---

## M5 — Por que um 404 não rejeita a promessa do `fetch`?

**Resposta:**
A API nativa `fetch()` só rejeita uma Promise (caindo no bloco `catch`) em caso de falhas físicas de rede ou bloqueios de CORS, resolvendo normalmente requisições com respostas de erro HTTP 404 ou 500. Para capturar falhas da API, é indispensável inspecionar a propriedade booleana `response.ok` e lançar um erro manualmente.

**Fonte:** https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

**No meu código:** No arquivo `src/services/habitSuggestions.js`, testo `if (!response.ok)` e lanço uma exceção contendo o status HTTP da resposta para acionar o bloco `catch` na página `SuggestionsPage.jsx`.

---

## M6 — Por que `import.meta.env` e não `process.env` no Vite?

**Resposta:**
No ecossistema Vite, as variáveis de ambiente são lidas através de `import.meta.env` e precisam obrigatoriamente do prefixo `VITE_`. Se uma variável for declarada sem esse prefixo no arquivo `.env`, o Vite a ignora completamente por questões de segurança e seu valor resulta em `undefined` no código do cliente.

**Fonte:** https://vite.dev/guide/env-and-mode

**No meu código:** No arquivo `src/services/habitSuggestions.js`, leio `import.meta.env.VITE_API_BASE_URL` para carregar o endereço base da API consumida e utilizo o operador `||` para fornecer um endereço público reserva.

---

## M7 — Um bug concreto causado por usar o índice como `key`

**Resposta:**
Se usamos o índice (`index`) como `key`, o React se perde totalmente quando a ordem dos itens muda. Como o React usa a chave para identificar quem é o elemento no DOM, se o índice 0 sempre for o primeiro, ele reaproveita o estado do elemento antigo para o dado novo.

**Como reproduzir (pode ser um experimento temporário):**
No experimento, coloquei um input solto no `HabitCard` e digitei "água" no primeiro hábito (Beber água). Ao adicionar um novo hábito no topo da lista, o texto "água" pulou para o cartão novo! Com `key={index}`, o React acha que o cartão `0` é o mesmo e preserva o texto digitado nele, apenas trocando o título por cima. Voltando para `key={habit.id}`, o React rastreia a identidade do cartão, e a anotação desceu corretamente junto com o hábito original.

**Fonte:** https://react.dev/learn/rendering-lists#why-does-react-need-keys

---

## M8 — Por que um efeito parece rodar duas vezes em desenvolvimento?

**Resposta:**
No React 19, o componente `<StrictMode>` roda os efeitos duas vezes de propósito no modo de desenvolvimento (ele monta, desmonta e monta de novo). O objetivo é expor bugs e testar se as funções de limpeza (cleanup) dos efeitos estão funcionando corretamente e não deixando "lixo" para trás.

**Fonte:** https://react.dev/reference/react/useEffect#my-effect-runs-twice-when-the-component-mounts

**No meu código:** No `HabitsContext.jsx`, possuo dois `useEffect`: um sincroniza os hábitos alterados com o `localStorage`, e o outro atualiza o título da aba do navegador com a contagem de hábitos. O efeito do título possui uma função de limpeza (`return () => { ... }`). Quando o StrictMode age, o componente monta e altera o título; depois ele desmonta rapidamente, acionando a função de limpeza que devolve o título original ("My Daily Habits"); por fim, ele monta de novo e reinstala o título com o contador correto.

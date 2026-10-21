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
Quando um `<input>` recebe a prop `value` sem um manipulador `onChange`, o React o converte em um elemento estritamente somente leitura no DOM virtual. Como o React re-renderiza o componente com base no estado e não há função para atualizar esse estado ao digitar, a interface ignora as teclas do usuário e exibe um aviso de alerta no console.

**Fonte:** https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable

**No meu código:** No arquivo `src/components/HabitForm.jsx`, cada campo possui seu respetivo evento `onChange` (`setTitle(event.target.value)` e `setGoal(event.target.value)`), garantindo a atualização do estado local a cada caractere digitado.

---

## M2 — O que `useParams` devolve num segmento que parece número?

**Resposta:**
O hook `useParams()` extrai todos os parâmetros definidos na rota do navegador exclusivamente como cadeias de texto (`string`). Se o identificador no sistema for numérico, a comparação direta com igualdade estrita (`===`) falha silenciosamente caso não haja conversão prévia com `Number()` ou `parseInt()`.

**Fonte:** https://reactrouter.com/api/hooks/useParams

**No meu código:** No arquivo `src/pages/HabitDetailsPage.jsx`, leio `habitId` via `useParams()`. Como os identificadores do meu contexto são strings (como `"water"` ou gerados via `crypto.randomUUID()`), posso aplicar a comparação `h.id === habitId` sem necessidade de conversão de tipo.

---

## M3 — Além da classe `active`, como o `NavLink` informa que está ativo?

**Resposta:**
O componente `NavLink` é uma variação do `Link` que injeta automaticamente a classe CSS `.active` na tag renderizada quando a URL atual coincide com a prop `to`. A prop `end` no link da raiz (`/`) impede que a rota principal permaneça destacada continuamente, pois garante que a correspondência ocorra apenas se o caminho terminar exatamente em `/`.

**Fonte:** https://reactrouter.com/api/components/NavLink

**No meu código:** No arquivo `src/layouts/AppLayout.jsx`, utilizo `<NavLink to="/" end>` no item "Hoje" do menu principal para garantir que o estilo de item ativo alterne corretamente entre as páginas da aplicação.

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
Utilizar o índice do array (`index`) na prop `key` gera bugs visuais e de perda de estado quando itens da lista são reordenados, filtrados ou removidos. O React utiliza a chave para rastrear a identidade de cada nó no DOM virtual; ao alterar a ordem de um array indexado, o React reutiliza instâncias de componentes erradas.

**Como reproduzir (pode ser um experimento temporário):**

**Fonte:** https://react.dev/learn/rendering-lists#why-does-react-need-keys

**No meu código:** Nos arquivos `src/components/HabitList.jsx` e `src/pages/SuggestionsPage.jsx`, atribuo `key={habit.id}` e `key={item.id}` utilizando IDs únicos e imutáveis originados do estado ou da API externa.

---

## M8 — Por que um efeito parece rodar duas vezes em desenvolvimento?

**Resposta:**
No React 18, o componente `<React.StrictMode>` monta, desmonta e remontando intencionalmente os componentes em ambiente de desenvolvimento durante a renderização inicial. Esse comportamento serve para expor efeitos colaterais sem função de limpeza (cleanup) apropriada, como assinaturas pendentes e conexões duplicadas.

**Fonte:** https://react.dev/reference/react/useEffect#my-effect-runs-twice-when-the-component-mounts

**No meu código:** No arquivo `src/main.jsx`, a aplicação é envelopada por `<React.StrictMode>`. Validei que as chamadas no `SuggestionsPage.jsx` dependem do clique do usuário, impedindo que requisições assíncronas sejam disparadas em duplicidade no carregamento.

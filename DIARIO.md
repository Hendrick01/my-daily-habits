# Diário de desenvolvimento

Nome: Hendrick Silva Ferreira

## Para que serve

Duas coisas. Primeira: obriga você a ler a mensagem de erro antes de pedir ajuda,
que é o hábito mais útil que este módulo pode te deixar. Segunda: é a prova de que
o trabalho é seu.

Mínimo **5 entradas**, cada uma com uma **mensagem de erro real** copiada do seu
console ou terminal. Erro inventado aparece na correção.

Se você usou um assistente de IA, registre. Uso registrado não tira ponto.

Na **Etapa 10**, registre também **uma requisição bem-sucedida e uma inválida** observadas no painel **Network**: URL, status e o que você viu.

---

## Registro de uso de IA

**IA (Google Gemini):** Utilizei como apoio para construir a lógica de navegação protegida (Bloco D), para o consumo da API com fetch (Etapa 10) e para me ajudar a formatar o texto deste diário e das respostas das missões. No Bloco D da E9, o código do `ProgressPage` e do `ProtectedProgressRoute` e o texto inicial da M4 vieram prontos do Gemini.

**IA (Claude, da Anthropic, no Claude Code):** usei como tutor durante as etapas E5 a E10. Ele:
- planejou comigo cada etapa (E6 a E10) e revisou o código depois de cada bloco, apontando erros e regressões;
- corrigiu diretamente: a chave `}` sobrando na E5, o `import "./App.css"` que tinha sumido, o `App.css` que foi sobrescrito por engano, a posição das rotas `progresso` e `sugestoes` no `App.jsx`, o texto "BisLoading" na tela de sugestões e a indentação de alguns arquivos;
- criou o `.env.example`, escreveu o `README.md` e ajustou o formato do `RESPOSTAS.md` e deste diário (sem mudar o conteúdo das respostas);
- guiou os experimentos da M1 e da M7;
- fez todos os commits e pushes a meu pedido (por isso eles têm `Co-Authored-By: Claude`).

---

### Entrada 1 — 15/10/2026 22:25

**Etapa:** E5

**O que eu estava fazendo:**
Escrevendo o `handleSubmit` do formulário controlado no `App.jsx`. Ficou uma chave `}` a mais solta logo depois da função.

**Mensagem exata (copiada, não digitada de memória):**
```
[builtin:vite-transform] A 'return' statement can only be used within a function body.
  src/App.jsx:56:3
```

**O que eu esperava que acontecesse:**
Que o Vite compilasse o projeto sem erros.

**O que eu tentei, em ordem:**
1. Segui a dica de contar as chaves entre o fim do `handleSubmit` e o `return`.
2. Pedi ao Claude para corrigir.

**Como resolvi (ou onde ainda estou travado):**
O Claude removeu a chave extra da linha 54. Ela fechava o `App` antes da hora, então o `return` ficava fora de qualquer função. Depois disso, o build passou.

**Onde procurei:** Claude (IA), revisão e correção.

---

### Entrada 2 — 17/10/2026 18:33

**Etapa:** E9

**O que eu estava fazendo:**
Após separar as rotas e criar o App.jsx, tentei compilar o projeto rodando npm run build.

**Mensagem exata (copiada, não digitada de memória):**
```
[UNRESOLVED_IMPORT] Could not resolve './pages/HabitsPage' in src/App.jsx Module not found.
```

**O que eu esperava que acontecesse:**
A compilação bem-sucedida do aplicativo.

**O que eu tentei, em ordem:**
1. Verifiquei se o caminho do import estava correto no App.jsx.
2. Abri a pasta src/pages/ para verificar os arquivos presentes.

**Como resolvi (ou onde ainda estou travado):**
Notei que eu tinha esquecido de criar o arquivo físico HabitsPage.jsx. Criei o arquivo, adicionei o código do componente e refiz o build com sucesso.

**Onde procurei:** Terminal e apontamento do Claude (IA).

---

### Entrada 3 — 21/10/2026 10:54

**Etapa:** E9

**O que eu estava fazendo:**
Adicionando a rota `/progresso`, com o `ProtectedProgressRoute`, no `App.jsx`. A `<Route>` foi colada antes do `<Routes>`, fora dele.

**Mensagem exata (copiada, não digitada de memória):**
```
[builtin:vite-transform] Adjacent JSX elements must be wrapped in an enclosing tag.
  src/App.jsx:24:5
```
O lint mostrou a mesma coisa, com a sugestão: `Did you want a JSX fragment <>...</>?`

**O que eu esperava que acontecesse:**
Que a rota nova funcionasse junto com as outras.

**O que eu tentei, em ordem:**
1. Pedi ao Claude para fazer os ajustes necessários.

**Como resolvi (ou onde ainda estou travado):**
O Claude moveu a `<Route path="progresso">` para dentro do `<Routes>`, ao lado de `novo` e `sobre`. Ele explicou que a sugestão do fragment faria compilar, mas quebraria em execução, porque uma `<Route>` só funciona dentro de `<Routes>`. O mesmo erro voltou às 11:18, quando colei a rota `sugestoes` da E10, e foi resolvido do mesmo jeito.

**Onde procurei:** Claude (IA).

---

### Entrada 4 — 16/10/2026 11:05

**Etapa:** E7

**O que eu estava fazendo:**
Rodando o comando npm run lint após criar o arquivo global de contexto.

**Mensagem exata (copiada, não digitada de memória):**
```
src/context/HabitsContext.jsx:25:14: warning react(only-export-components): Fast refresh only works when a file only exports components. Move your React context(s) to a separate file.
```

**O que eu esperava que acontecesse:**
Nenhum aviso no linter.

**O que eu tentei, em ordem:**
1. Pesquisei sobre o comportamento do Fast Refresh do Vite.
2. Pensei em separar o Contexto e o Provider em dois arquivos distintos.

**Como resolvi (ou onde ainda estou travado):**
A estrutura da atividade exige manter a função do Context e o componente Provider no mesmo arquivo. Mantive o código como estava e registrei a convivência amigável com o aviso.

**Onde procurei:** Explicação do Claude (IA).

---

### Entrada 5 — 21/10/2026 15:45

**Etapa:** Experimento M7

**O que eu estava fazendo:**
Forçando um bug prático ao usar índices de array (index) como key na lista do React.

**Mensagem exata (copiada, não digitada de memória):**
```
(Sem erro no console)
```
Mas gerou um bug visual assustador: o texto que eu digitei num input não-controlado de um cartão pulou para o cartão recém-criado quando a lista mudou de ordem e empurrou os antigos para baixo.

**O que eu esperava que acontecesse:**
Que o texto digitado ficasse preso ao hábito correspondente.

**O que eu tentei, em ordem:**
1. Troquei key={habit.id} por key={index} e inseri um input temporário.
2. Adicionei um hábito novo forçando-o a entrar no topo da lista usando [novoHabito, ...currentHabits].

**Como resolvi (ou onde ainda estou travado):**
Após observar a reciclagem incorreta do DOM feita pelo React, desfiz as alterações e devolvi o habit.id à prop key. O React voltou a rastrear os elementos pela sua verdadeira identidade.

**Onde procurei:** Claude (IA), experimento guiado.

---

### Network (Etapa 10)

**Requisição bem-sucedida:**
- URL: https://jsonplaceholder.typicode.com/todos?_limit=6
- Status: 200 OK
- O que vi: Com o app aberto em /sugestoes, deixei a aba Network (F12) aberta e cliquei no botão. Vi a requisição GET surgir na lista. Clicando nela e indo na aba "Response", observei o array perfeito com os 6 objetos JSON solicitados, e a tela renderizou os títulos corretamente logo em seguida.

**Requisição inválida:**
- URL: https://jsonplaceholder.typicode.com/todoserro?_limit=6 (caminho alterado propositalmente no código para simular o 404)
- Status: 404 Not Found
- O que vi: No painel Network, a linha da requisição ficou vermelha alertando o status 404. O painel "Response" me devolveu apenas um objeto vazio {}. Na tela do app, a minha lógica de validação (if (!response.ok)) interceptou esse problema e trocou o status do layout para mostrar a mensagem de erro vermelha ao usuário.

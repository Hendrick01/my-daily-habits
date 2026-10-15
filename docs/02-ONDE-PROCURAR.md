# Onde procurar

Este arquivo entrega a **página certa**, não a resposta. Use a coluna "Dúvida" para localizar o assunto e abra a documentação oficial indicada.

> **Aviso honesto:** os endereços abaixo foram reunidos a partir da documentação oficial e **não foram abertos um a um nesta revisão**. Se algum falhar, procure o **nome da página** no site oficial.

## React — react.dev

| Dúvida | Página | URL |
| --- | --- | --- |
| Primeiros componentes | Your First Component | https://pt-br.react.dev/learn/your-first-component |
| Renderização condicional | Conditional Rendering | https://pt-br.react.dev/learn/conditional-rendering |
| Listas e `key` · M7 | Rendering Lists | https://pt-br.react.dev/learn/rendering-lists |
| Props | Passing Props to a Component | https://pt-br.react.dev/learn/passing-props-to-a-component |
| Eventos | Responding to Events | https://pt-br.react.dev/learn/responding-to-events |
| Estado | State: A Component's Memory | https://pt-br.react.dev/learn/state-a-components-memory |
| Atualizar objetos | Updating Objects in State | https://pt-br.react.dev/learn/updating-objects-in-state |
| Atualizar arrays | Updating Arrays in State | https://pt-br.react.dev/learn/updating-arrays-in-state |
| Compartilhar estado | Sharing State Between Components | https://pt-br.react.dev/learn/sharing-state-between-components |
| Contexto | Passing Data Deeply with Context | https://pt-br.react.dev/learn/passing-data-deeply-with-context |
| Efeitos | Synchronizing with Effects | https://pt-br.react.dev/learn/synchronizing-with-effects |
| Quando não usar efeito | You Might Not Need an Effect | https://pt-br.react.dev/learn/you-might-not-need-an-effect |
| `useState` | useState | https://pt-br.react.dev/reference/react/useState |
| `useEffect` | useEffect | https://pt-br.react.dev/reference/react/useEffect |
| `useContext` | useContext | https://pt-br.react.dev/reference/react/useContext |
| Efeito em desenvolvimento · M8 | StrictMode | https://pt-br.react.dev/reference/react/StrictMode |
| Campo controlado · M1 | input | https://pt-br.react.dev/reference/react-dom/components/input |

## React Router — reactrouter.com

| Dúvida | Página | URL |
| --- | --- | --- |
| Instalação declarativa | Installation | https://reactrouter.com/start/declarative/installation |
| Rotas e rotas aninhadas | Routing | https://reactrouter.com/start/declarative/routing |
| Navegação | Navigating | https://reactrouter.com/start/declarative/navigating |
| Valores da URL · M2 | URL Values | https://reactrouter.com/start/declarative/url-values |
| Parâmetros · M2 | useParams | https://reactrouter.com/api/hooks/useParams |
| Navegação por código | useNavigate | https://reactrouter.com/api/hooks/useNavigate |
| Link ativo · M3 | NavLink | https://reactrouter.com/api/components/NavLink |
| Redirecionamento · M4 | Navigate | https://reactrouter.com/api/components/Navigate |
| Layout e `Outlet` | Outlet | https://reactrouter.com/api/components/Outlet |

## MDN — developer.mozilla.org

| Dúvida | Página | URL |
| --- | --- | --- |
| Fetch e rejeição de promessa · M5 | Using the Fetch API | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch |
| Verificar status | Response.ok | https://developer.mozilla.org/en-US/docs/Web/API/Response/ok |
| Ler status | Response.status | https://developer.mozilla.org/en-US/docs/Web/API/Response/status |
| Ler JSON da resposta | Response.json | https://developer.mozilla.org/en-US/docs/Web/API/Response/json |
| Armazenamento local | Window.localStorage | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage |
| Ler JSON salvo | JSON.parse | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse |
| Gerar id | Crypto.randomUUID | https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID |
| Transformar arrays | Array.prototype.map | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map |
| Filtrar arrays | Array.prototype.filter | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter |

## Vite — vite.dev

| Dúvida | Página | URL |
| --- | --- | --- |
| Visão geral | Guide | https://vite.dev/guide/ |
| Variáveis de ambiente · M6 | Env Variables and Modes | https://vite.dev/guide/env-and-mode |
| Build | Building for Production | https://vite.dev/guide/build |
| Comandos | Command Line Interface | https://vite.dev/guide/cli |

## Git e GitHub — docs.github.com

| Dúvida | Página | URL |
| --- | --- | --- |
| O que é Git | About Git | https://docs.github.com/en/get-started/using-git/about-git |
| Ignorar arquivos | Ignoring files | https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files |

## API de teste

| Dúvida | Página | URL |
| --- | --- | --- |
| Guia da API | JSONPlaceholder Guide | https://jsonplaceholder.typicode.com/guide/ |
| Endpoint usado para sugestões | Todos | https://jsonplaceholder.typicode.com/todos |

## Como ler documentação sem se perder

1. Procure primeiro na **referência** da API, não no tutorial. A referência lista
   atributos e comportamento; o tutorial conta uma história.
2. Leia o **exemplo de código** da página antes do texto. Às vezes ele já responde.
3. Procure a palavra exata da sua mensagem de erro dentro da página (Ctrl+F).
4. Se a página em português estiver incompleta, troque `/pt-br/` por `/en/`.
   A versão inglesa costuma estar mais atualizada.
5. Desconfie de tutorial de blog com mais de dois anos. Especialmente em roteamento:
   exemplos antigos usam outras APIs e outros pacotes. Use a documentação da
   **versão que está instalada** no seu projeto (veja o `package.json`).

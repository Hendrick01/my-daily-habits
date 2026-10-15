# Glossário de erros

Use este arquivo para interpretar a mensagem e montar um experimento. Ele não entrega a correção.

## `X is not defined`

**O que a mensagem está dizendo:** um nome foi usado onde o JavaScript não encontra uma definição visível para ele.

**Três lugares para olhar, em ordem:**
1. o import do arquivo que apresenta o erro
2. o export do arquivo de origem
3. a grafia do nome e do caminho do arquivo

**Como provar:** isole a linha indicada pelo console e confira, um por um, se o nome existe na origem e chega ao arquivo atual.

## Tela branca

**O que a mensagem está dizendo:** a renderização foi interrompida por uma exceção antes de a interface conseguir aparecer.

**Três lugares para olhar, em ordem:**
1. a primeira exceção no console do navegador
2. o arquivo e a linha apontados nessa primeira exceção
3. a última mudança feita antes da tela desaparecer

**Como provar:** recarregue com o console aberto e anote apenas o primeiro erro; volte temporariamente a última mudança e veja se a tela reaparece.

## `Each child in a list should have a unique "key" prop`

**O que a mensagem está dizendo:** uma lista renderizada tem itens sem uma identidade estável que o React consiga acompanhar.

**Três lugares para olhar, em ordem:**
1. o ponto em que a lista é transformada em elementos
2. o valor usado como identidade de cada item
3. se esse valor continua o mesmo quando a ordem da lista muda

**Como provar:** observe os dados de dois ou três itens antes e depois de uma mudança na lista e verifique se a identidade escolhida continua pertencendo ao mesmo item.

## `Cannot read properties of undefined (reading '...')`

**O que a mensagem está dizendo:** alguma expressão tentou acessar uma propriedade de um valor que naquele momento era `undefined`. O nome entre aspas é a propriedade que se tentou ler (por exemplo `trim` ou `length`).

**Três lugares para olhar, em ordem:**
1. a linha exata indicada no stack trace
2. a origem da prop ou do valor de estado usado nessa linha
3. a grafia do nome entre quem envia e quem recebe o dado

**Como provar:** inspecione o valor imediatamente antes do acesso e confirme se ele já existe no momento da renderização. Se o valor **sumiu depois de uma atualização de estado**, olhe como o objeto de estado foi reconstruído.

## Erro ao usar o contexto fora do Provider

**O que a mensagem está dizendo:** um componente tentou ler o contexto sem estar dentro do Provider que o fornece. Se você escreveu uma mensagem própria para esse caso, é ela que aparece. Sem ela, costuma aparecer um erro de desestruturação de `null`.

**Três lugares para olhar, em ordem:**
1. o componente que aparece no topo útil do stack trace
2. a árvore acima dele e o ponto em que o Provider envolve a aplicação
3. o contexto importado e o contexto realmente fornecido

**Como provar:** observe o valor retornado pelo `useContext` antes de usá-lo; se ele estiver `null`, a hipótese está confirmada.

## Campo não aceita digitação

**O que a mensagem está dizendo:** o React avisa, no console, que um campo recebeu `value` mas não recebeu um jeito de atualizá-lo. Em desenvolvimento, a mensagem começa com `You provided a value prop to a form field without an onChange handler`.

**Três lugares para olhar, em ordem:**
1. se o campo tem `value` e `onChange` ao mesmo tempo
2. se o `onChange` realmente atualiza o estado do qual `value` depende
3. se o atributo `name` do campo corresponde à chave que o handler atualiza

**Como provar:** digite no campo com o console aberto e observe se o estado muda a cada tecla.

## `A component is changing a controlled input to be uncontrolled`

**O que a mensagem está dizendo:** o valor do campo deixou de vir do estado (ficou `undefined`) depois de ter vindo. O campo passou de controlado a não controlado.

**Três lugares para olhar, em ordem:**
1. de onde vem o `value` do campo
2. se alguma atualização de estado pode ter **apagado** a chave que alimenta o campo
3. o valor inicial do estado do formulário

**Como provar:** imprima o estado do formulário a cada digitação e veja em que momento uma chave desaparece.

## Página recarrega ao enviar

**O que a mensagem está dizendo:** o navegador executou o comportamento padrão do envio de formulário.

**Três lugares para olhar, em ordem:**
1. o manipulador do `onSubmit` do formulário
2. se ele impede o comportamento padrão **antes** de qualquer outra coisa
3. se o botão de envio está dentro do `<form>`

**Como provar:** observe a barra de endereço no momento do envio; se ela ganhar `?` e os nomes dos campos, o envio padrão aconteceu.

## `Adjacent JSX elements must be wrapped in an enclosing tag`

**O que a mensagem está dizendo:** um componente devolveu dois elementos irmãos sem um elemento (ou Fragment) em volta.

**Três lugares para olhar, em ordem:**
1. o `return` do componente indicado
2. o que existe antes e depois do elemento principal
3. se um elemento foi colado fora dos parênteses do `return`

**Como provar:** conte os elementos de nível mais alto dentro do `return`; deve haver um só.

## `Failed to resolve import` / `Could not resolve`

**O que a mensagem está dizendo:** um `import` aponta para um arquivo que o Vite não encontra.

**Três lugares para olhar, em ordem:**
1. o caminho relativo (`./`, `../`) e a pasta de cada arquivo
2. a grafia e as **maiúsculas** do nome do arquivo
3. se o arquivo existe mesmo na pasta indicada

**Como provar:** abra o Explorer do editor e siga o caminho do `import`, pasta por pasta.

## `Invalid hook call`

**O que a mensagem está dizendo:** um Hook foi chamado num lugar em que as regras de Hooks não permitem, ou a aplicação está com uma combinação inválida de React.

**Três lugares para olhar, em ordem:**
1. o local exato de cada chamada de Hook no componente envolvido
2. se alguma chamada está dentro de condição, laço ou função comum
3. as versões e a quantidade de instalações do React no projeto

**Como provar:** reduza o componente até localizar a chamada cuja posição depende de uma condição ou que não está no corpo de um componente.

## Loop infinito de renderização

**O que a mensagem está dizendo:** uma atualização está causando nova renderização que dispara a mesma atualização repetidamente. **A página pode travar.**

**Três lugares para olhar, em ordem:**
1. efeitos que atualizam estado
2. dependências desses efeitos
3. handlers que podem estar sendo executados durante a renderização

**Como provar:** pare a execução, observe qual valor muda em toda renderização e remova temporariamente uma única atualização para identificar o ciclo. **Não provoque esse erro de propósito.**

## Variável de ambiente `undefined`

**O que a mensagem está dizendo:** o valor esperado não foi exposto ao código do navegador na forma em que o Vite disponibiliza variáveis.

**Três lugares para olhar, em ordem:**
1. o nome da variável no arquivo de ambiente
2. o lugar em que ela é lida no código
3. se o servidor de desenvolvimento foi iniciado antes ou depois da última alteração no ambiente

**Como provar:** confira o valor lido em tempo de execução e reinicie o servidor apenas como experimento para comparar o resultado.

## Mensagem de erro de HTTP na tela (por exemplo, "Falha HTTP: 404")

**O que a mensagem está dizendo:** a requisição **chegou** ao servidor e a resposta veio com um status de erro. Se a mensagem for outra (por exemplo, `Failed to fetch`, cujo texto varia conforme o navegador), a requisição **nem chegou** a completar.

**Três lugares para olhar, em ordem:**
1. o painel **Network**: URL chamada e status
2. o ponto do serviço em que o status é verificado
3. a diferença entre erro de rede e erro de status

**Como provar:** repita a busca com um endereço inválido e compare a linha do painel Network com a mensagem que o app mostra.

## `No routes matched location`

**O que a mensagem está dizendo:** a URL atual não correspondeu a nenhum caminho declarado na árvore de rotas. *(Texto não verificado nesta revisão; o conceito é o mesmo em qualquer versão.)*

**Três lugares para olhar, em ordem:**
1. a URL exata mostrada no navegador
2. os caminhos declarados na árvore de rotas
3. a relação entre rota pai, rota filha e segmentos dinâmicos

**Como provar:** compare, segmento por segmento, a URL atual com a árvore de rotas e teste primeiro o caminho pai antes do filho.

## Navegação fora do Router

**O que a mensagem está dizendo:** um recurso de navegação foi usado por um componente que não está sendo renderizado dentro do contexto de roteamento. *(Texto exato não verificado nesta revisão.)*

**Três lugares para olhar, em ordem:**
1. o componente que chama a navegação
2. a árvore de renderização acima desse componente
3. o ponto em que o `BrowserRouter` envolve a aplicação

**Como provar:** desenhe ou inspecione a árvore de componentes e confirme se o componente problemático está realmente abaixo do Router.

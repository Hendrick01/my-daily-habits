# Guia de etapas

Para cada etapa: **o marco**, **o que a apostila não te deu**, **perguntas para se fazer antes de codar**, **como testar** e **o sinal de que você terminou**. Os critérios de aceite completos estão no `ATIVIDADE.md`: eles são a régua.

> Este guia diz **o que verificar**, nunca **como fazer**. O "como" está na apostila, no seu código das aulas e na documentação oficial.

---

## Antes de começar: o ponto de partida

Confirme que o seu `my-daily-habits` está de pé:

- [ ] `npm run dev` abre sem tela branca
- [ ] os três hábitos aparecem a partir de um arquivo de dados
- [ ] clicar no botão de um hábito alterna **só** aquele hábito
- [ ] o contador "X de Y hábitos concluídos." acompanha os cliques
- [ ] o console está sem erros nem avisos de `key`

Se algo falhar, **conserte agora**. Comite: `chore: prepara a atividade final`.

---

## E5 · Formulário controlado (10 pts)

**Marco da etapa:** o usuário cria os próprios hábitos.
**Capítulo da apostila:** 5

### O que a apostila não te deu

Missões: **M1** (o que acontece com `value` sem `onChange`) e **M7** (o bug do índice como `key`).

> **Dica da M7:** esse bug **não aparece sozinho** neste projeto (não há exclusão, e o cadastro entra no fim da lista). Para reproduzi-lo, monte um **experimento temporário** e depois desfaça tudo: pense em algo que **guarde estado dentro do cartão** e numa mudança que **altere a posição** dos itens.

### Perguntas para se fazer antes de codar

- Onde vai morar o texto digitado enquanto a pessoa ainda não enviou?
- Os dois campos pertencem ao mesmo formulário: vale um estado só ou dois?
- Em que ordem acontecem: impedir o envio padrão, limpar os espaços, validar, adicionar, limpar o formulário?
- Se a validação falhar, o que a pessoa **não** pode perder?
- O que identifica um hábito: o título, a posição na lista ou outra coisa?

### Como testar

1. Envie o formulário **vazio**.
2. Envie com **só espaços** nos dois campos.
3. Preencha **só um** campo e envie. O que ficou digitado?
4. Preencha os dois e envie. Conferiu: cartão novo, campos limpos, mensagem de erro sumiu, contador atualizado?
5. Marque o hábito novo como concluído.
6. Cadastre **dois** hábitos com o **mesmo título**. Apareceram dois cartões, sem aviso de `key` no console?
7. Aperte **F5**. O que aconteceu com os hábitos novos? *(Isso muda na próxima etapa.)*

### Sinal de que você terminou

Você consegue cadastrar, ver o hábito novo alternando e **explicar por que o campo é controlado**. Comite: `feat: adiciona formulário de hábitos`.

---

## E6 · Efeitos, persistência e limpeza (10 pts)

**Marco da etapa:** os hábitos sobrevivem ao recarregamento.
**Capítulo da apostila:** 6

### O que a apostila não te deu

Missão: **M8** (por que o efeito parece rodar duas vezes em desenvolvimento).

### Perguntas para se fazer antes de codar

- O navegador guarda texto ou listas? O que precisa acontecer na ida e na volta?
- Quantas vezes a leitura inicial **precisa** rodar?
- O que pode estar dentro da chave do armazenamento além de uma lista válida?
- Que valores o efeito de salvar lê? E o do título?
- O que o título da aba precisa **devolver** quando o efeito for refeito ou o componente sair?

### Como testar

1. Cadastre um hábito e aperte **F5**.
2. Alterne um hábito e aperte **F5**.
3. Abra **F12 → Application → Local Storage** e olhe a sua chave.
4. Troque o valor da chave por `{oops` e aperte F5. A tela abriu? O que aconteceu com o valor guardado?
5. Troque o valor por um objeto qualquer (que não seja uma lista) e aperte F5.
6. Troque o valor por uma lista **vazia** e aperte F5. O que a tela mostra? Isso é um erro?
7. Olhe a **aba do navegador** enquanto alterna e cadastra.
8. Deixe o console aberto: sem erros e sem avisos.

### Sinal de que você terminou

Qualquer valor estranho no armazenamento **não derruba** a tela, e você consegue justificar **cada item** de cada array de dependências. Comite: `feat: persiste hábitos no navegador`.

---

## E7 · Contexto (15 pts)

**Marco da etapa:** o estado deixa de passar de mão em mão.
**Capítulo da apostila:** 7

### O que a apostila não te deu

Nenhuma missão. O desafio aqui é **decidir** quem consome o contexto e o que continua com props.

### Perguntas para se fazer antes de codar

- Quem precisa saber dos hábitos? Quem só precisa de **um** hábito?
- O que o Provider precisa expor? O total de concluídos precisa ser guardado?
- O Provider precisa ficar acima de quem?
- O que deve acontecer se alguém usar o contexto sem o Provider?

### Como testar

1. Repita **todos** os testes das etapas E5 e E6. Algo quebrou?
2. **Apague temporariamente** o Provider do `main.jsx` e recarregue. Qual é a mensagem? Ela diz o que está errado?
3. Procure no seu código um componente que recebe uma prop **só para entregá-la a outro**. Ainda existe?
4. Confira se o `App` ainda guarda estado de hábitos.

### Sinal de que você terminou

Tudo funciona como antes, o erro fora do Provider é **claro**, e você consegue explicar por que o Provider fica onde fica. Comite: `refactor: compartilha hábitos com contexto`.

---

## E8 · Páginas e rotas (15 pts)

**Marco da etapa:** a aplicação ganha páginas e endereços.
**Capítulo da apostila:** 8

### O que a apostila não te deu

Missão: **M3** (outra forma de o `NavLink` informar que está ativo).

### Perguntas para se fazer antes de codar

- O que muda, para o navegador, entre um link comum e um link do roteador?
- Quem fica **fora** das rotas (e precisa continuar valendo em todas as páginas)?
- O que deve aparecer quando o endereço não existe?
- Onde fica o título da aba, para continuar funcionando em todas as páginas?

### Como testar

1. Vá de `/` a `/novo`, cadastre um hábito e volte à lista. O hábito está lá?
2. Digite `/sobre` na barra de endereço e aperte **F5**.
3. Digite um endereço que não existe.
4. Observe o menu: quantos links ficam destacados em cada página? E na página não encontrada?
5. Troque de página várias vezes olhando a aba do navegador.

### Sinal de que você terminou

Navegar não recarrega e não perde dados, e você sabe dizer por que o estado sobrevive à troca de página. Comite: `feat: adiciona rotas principais`.

---

## E9 · Parâmetros, layouts e rota protegida (20 pts)

**Marco da etapa:** a URL passa a carregar informação, e o app ganha estrutura.
**Capítulo da apostila:** 9

### O que a apostila não te deu

Missões: **M2** (o que `useParams` devolve) e **M4** (o que `replace` muda no `Navigate`).

### Perguntas para se fazer antes de codar

- O que a URL do detalhe precisa conter para identificar **um** hábito?
- Que tipo de valor chega da URL, e que tipo tem o `id` do seu hábito?
- O que o usuário deve ver quando o `id` não existe?
- O que vai dentro do layout e o que fica em cada página? Onde entra o `Outlet`?
- Voltar no histórico e ir a um destino fixo: quando cada um faz sentido?
- Depois de cadastrar, **quem** decide para onde ir: o formulário ou a página?
- Em `/progresso`, o que acontece quando não há hábitos? E se a conta dividir por zero?

### Como testar

1. Abra o detalhe de um hábito e use o botão **Voltar**.
2. Digite `/habitos/nao-existe`.
3. Veja se o cabeçalho e o menu aparecem **uma vez só** em todas as páginas.
4. Cadastre um hábito e observe para onde você é levado.
5. Deixe a aplicação **sem hábitos** (você pode gravar uma lista vazia no Local Storage) e abra `/progresso`. Para onde vai? Aperte o botão voltar do navegador: o que acontece?
6. Com hábitos, confira a porcentagem. Tem `NaN` em algum lugar?

### Sinal de que você terminou

Você consegue explicar a diferença entre voltar e ir a um destino fixo, e por que a proteção de rota **não é segurança de verdade**. Comite: `feat: adiciona rotas avançadas`.

---

## E10 · Rede (20 pts)

**Marco da etapa:** o app conversa com uma API externa.
**Capítulo da apostila:** 10

### O que a apostila não te deu

Missões: **M5** (por que o 404 não rejeita o `fetch`) e **M6** (`import.meta.env`).

### Perguntas para se fazer antes de codar

- Onde mora o endereço da API? Quem lê esse endereço?
- Qual é a diferença entre erro de **rede** e erro de **status**?
- O que o serviço devolve para a tela? Precisa devolver tudo o que a API manda?
- Quais mensagens a tela precisa mostrar, e em que momentos?
- O que acontece com a lista quando a busca falha?
- O que o prefixo `VITE_` garante, e o que **não** garante?

### Como testar

1. Busque as sugestões. Contou 6? O que a mensagem disse?
2. Troque o endereço da API por um **inválido** e busque de novo. Compare o painel **Network** com a mensagem do app.
3. Desligue a rede do computador e busque outra vez.
4. Confira se existe algum `fetch` dentro de um componente de tela.
5. Confira se `.env` aparece no `git status`.

### Sinal de que você terminou

Cada estado da tela aparece **sem se sobrepor**, a mensagem de erro informa o status, e você anotou no `DIARIO.md` uma requisição boa e uma ruim vistas no Network. Comite: `feat: consome API de sugestões`.

---

## Entrega (10 pts)

**Marco da etapa:** o projeto é explicável por quem o lê.

### Perguntas para se fazer antes de entregar

- Um colega consegue instalar e rodar o projeto só com o seu `README.md`?
- O `RESPOSTAS.md` tem a **URL** em cada missão?
- O `DIARIO.md` tem erros **reais**, copiados do console?
- O seu histórico conta a história do projeto, ou é um commit só?
- Os três comentários em primeira pessoa e a página `/sobre` estão no código?

### Como testar

1. Faça um clone limpo do seu repositório em outra pasta, rode `npm install` e `npm run dev`.
2. Rode `npm run build`. Terminou sem erro?
3. Rode `npm run preview` e abra **cada uma das oito rotas** por clique e **digitando** o endereço.
4. Rode `git status`: está limpo? `.env` não aparece?
5. Confira o histórico: pelo menos **8 commits** descritivos?

### Sinal de que você terminou

Você abriu o seu código no projetor, **sem consulta**, e conseguiu responder três perguntas sobre decisões suas. Comite: `docs: finaliza entrega e documentação`.

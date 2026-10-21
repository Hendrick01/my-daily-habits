# My Daily Habits — painel do Hendrick

> ✍️ **Escreva aqui, com suas palavras, 2 ou 3 frases:** o que o app faz e para quem ele serve.

## Requisitos

- **Node.js 22.22 ou superior** (exigido pelo React Router usado no projeto)
- **npm** (já vem junto com o Node)

Para conferir a versão instalada:

```bash
node -v
```

## Instalação

```bash
git clone https://github.com/Hendrick01/my-daily-habits.git
cd my-daily-habits
npm install
```

### Variável de ambiente

O endereço da API de sugestões vem da variável `VITE_API_BASE_URL`. Para configurá-la, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

O `.env` não vai para o Git. Se ele não existir, o app usa um endereço padrão (`https://jsonplaceholder.typicode.com`), então o projeto funciona mesmo sem essa etapa.

## Execução

```bash
npm run dev
```

O terminal mostra o endereço local, normalmente `http://localhost:5173`.

## Build

Gerar a versão de produção:

```bash
npm run build
```

Testar a versão gerada:

```bash
npm run preview
```

O endereço aparece no terminal, normalmente `http://localhost:4173`.

Verificar o código com o lint:

```bash
npm run lint
```

## Funcionalidades

| Rota | O que faz |
| --- | --- |
| `/` | Mostra o contador "X de Y hábitos concluídos." e a lista de hábitos do dia |
| `/novo` | Cadastro de hábito com validação; após cadastrar, volta para o início |
| `/habitos` | Lista completa de hábitos |
| `/habitos/:habitId` | Detalhe de um hábito (título, meta e status), com botão Voltar |
| `/progresso` | Porcentagem de hábitos concluídos; sem hábitos, redireciona para `/novo` |
| `/sugestoes` | Busca 6 sugestões de hábitos numa API externa ao clicar no botão |
| `/sobre` | Sobre o projeto |
| qualquer outro endereço | Página não encontrada |

Além disso:

- Cada hábito pode ser marcado como concluído ou pendente.
- Os hábitos ficam salvos no navegador (`localStorage`) e sobrevivem ao recarregamento da página.
- Se os dados salvos estiverem corrompidos, o app volta aos hábitos iniciais sem quebrar a tela.
- O título da aba mostra o progresso, no formato "X/Y hábitos concluídos".

## Tecnologias

- React 19
- Vite 8
- React Router 7
- API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com)

## Autor

Hendrick Silva Ferreira — Capacitação em Desenvolvimento Full Stack · ITEAM · Boa Vista/RR · 2026
Professor: Esp. Virgílio do Rego Monteiro Borges Junior

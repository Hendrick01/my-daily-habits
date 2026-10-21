# My Daily Habits — painel do Hendrick

Aplicativo web para acompanhar hábitos diários: você cadastra hábitos com uma meta, marca o que concluiu no dia e acompanha a porcentagem de progresso. É feito para quem quer criar uma rotina e ver a evolução de forma simples, com os dados salvos no próprio navegador, sequências de dias seguidos e uma página de sugestões de hábitos. Projeto final do módulo de React da Capacitação em Desenvolvimento Full Stack do ITEAM.

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

O `.env` não vai para o Git. Com a variável vazia (ou sem `.env`), as sugestões vêm do próprio site, do arquivo `public/api/sugestoes.json`, então o projeto funciona mesmo sem essa etapa.

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

Verificar o código com o lint e rodar os testes:

```bash
npm run lint
npm test
```

## Funcionalidades

| Rota | O que faz |
| --- | --- |
| `/` | Saudação, barra de progresso, o contador "X de Y hábitos concluídos." e a lista do dia |
| `/novo` | Cadastro com validação e ideias rápidas de um clique; após cadastrar, volta para o início |
| `/habitos` | Lista completa com filtro (todos, pendentes, concluídos) e backup dos dados |
| `/habitos/:habitId` | Detalhe: sequência, total de dias, últimos 7 dias (clicáveis), editar e excluir |
| `/progresso` | Anel de porcentagem, gráfico da semana e maior sequência; sem hábitos, redireciona para `/novo` |
| `/sugestoes` | Sorteia 6 sugestões de hábitos ao clicar no botão, com opção de adicionar |
| `/sobre` | Sobre o projeto |
| qualquer outro endereço | Página não encontrada |

Além disso:

- Cada hábito guarda os dias em que foi feito: a lista recomeça sozinha a cada dia, inclusive com o app aberto na virada da meia-noite.
- Dá para marcar ou desmarcar dias passados, para corrigir um esquecimento.
- Os hábitos ficam salvos no navegador (`localStorage`); o backup exporta e importa tudo num arquivo JSON.
- Se os dados salvos estiverem corrompidos, o app volta aos hábitos iniciais sem quebrar a tela.
- Tema claro e escuro, que segue o sistema e lembra a escolha.
- O título da aba mostra o progresso, no formato "X/Y hábitos concluídos".

## Tecnologias

- React 19
- Vite 8
- React Router 7
- CSS puro com variáveis (sem bibliotecas de UI)

## Autor

Hendrick Silva Ferreira — Capacitação em Desenvolvimento Full Stack · ITEAM · Boa Vista/RR · 2026
Professor: Esp. Virgílio do Rego Monteiro Borges Junior

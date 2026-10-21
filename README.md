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

### Sincronização e lembretes (opcional)

Sem as variáveis `VITE_SUPABASE_*`, o app funciona só no navegador. Com elas, ganha conta (e-mail e senha), sincronização entre aparelhos e lembrete diário por notificação. A parte de servidor fica em `supabase/`:

- `migrations/`: tabelas `habits` e `push_subscriptions`, com RLS (cada usuário só acessa as próprias linhas) e o agendamento a cada 5 minutos.
- `functions/send-reminders/`: envia os lembretes por Web Push. Usa as mesmas regras de frequência do app (`functions/_shared/`).

Para montar num projeto Supabase seu:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJETO
npx supabase db push
npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=https://seu-site CRON_SECRET=...
npx supabase functions deploy send-reminders --no-verify-jwt --use-api
```

E guarde o mesmo `CRON_SECRET` no Vault com o nome `reminders_cron_secret` (`select vault.create_secret('...', 'reminders_cron_secret');`).

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

## Testes

```bash
npm run lint       # lint
npm test           # regras de datas, frequência e limpeza de dados (Node puro)
npm run test:e2e   # build + testes no navegador (precisa do Google Chrome instalado)
```

Os testes no navegador sobem o `vite preview` e controlam o Chrome em modo headless, sem dependências extras. Para rodar contra o site publicado: `E2E_URL=https://my-daily-habits.vercel.app node tests/e2e.mjs`. O GitHub Actions roda os três a cada push.

## Funcionalidades

| Rota | O que faz |
| --- | --- |
| `/` | Saudação, barra de progresso, o contador "X de Y hábitos concluídos." e só o que está programado para hoje |
| `/novo` | Cadastro com validação, frequência, ícone opcional e ideias rápidas de um clique; após cadastrar, volta para o início |
| `/habitos` | Lista completa com filtro (todos, pendentes, concluídos) e backup dos dados |
| `/habitos/:habitId` | Detalhe: sequência atual e recorde, últimos 7 dias (clicáveis), calendário de 16 semanas, editar e excluir |
| `/progresso` | Anel de porcentagem, gráfico da semana e maior sequência; sem hábitos, redireciona para `/novo` |
| `/sugestoes` | Sorteia 6 sugestões de hábitos ao clicar no botão, com opção de adicionar |
| `/sobre` | Sobre o projeto |
| qualquer outro endereço | Página não encontrada |

Além disso:

- Cada hábito guarda os dias em que foi feito: a lista recomeça sozinha a cada dia, inclusive com o app aberto na virada da meia-noite.
- Frequência por hábito: todo dia, dias da semana (ex.: seg, qua, sex) ou N vezes por semana. A sequência conta os dias programados, ou as semanas em que a meta foi batida.
- Dá para marcar ou desmarcar dias passados, para corrigir um esquecimento.
- Os hábitos ficam salvos no navegador (`localStorage`); o backup exporta e importa tudo num arquivo JSON.
- Se os dados salvos estiverem corrompidos, o app volta aos hábitos iniciais sem quebrar a tela.
- Conta opcional (`/conta`): sincroniza os hábitos entre aparelhos (vence a edição mais recente) e envia um lembrete por dia no horário escolhido, mesmo com o app fechado.
- Tema claro e escuro, que segue o sistema e lembra a escolha.
- Instalável como app (PWA) no celular e no computador; depois da primeira visita, abre sem internet.
- O título da aba mostra o progresso, no formato "X/Y hábitos concluídos".

## Tecnologias

- React 19
- Vite 8
- React Router 7
- Supabase (login, banco Postgres com RLS, Edge Function e pg_cron) e Web Push
- CSS puro com variáveis (sem bibliotecas de UI)

## Autor

Hendrick Silva Ferreira — Capacitação em Desenvolvimento Full Stack · ITEAM · Boa Vista/RR · 2026
Professor: Esp. Virgílio do Rego Monteiro Borges Junior

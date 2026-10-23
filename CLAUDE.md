## Visão geral do código

My Daily Habits é um PWA em React para acompanhar hábitos (agenda, partes do dia, sequências, lembretes por push) e montar treinos (avaliação, plano gerado por objetivo, 79 exercícios com demonstração). Funciona offline com `localStorage` e, com login, sincroniza pelo Supabase.

**Stack:** React 19 + React Router 7 + Vite 8, oxlint, Supabase (Auth, Postgres com RLS, Edge Functions em Deno, pg_cron), Vercel.
**Estrutura:** `src/` (páginas, contextos, serviços, `utils/` com as regras puras), `supabase/` (migrações e Edge Functions; regras compartilhadas em `functions/_shared/`), `public/sw.js` (cache e push), `tests/e2e.mjs`.

Para a arquitetura em detalhe, veja [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md).

**Antes de mexer:**
- Push na `redesign` publica em produção. Não mescle a `redesign` no `main`, que é a entrega do curso.
- Regras de datas, agenda e partes ficam em `supabase/functions/_shared/`; os arquivos de `src/utils/` só reexportam.
- Verifique com `npm run lint && npm test && npm run test:e2e`.

**Automações (`.claude/`), que valem quando o Claude Code é aberto nesta pasta:**
- `/publicar [mensagem]`: lint, testes, e2e, commit, push, espera o deploy, testa o site publicado e confere o CI.
- `/testar-sync`: sincronização real entre dois aparelhos (`npm run test:sync`), com limpeza das contas `e2e-*`.
- Hooks: o oxlint roda em cada `.js`/`.jsx`/`.mjs` editado (avisos também contam); editar `.env` e `package-lock.json` é bloqueado; push para o `main` e merge da `redesign` também.

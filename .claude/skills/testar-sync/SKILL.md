---
name: testar-sync
description: Testa a sincronização real entre dois aparelhos (hábitos, partes, treino, exclusão e conta) com contas descartáveis no Supabase de produção, e apaga as contas no fim.
disable-model-invocation: true
---

# Testar a sincronização

O teste abre dois Chromes ("aparelho A" e "aparelho B") e cria contas `e2e-*@mydailyhabits.dev` no **Supabase de produção**. São 10 etapas: subir os hábitos iniciais, criar hábito, partes do dia, treino, entrar em B sem duplicar, marcar em B e ver em A, excluir em A e sumir em B, sair, isolamento entre contas e exclusão de conta.

1. **Pré-requisitos:** o `.env` precisa ter `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, porque o build usa essas variáveis. O Supabase CLI precisa estar logado e ligado ao projeto (`supabase/.temp/project-ref`). Nunca peça nem mostre a chave `service_role`/secret.
2. **Rodar:** `npm run test:sync`. Para testar o site publicado: `E2E_URL=https://my-daily-habits.vercel.app node tests/sync.mjs`.
3. **Limpeza:** o script apaga as contas no fim, mesmo se falhar. Confira que sobrou zero:
   `npx --yes supabase@2.121.0 db query --linked "select count(*) from auth.users where email like 'e2e-%@mydailyhabits.dev'"`
   Se sobrar alguma, apague com o mesmo comando trocando `select count(*)` por `delete`.
4. **Resumo:** informe quantas das 10 etapas passaram e, se alguma falhou, qual e com que mensagem.

---
name: publicar
description: Verifica, faz commit e publica a branch redesign no site (lint, testes, e2e, push, deploy da Vercel, testes no site publicado e CI).
disable-model-invocation: true
argument-hint: "[mensagem do commit]"
---

# Publicar

O push na `redesign` publica em https://my-daily-habits.vercel.app. Siga as etapas em ordem e **pare na primeira falha**, mostrando a saída.

1. **Branch:** confirme com `git branch --show-current` que é `redesign`. Nunca publique do `main`, que é a entrega do curso.
2. **Verificação local:** `npm run lint && npm test && npm run test:e2e`.
3. **Commit:** mostre o `git status --short`. Se houver arquivo inesperado (`.env`, `dist/`, rascunhos), pergunte antes de incluir. Faça o commit em português, com prefixo (`feat:`, `fix:`, `docs:`…), corpo curto em tópicos e a linha de atribuição de sempre. Se o usuário passou uma mensagem, use: $ARGUMENTS
4. **Push:** `git push`.
5. **Deploy, site e CI:** rode `.claude/skills/publicar/acompanhar-deploy.sh`. O script espera o deploy do commit (até 18 min, porque o aviso do GitHub pode atrasar), roda os testes de navegador contra o site publicado e espera o CI.
   - Se o deploy não aparecer, publique com `npx vercel deploy --prod` **só depois** do tempo de espera, senão o mesmo commit sai duas vezes.
6. **Resumo:** informe o commit, o estado do deploy, o resultado dos testes no site e o do CI. Se só mudou documentação, avise que o site não muda.

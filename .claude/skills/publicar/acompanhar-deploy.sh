#!/usr/bin/env bash
# Depois do git push: espera o deploy da Vercel do commit atual, testa o site publicado e confere o CI.
# Uso (na raiz do projeto): .claude/skills/publicar/acompanhar-deploy.sh
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1
SITE=https://my-daily-habits.vercel.app
FULL=$(git rev-parse HEAD)
SHA=${FULL:0:7}
PROJECT=$(node -p 'require("./.vercel/project.json").projectId')

# O aviso do GitHub já chegou à Vercel com até 30 min de atraso: espere antes de publicar pelo CLI.
state=""
for _ in $(seq 1 90); do # até 18 min
  state=$(npx --yes vercel@latest api "/v6/deployments?projectId=$PROJECT&limit=5" --raw 2>/dev/null |
    node -e 'let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
      try { const d = JSON.parse(s).deployments.find((x) => x.meta?.githubCommitSha === process.argv[1]); console.log(d?.readyState ?? ""); } catch { console.log(""); }
    })' "$FULL")
  case "$state" in READY | ERROR | CANCELED) break ;; esac
  sleep 12
done
echo "deploy de $SHA: ${state:-não apareceu em 18 min}"
if [ "$state" != READY ]; then
  echo "Sem deploy pronto. Se nada apareceu, publique pelo CLI: npx vercel deploy --prod" >&2
  exit 1
fi

E2E_URL=$SITE node tests/e2e.mjs | grep -E "^✗|^  |testes passaram"
e2e=${PIPESTATUS[0]}

run=""
for _ in $(seq 1 20); do
  run=$(gh run list --commit "$FULL" -L 1 --json databaseId -q '.[0].databaseId' 2>/dev/null)
  [ -n "$run" ] && break
  sleep 6
done
if [ -n "$run" ] && gh run watch "$run" --exit-status --interval 15 >/dev/null 2>&1; then ci=verde; else ci="falhou ou não rodou"; fi

echo "site: $([ "$e2e" -eq 0 ] && echo "testes ok" || echo "TESTES FALHARAM") · CI: $ci"
[ "$e2e" -eq 0 ] && [ "$ci" = verde ]

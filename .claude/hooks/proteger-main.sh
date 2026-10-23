#!/usr/bin/env bash
# PreToolUse (Bash): o main é a entrega do curso. Bloqueia push para o main e merge da redesign nele.
# Olha o comando inteiro de propósito: "git checkout main && git push" também é barrado.
cmd=$(jq -r '.tool_input.command // ""')
branch=$(git -C "$CLAUDE_PROJECT_DIR" branch --show-current 2>/dev/null)

block() {
  echo "Bloqueado pelo hook do projeto: $1 O main é a entrega do curso (ver CLAUDE.md). Se o usuário quiser mesmo, ele roda o comando digitando '!' antes, no prompt." >&2
  exit 2
}

if grep -qE '\bgit\b.*\bpush\b' <<<"$cmd"; then
  grep -qwE 'main' <<<"$cmd" && block "push envolvendo o main."
  [ "$branch" = main ] && block "push com a branch main ativa."
fi
grep -qE '\bgit\b.*\bmerge\b.*\bredesign\b' <<<"$cmd" && block "merge da redesign."
[ "$branch" = main ] && grep -qE '\bgit\b.*\b(merge|rebase)\b' <<<"$cmd" && block "merge/rebase com a branch main ativa."
exit 0

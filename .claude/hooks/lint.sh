#!/usr/bin/env bash
# PostToolUse (Edit/Write): roda o oxlint no arquivo JS editado e devolve os problemas ao Claude.
f=$(jq -r '.tool_input.file_path // ""')
case "$f" in *.js | *.jsx | *.mjs) ;; *) exit 0 ;; esac
case "$f" in "$CLAUDE_PROJECT_DIR"/*) ;; *) exit 0 ;; esac
[ -f "$f" ] || exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0

if ! out=$(npx --no-install oxlint --deny-warnings "$f" 2>&1); then
  printf 'oxlint encontrou problemas em %s:\n%s\n' "${f#"$CLAUDE_PROJECT_DIR"/}" "$out" >&2
  exit 2
fi
exit 0

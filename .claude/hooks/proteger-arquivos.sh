#!/usr/bin/env bash
# PreToolUse (Edit/Write): o .env guarda as chaves locais e o package-lock.json só muda pelo npm.
name=$(basename "$(jq -r '.tool_input.file_path // ""')")
case "$name" in
  .env.example) ;;
  .env | .env.*)
    echo "Bloqueado pelo hook do projeto: $name guarda as chaves locais e não é editado pelo Claude. Peça ao usuário para editar." >&2
    exit 2
    ;;
  package-lock.json)
    echo "Bloqueado pelo hook do projeto: package-lock.json só muda pelo npm (npm install / npm uninstall)." >&2
    exit 2
    ;;
esac
exit 0

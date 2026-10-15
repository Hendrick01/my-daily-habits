# Como entregar

Faça a entrega em passos pequenos. Se qualquer comando falhar, leia a mensagem antes de executar outro.

## O fluxo básico do Git

| Comando | Pergunta que ele responde |
| --- | --- |
| `git status` | O que mudou e ainda não está preparado para o próximo commit? |
| `git add .` | Quais mudanças eu quero incluir no próximo commit? |
| `git commit -m "mensagem"` | Qual marco do meu trabalho estou registrando localmente? |
| `git push` | O que ainda falta enviar do meu repositório local para o GitHub? |

Antes de cada commit, rode `git status`. Depois do `git push`, abra o repositório no navegador e confirme que o commit aparece no histórico.

## Oito commits sugeridos

1. `chore: prepara a atividade final`
2. `feat: adiciona formulário de hábitos`
3. `feat: persiste hábitos no navegador`
4. `refactor: compartilha hábitos com contexto`
5. `feat: adiciona rotas principais`
6. `feat: adiciona rotas avançadas`
7. `feat: consome API de sugestões`
8. `docs: finaliza entrega e documentação`

As mensagens são uma referência. O importante é que cada commit represente um avanço real e verificável da etapa correspondente.

## Confirme o push no GitHub

1. Abra a página do seu repositório.
2. Confira se o último commit exibido é o mesmo que você acabou de enviar.
3. Abra o histórico de commits e confirme que os oito marcos aparecem em ordem.

## Confirme que `.env` não subiu

No terminal, rode `git status` e confira que `.env` não aparece como arquivo rastreado. No GitHub, procure por `.env`: o arquivo real não deve existir; apenas `.env.example` deve estar no repositório. Confira também que o seu `.gitignore` ignora `.env` e `.env.*`, mas **não** ignora `.env.example`.

## Build e preview

Rode `npm run build`. O comando precisa terminar sem erro. Depois rode `npm run preview`, abra a URL informada e navegue por **todas as oito rotas** por clique e digitando a URL diretamente.

## Checklist de entrega

- [ ] `npm install` funciona num clone limpo
- [ ] `npm run dev` sem erro no terminal e sem erro no console
- [ ] `npm run build` termina com sucesso
- [ ] `npm run preview` abre e as oito rotas funcionam por clique **e** por URL digitada
- [ ] Cadastrar, alternar e navegar entre as páginas funcionam
- [ ] Dados sobrevivem ao recarregamento
- [ ] Dado corrompido no armazenamento não gera tela branca
- [ ] `/sugestoes` mostra a mensagem inicial, a busca, o sucesso e o erro
- [ ] `/progresso` redireciona sem hábitos e não mostra `NaN`
- [ ] `.env` fora do Git, `.env.example` dentro
- [ ] `README.md`, `RESPOSTAS.md` e `DIARIO.md` preenchidos
- [ ] 8 ou mais commits, `git status` limpo
- [ ] `git push` feito

## Se houver conflito ou o push for rejeitado

**Não force nada.** Não use `--force` e não apague o histórico para tentar "destravar". Copie a mensagem completa, passe pelo protocolo de depuração e abra uma issue no seu repositório usando o modelo de dúvida técnica.

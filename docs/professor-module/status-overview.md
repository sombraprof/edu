# Status do módulo administrativo "Professor"

Este resumo rápido compila o estado atual das entregas documentadas no plano incremental e sinaliza os próximos passos em aberto.

## O que já foi entregue

- Rota protegida `/professor` com dashboard e navegação dedicados.
- Workbench de ingestão `/professor/ingestao` com validação client-side e checklist operacional.
- Editor visual `/professor/editor` com suporte aos blocos principais e validação inline.
- Exportação do editor condicionada aos scripts oficiais registrados no painel de validações.
- Painel `/professor/validacao` para consolidar execuções, notas e relatórios oficiais.
- Pacote `/professor/publicacao` com checklist de validações, status Git em tempo real, geração de comandos e preparo de resumo de PR.
- Botão "Buscar atualizações da main" no painel de publicação sincroniza o workspace via `git fetch` controlado.
- Botão "Criar branch automaticamente" usa o backend para preparar a branch de trabalho diretamente da SPA.
- Serviço auxiliar `npm run teacher:service` para disparo de scripts e sincronização de relatórios diretamente da SPA.

## O que falta fazer

- Evoluir o serviço backend para oferecer autorização multiusuário, filas de execução e auditoria detalhada.
- Automatizar `git add`, `commit` e abertura de PRs a partir do pacote de publicação na SPA.
- Definir política de permissões, auditoria e governança para expor a API em ambientes compartilhados.
- Ampliar o editor visual para cobrir blocos avançados e oferecer pré-visualização renderizada.
- Consolidar suíte de testes (unitários e e2e) cobrindo ingestão, edição, validação e publicação.

> Consulte o [plano completo](./README.md) e os registros por iteração para mais detalhes sobre contexto, decisões e próximos passos.

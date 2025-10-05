# Iteração 4 — Validações e relatórios centralizados (Legado)

> **Documento legado:** As rotas, painéis e automações descritos abaixo foram aposentados. O fluxo vigente utiliza o editor inline do modo professor e o serviço `teacher:service` limitado a `GET/PUT`. Consulte o [estado atual](../status-overview.md#estado-atual) para fontes de verdade atualizadas.
>
> Registro histórico preservado apenas para consulta. Não representa o fluxo atual.

## Objetivo da iteração

- Consolidar o checklist de validação dentro do módulo `/professor`, reduzindo o vai-e-vem com terminal e arquivos locais.
- Permitir que professores e revisores registrem execuções dos scripts oficiais, mantenham notas de contexto e acompanhem pendências sem sair da SPA.
- Preparar o terreno para a execução remota dos scripts e o download automático dos relatórios por meio de um backend auxiliar.

## Entregas concluídas

- Painel `/professor/validacao` protegido pelo `TeacherModeGate`, com seção para notas da rodada e orientações de preparo do workspace.
- Campos dedicados para colar a saída dos scripts (`validate:content`, `validate:report`, `report:observability:check`, `report:governance`), com persistência em `localStorage` e registro manual de execução.
- Indicadores automáticos de status (pendente, avisos, falhas) baseados no conteúdo dos logs fornecidos.
- Upload e leitura dos relatórios `content-validation-report.json`, `content-observability.json` e `governance-alert.json`, exibindo métricas-chave e disciplinas com apontamentos.
- Serviço backend leve (`npm run teacher:service`) expõe endpoints REST para disparar scripts, sincronizar logs e baixar relatórios direto no painel.
- Autenticação mínima via header `X-Teacher-Token` exigida pelo serviço auxiliar.
- Registro de próximos aprimoramentos no painel (execução remota, download automático e integração com o editor visual).
- Histórico de execuções remotas armazenado em `reports/teacher-script-history.json` e exibido em linha do tempo na SPA.
- Editor visual bloqueia exportações enquanto houver falhas registradas pelos scripts oficiais.

### Linha do tempo

- **2024-07-02** — Alinhamento com conteúdo sobre necessidades do checklist antes do commit e priorização dos scripts mínimos.
- **2024-07-04** — Implementação do armazenamento local para logs e notas, além da heurística de detecção de avisos/erros.
- **2024-07-05** — Integração dos uploads de relatórios com resumos automáticos e atualização do dashboard/roteador.
- **2024-07-06** — Publicação da documentação da iteração e ajuste do roadmap destacando próximos passos para backend e Git.
- **2024-07-11** — Serviço backend disponível; painel passa a executar scripts remotamente e baixar relatórios sem upload manual.
- **2024-07-13** — Histórico das execuções remotas passa a ser armazenado e listado diretamente no painel.
- **2024-07-14** — Token de autenticação habilitado no serviço backend para permitir chamadas autenticadas via SPA.
- **2024-07-15** — Editor visual sincroniza alertas do painel e bloqueia exportações com falhas críticas registradas.

## Fluxo sugerido

1. **Preparar workspace**
   - Atualizar a `main` (`git checkout main && git pull --rebase`) e criar branch própria antes de rodar os scripts.
   - Registrar notas sobre ajustes manuais (edições no editor, correções rápidas em JSON) na seção "Notas da rodada".
2. **Executar scripts na ordem sugerida**
   - Rodar `npm run validate:content`, `npm run validate:report`, `npm run report:observability:check` e `npm run report:governance`.
   - Colar a saída de cada comando e marcar manualmente a data de execução para auditoria.
3. **Importar relatórios gerados**
   - Enviar os arquivos JSON produzidos ou usar o botão "Baixar do backend" para sincronizar automaticamente após cada rodada.
   - Revisar disciplinas com problemas/avisos e indicadores de blocos legados antes de preparar o commit.
4. **Resolver pendências**
   - Corrigir erros apontados pelos scripts e repetir a rodada até que os indicadores fiquem verdes.
   - Consolidar notas e próximos passos para compartilhar com revisores ou incluir na descrição do PR.

## Feedback inicial

- ✅ Centralização dos logs e notas reduziu perdas de contexto entre execuções consecutivas dos scripts.
- ✅ Upload dos relatórios evitou abrir múltiplos arquivos JSON/MD ao validar cursos com avisos.
- ⚠️ A detecção de avisos/erros ainda depende de heurísticas locais; integração com backend deverá fornecer status mais preciso.
- ⚠️ O serviço backend segue orientado a ambiente local; o token único ainda precisa evoluir para múltiplos usuários e perfis de permissão.

## Próximos passos / pendências

- [x] Implementar serviço backend que execute os scripts e retorne logs estruturados para o painel.
- [x] Disponibilizar download direto dos relatórios mais recentes sem necessidade de upload manual.
- [x] Integrar alertas do painel com o editor visual, bloqueando exportações com erros críticos.
- [ ] Ensaiar integração com Git (branches temporárias, diffs e PRs) aproveitando as notas registradas no painel.
- [x] Registrar histórico de execuções no serviço backend e disponibilizar consulta na SPA.
- [x] Acrescentar autenticação mínima ao serviço backend antes de expô-lo fora do ambiente local.
- [ ] Evoluir o modelo de autenticação para múltiplos perfis e auditoria detalhada.

## Referências úteis

- [Plano geral do módulo](./README.md)
- [Registro da Iteração 3](./iteration-03.md)
- [Guia de autoria](../CONTENT_AUTHORING_GUIDE.md)
- [Schemas oficiais](../../schemas)

# Crosswalk Moodle x TEDs / Avaliações

Este documento consolida as verificações realizadas em 18/06/2024 para alinhar instruções de TEDs e avaliações entre as lições MD3 e o ambiente Moodle oficial.

## Resumo das verificações

- Todos os links foram testados em sessão compartilhada com o docente responsável (Prof. Tiago Sombra) e com a analista Moodle.
- Ajustes nas lições `lesson-02.json`, `lesson-06.json` e `lesson-12.json` incorporam o nome oficial das tarefas, rubricas resumidas e links diretos.
- `metadata` das lições foi atualizado para referenciar esta verificação e a ata da reunião.

## Tabela de inconsistências corrigidas

| Lição   | Situação encontrada                                                                             | Correção aplicada                                                                                                                                  | Evidência                                                           |
| ------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Aula 02 | Link genérico para envio de captura; ausência de prazo e identificação da tarefa no Moodle.     | Adicionado `callout.info` com link direto (`assign/view.php?id=98142`), prazo oficial e aviso sobre anexos aceitos.                                | `lesson-02.json`, `metadata.evidences[0]`                           |
| Aula 06 | TED mencionava apresentação, mas o Moodle exigia checklist anexado e rubrica específica.        | Inserido `callout.warning` com rubrica resumida e link (`assign/view.php?id=98155`); lista dos arquivos obrigatórios e responsável pela validação. | `lesson-06.json`, `docs/governance/professor-validation-meeting.md` |
| Aula 12 | Instrução sem o código do fórum para feedback assíncrono; repositório estava em seção separada. | Criado bloco de checklist com links diretos para tarefa (`assign/view.php?id=98171`) e fórum (`mod/forum/view.php?id=45322`).                      | `lesson-12.json`, planilha de monitoramento                         |

## Checklist pós-verificação

- [x] Links testados com conta docente e estudante de homologação.
- [x] Campos `metadata.updatedAt`, `metadata.owners` e `metadata.sources` revisados.
- [x] Rubricas sintetizadas nos `callouts` das respectivas lições.
- [x] Ata e planilha de monitoramento atualizadas com novas colunas de evidência.

## Responsáveis

- **Validação pedagógica:** Prof. Tiago Sombra
- **Validação técnica:** Ana Paula (Governança)
- **Homologação Moodle:** Juliana Torres

## Próximos passos

1. Incluir o crosswalk na agenda da próxima sessão de auditoria (`docs/governance/lesson-audit-plan.md`).
2. Repetir a verificação após a publicação da avaliação NP1 para garantir consistência das rubricas.
3. Atualizar a planilha de monitoramento (`docs/governance/post-module-monitoring.md`) com status "Verificado".

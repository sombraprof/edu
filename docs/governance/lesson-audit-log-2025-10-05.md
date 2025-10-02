# Registro de auditoria – 05/10/2025

## Fonte da auditoria

- Planilha de auditoria pós-módulo (`post-module-monitoring.md`) – abas **Vetores** e **Structs**, apontando bibliografia restrita e estudos de caso superficiais nas aulas 32, 34 e 36.
- `docs/didactics/algi-content-audit.csv` (extração de 03/10/2025) sinalizando "Capítulos/páginas: Ausente" e "Exemplos aplicados: Parcial" para as três lições.
- Relatório `reports/content-validation-report.json` (execução local de 05/10/2025) confirmando aderência de schema após ajustes.

## Lições saneadas

| Lição       | Problema mapeado                                                                          | Ação implementada                                                                                                                                                                                                                                    | Evidências adicionadas                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `lesson-32` | Bibliografia fora do plano e estudo de caso genérico na aba **Vetores**.                  | Inclusão dos capítulos de Forbellone & Eberspächer (Cap. 7), Manzano & Oliveira (Cap. 9), Backes (Cap. 8), Santos (Cap. 10) e Ascencio & Campos (Cap. 7); estudo de caso do Armazém Popular e rubrica atrelada às competências de busca e auditoria. | Planilha de inventário da Farmácia Escola (`resources`), `assessment.rubric` referenciando autores e planilha de auditoria. |
| `lesson-34` | Referências superficiais e ausência de contextualização para matrizes na aba **Vetores**. | Ampliação da bibliografia com capítulos específicos dos cinco autores; estudo de caso do painel energético do Campus Vale e rubrica conectada a pensamento algorítmico e sustentabilidade.                                                           | Planilha do painel energético (`resources`), `contentBlock` relacionando capítulos e checklist de auditoria energética.     |
| `lesson-36` | Falta de capítulos citados e rubrica desconectada das competências na aba **Structs**.    | Inclusão dos capítulos de structs dos autores-base; estudo de caso da Cooperativa TechSul com logs de auditoria e rubrica que conecta organização da informação, governança e colaboração.                                                           | Planilha da cooperativa (`resources`), `callout.warning` com protocolo de anonimização e rubrica por competência.           |

## Próximos passos

1. Atualizar a aba **Resumo** da planilha com status "Revisado" para as aulas 32, 34 e 36.
2. Compartilhar com o docente responsável o novo roteiro de estudos de caso para validação em sala.
3. Monitorar submissões da TED nas próximas duas semanas e registrar métricas em `docs/governance/post-module-monitoring.md`.

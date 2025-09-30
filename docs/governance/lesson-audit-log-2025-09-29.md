# Registro de auditoria – 29/09/2025

## Fonte da auditoria

- Planilha de auditoria pós-módulo (`post-module-monitoring.md`) – abas **Laços**, **Vetores** e **Structs**, com apontamentos de bibliografia restrita e estudos de caso superficiais.
- Relatório `reports/content-validation-report.json` (execução local de 29/09/2025) confirmando ausência de erros estruturais após os ajustes.

## Lições saneadas

| Lição       | Problema mapeado                                                                    | Ação implementada                                                                                                                                                                            | Evidências adicionadas                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `lesson-18` | Bibliografia genérica e estudo de caso sem contextualização (aba **Laços**).        | Inclusão de capítulos específicos de Forbellone & Eberspächer, Manzano & Oliveira, Backes, Santos e Ascencio & Campos; estudo de caso da Farmácia Escola alinhado à planilha de auditoria.   | Planilha de controle de lotes (`resources`), rubrica vinculada às competências e citações aos autores nos `callouts`.         |
| `lesson-31` | Recursos sem ligação com autores base e exemplos pouco profundos (aba **Vetores**). | Referências aos capítulos de vetores dos cinco autores, estudo de caso de energia renovável e rubrica que conecta Pensamento crítico e Análise de dados ao método dos autores.               | Recurso `caseStudy` atualizado, `assessment.rubric` descrevendo a aplicação das referências e checklist com citações diretas. |
| `lesson-37` | Falta de citações formais e rubrica dissociada das competências (aba **Structs**).  | Ampliação da bibliografia com capítulos indicados, estudo de caso SEBRAE com logs, rubrica articulada a Pensamento crítico e Confiabilidade de software conforme orientações bibliográficas. | Planilha de logs vinculada, `callout.success` detalhando o caso e rubrica com pesos alinhados às competências.                |

## Próximos passos

1. Atualizar a aba **Resumo** da planilha com o status "Revisado" para as lições 18, 31 e 37.
2. Compartilhar com a coordenação o checklist de rubricas para homologação docente.
3. Monitorar a próxima execução de `npm run validate:content` na pipeline para garantir que os novos recursos permaneçam acessíveis.

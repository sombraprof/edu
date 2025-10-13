# Plano de aprimoramento do conteúdo de TGS (2025.2)

## 1. Objetivo

Garantir que todas as aulas de Teoria Geral de Sistemas (TGS) ofereçam materiais autossuficientes para estudo assíncrono, com exemplos introdutórios, vídeos acessíveis e exercícios/TEDs coerentes com o Plano de Ensino 2025.2.

## 2. Escopo

- 40 aulas da disciplina, incluindo devolutivas e avaliações.
- Exercícios (TEDs) e materiais complementares relacionados.
- Referências bibliográficas principais: Stair et al. (2021), Meireles & Sordi (2019), Batista (2014), Silva et al. (2019), Palmisano & Rosini (2012), Audy & Brodbeck (2008), Imoniana (2016).

## 3. Diagnóstico inicial

1. Diversos blocos mencionam "o professor mostrará" sem links ou anexos.
2. Aulas introdutórias carecem de exemplos escritos que conectem teoria e cotidiano.
3. TEDs variam em clareza de entrega e raramente indicam tempo estimado ou rubrica.
4. Recursos em vídeo aparecem de forma esparsa ou genérica.
5. Exercícios extras permanecem com `available: false`.

## 4. Diretrizes gerais de revisão

- **Tom e profundidade:** manter linguagem introdutória, privilegiando "o que é" e "como funciona" antes de abordagens avançadas.
- **Estrutura mínima por aula:** bloco de contexto + exemplos aplicados + vídeo + exercício/TED + referência(s) do PE.
- **Recursos multimídia:** sempre registrar fonte, duração e objetivo pedagógico em `resources`.
- **Exemplos atuais:** relacionar com empresas ou cenários brasileiros sempre que possível (Magalu, Nubank, gov.br, SUS Digital etc.).
- **Exercícios:** ao menos um exercício leve (quiz, checklist, mapa, fórum guiado) com critério de entrega.
- **TEDs:** explicitar data limite, forma de entrega, formato e critério de avaliação.

### 4.1 Template de aula MD3

- O template oficial em `docs/content/tgs-lesson-template.md` organiza cada aula em cinco blocos obrigatórios: contexto (`contentBlock` + `lessonPlan`), exemplos aplicados (`cardGrid`, `systemMapper`, `md3Table`), vídeo curado (`videosBlock`), exercício/TED (`callout` + `checklist`) e referências alinhadas ao Plano de Ensino (`contentBlock` + `md3Table`).
- Inclui exemplos de preenchimento com foco em casos brasileiros, loops de feedback e rubricas enxutas, servindo como referência direta para transformar indicações como "o professor mostrará" em blocos MD3 estruturados.

## 5. Fluxo de trabalho recomendado

1. **Varredura por unidade** (I a VI):
   - Rodar `npm run report:courses` para gerar `reports/course-content-summary.json`.
   - No relatório, localizar a entrada `courses[].id === "tgs"` para revisar totais por lição, exercícios e suplementos, observando `missingFiles`, `orphanFiles` e `duplicatedWrappers`.
   - Registrar na planilha apenas os pontos críticos encontrados para o curso TGS (ignorar dados de outros cursos).
   - Mapear lacunas em uma planilha (aba "Diagnóstico") com colunas: Aula, Falta vídeo?, Falta exemplo?, Falta exercício?, Observações.
2. **Curadoria de referências e vídeos:**
   - Utilizar playlist base no YouTube (ex.: canal Cengage, TOTVS Labs, Sebrae, Endeavor) e podcasts curtos (≤10 min).
   - Priorizar conteúdos em português e com licença aberta.
3. **Redação de exemplos:**
   - Criar parágrafos curtos descrevendo o caso e a relação com conceitos (entradas, processamento, feedback, etc.).
   - Utilizar blocos `contentBlock` + `cardGrid` para ilustrar comparações.
4. **Atualização de exercícios/TEDs:**
   - Transformar diretrizes vagas em checklists ou formular as perguntas no JSON (`checklist`, `callout`, `md3Table`).
   - Ativar exercícios extras ajustando `available: true` quando prontos.
5. **Revisão de consistência:**
   - Conferir `lessons.json` e manifestos após cada bloco de alterações.
   - Rodar `npm run validate:content` e `npm run report:observability`.
6. **Documentação:**
   - Atualizar o relatório de progresso em `docs/WORK_STATUS.md` (seção TGS) com marcos concluídos.

## 6. Roadmap detalhado de ações

### Fase 1 — Auditoria e padronização (Semana 1)

| Tarefa | Descrição                                   | Saída                                             | Responsável          |
| ------ | ------------------------------------------- | ------------------------------------------------- | -------------------- |
| A1     | Inventário das aulas (planilha Diagnóstico) | Lista de lacunas por aula                         | Conteudista          |
| A2     | Definir modelo de bloco base                | Template em `docs/content/tgs-lesson-template.md` | Conteudista + Design |
| A3     | Catalogar vídeos confiáveis                 | Playlist com links e duração                      | Conteudista          |

### Fase 2 — Enriquecimento das Unidades I–III (Semanas 2–3)

| Aula(s) | Ações prioritárias                                                                                                                            | Recursos sugeridos                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1–4     | Incluir exemplos cotidianos (sistema bancário, transporte urbano, delivery). Inserir vídeos introdutórios (≤5 min) e TED de reflexão inicial. | Vídeo "O que é sistema?" (Cengage), reportagem Estadão sobre logística.    |
| 5–8     | Mapas conceituais sobre sistemas abertos, fluxos e homeostase. Adicionar exercícios práticos usando casos (hospital, e-commerce).             | Vídeo Sebrae sobre processos; case Magazine Luiza sobre adaptação digital. |
| 9–12    | Expandir texto sobre níveis de SI e tomada de decisão. Inserir exemplos de dashboards reais (Power BI público) e checklists comparativos.     | Vídeo TOTVS sobre BI; blog da Receita Federal (case e-CAC).                |
| 13      | Revisar instruções da NP1, incluir rubrica resumida e recursos de estudo.                                                                     | Guia de estudos baseado em Stair et al.                                    |

### Fase 3 — Unidades IV–V (Semanas 4–6)

| Aula(s)     | Ações prioritárias                                                                                                                                                          | Recursos sugeridos                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 14–18       | Substituir "o professor mostrará" por links para estudos de caso (YouTube/TOTVS). Inserir comparativos escritos de ERP/CRM/SCM e exercícios de interpretação de dashboards. | Vídeo "Integração ERP + CRM" (Salesforce Brasil), demonstração Power BI oficial. |
| 19–27       | Descrever claramente cada módulo ERP com tabela. Acrescentar estudos de caso nacionais (Magazine Luiza, Boticário). Detalhar TEDs com critérios (rubrica simples).          | Entrevista TOTVS Lab; podcast MIT Sloan Review Brasil sobre ERP.                 |
| 24 (remoto) | Criar questionário objetivo em JSON com feedback automático.                                                                                                                | Ferramenta Google Forms ou bloco `quiz` se disponível.                           |

### Fase 4 — Unidade VI e Tendências (Semanas 7–8)

| Aula(s) | Ações prioritárias                                                                                                             | Recursos sugeridos                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 29–32   | Inserir resumos das fases de PSI com infográficos. Incluir vídeo de governança COBIT/ITIL.                                     | Canal "ITGI Brasil" sobre governança.                          |
| 33–35   | Desenvolver componente Balanced Scorecard/Mapa Estratégico (ver tarefa técnica). Criar exemplos com startup fictícia.          | Vídeo Fundação Dom Cabral sobre BSC.                           |
| 36–39   | Atualizar textos com tendências (IA, RPA, Cloud) usando relatórios Gartner/FGV. Adicionar TEDs de análise crítica com rubrica. | Vídeo Google Cloud sobre transformação digital; artigo FGVcia. |
| 40      | Preparar guia de estudo para NP3 com checklist e links de revisão.                                                             | Revisão dos capítulos de Stair et al.                          |

### Fase 5 — Exercícios e suplementos (Semanas 9–10)

| Tarefa | Descrição                                                      | Saída                                             |
| ------ | -------------------------------------------------------------- | ------------------------------------------------- |
| E1     | Revisar `system-map` e `loop-feedback`                         | Ajustes de enunciado + ativação `available: true` |
| E2     | Criar novos exercícios leves por unidade (quizzes, flashcards) | 6–8 atividades extras                             |
| E3     | Publicar template de relatório de extensão                     | Suplemento com guia passo a passo                 |

## 7. Padrões de escrita e citação

- Utilizar sempre pelo menos uma referência do Plano de Ensino em `resources` com página/capítulo.
- Incluir "Leitura recomendada" com trecho específico (ex.: "Stair et al. (2021), cap. 1, p. 12-18").
- Utilizar voz ativa e foco em aplicação prática.
- Incluir glossário quando novos termos forem introduzidos.

## 8. Indicadores de acompanhamento

| Indicador                             | Meta                       | Fonte                                    |
| ------------------------------------- | -------------------------- | ---------------------------------------- |
| Aulas com vídeo referenciado          | 100% das aulas de conteúdo | `resources` + relatório de auditoria     |
| Aulas com exemplo aplicado            | 100%                       | Checklist da planilha                    |
| TEDs com critérios claros             | 95%                        | Revisão dos blocos `callout`/`checklist` |
| Exercícios extras ativos              | ≥4                         | `exercises.json`                         |
| Referências bibliográficas explícitas | ≥2 por unidade             | Revisão manual                           |

## 9. Entregáveis finais

1. Planilha de auditoria preenchida.
2. Conteúdos JSON/Vue atualizados com vídeos, exemplos e exercícios.
3. Novos blocos/componentes se necessários (ex.: Balanced Scorecard).
4. Relatório de validação (`npm run validate:content` + `report:observability`).
5. Guia resumido para docentes com lista de recursos.

## 10. Riscos e mitigação

| Risco                        | Impacto | Mitigação                                                              |
| ---------------------------- | ------- | ---------------------------------------------------------------------- |
| Links externos indisponíveis | Alto    | Preferir vídeos oficiais; baixar backups em repositório institucional. |
| Excesso de profundidade      | Médio   | Revisão pedagógica para manter abordagem introdutória.                 |
| Tempo de curadoria           | Médio   | Dividir playlist por unidade; priorizar vídeos até 8 min.              |
| Inconsistência nos JSON      | Alto    | Validar com scripts automatizados e revisão cruzada.                   |

## 11. Próximos passos imediatos

1. Aprovar este plano com a coordenação pedagógica.
2. Criar planilha de auditoria compartilhada (Google Sheets ou Notion).
3. Iniciar Fase 1 imediatamente após aprovação.

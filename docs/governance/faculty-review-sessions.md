# Plano de Sessões de Revisão com Docentes

O objetivo destas sessões é revisar, corrigir e preparar os materiais atuais antes da migração completa para a biblioteca MD3. O plano combina reuniões síncronas com acompanhamento assíncrono, garantindo que cada disciplina avance com clareza sobre metas pedagógicas, componentes necessários e ajustes nos conteúdos.

## 1. Estrutura geral das sessões

- **Periodicidade:** encontros semanais por 4 semanas, com acompanhamento assíncrono via relatórios e checklists.
- **Formato:** reunião de 60 minutos com moderação da squad de governança (design system + pedagogia) e registro em ata padrão.
- **Participantes fixos:**
  - Facilitador/a de design system
  - Especialista pedagógico/a
  - Docente líder do curso
  - Apoio técnico (front-end) quando houver impacto em componentes.
- **Artefatos obrigatórios:**
  - Ata resumida no Notion/Confluence com decisões e pendências.
  - Checklist de saneamento preenchido no final da sessão.
  - Issues ou tarefas abertas no repositório/documento de backlog.

## 2. Roteiro da sessão

1. **Abertura (5 min):** relembrar objetivos da rodada, status das ações anteriores e métricas de conteúdo afetado.
2. **Revisão de materiais (40 min):**
   - Avaliar lições priorizadas com base no relatório de validação (`reports/content-validation-report.json`).
   - Mapear componentes MD3 necessários (ex.: TruthTable, Flowchart, BlockDiagram, novos componentes específicos).
   - Revisar metadados obrigatórios (`summary`, `competencies`, `metadata.owners`, `metadata.updatedAt`).
3. **Definição de encaminhamentos (10 min):** atribuição de responsáveis, datas e checklist de correções.
4. **Encerramento (5 min):** combinar follow-up assíncrono, atualizar status no plano de modernização e confirmar próxima sessão.

## 3. Agenda por disciplina

| Semana   | Curso              | Foco principal                                                                                                                                                | Entregáveis                                                                            |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Semana 1 | **ALGI**           | Saneamento das aulas 01-08, definição de componentes MD3 essenciais (TruthTable, Flowchart, Simulador)                                                        | Lista de blocos a migrar, backlog de exercícios revisados, ata com responsáveis        |
| Semana 2 | **DDM**            | Reorganização por sprints, atualização de referências (Compose, SwiftUI, Flutter) e definição de novos componentes (Painel de Arquitetura, Checklist de Loja) | Cronograma de atualização dos módulos, definição de componentes e fontes oficiais      |
| Semana 3 | **LPOO**           | Alinhamento de casos práticos e componentes UML interativos (Class Designer, Interaction Diagram)                                                             | Especificação dos novos componentes, plano de exercícios práticos com GitHub Classroom |
| Semana 4 | **TDJD** & **TGS** | Atualização tecnológica (Unity 6, Godot 4, estudos de caso ESG) e componentes sistêmicos (Pipeline Canvas, System Mapper)                                     | Plano de revisão de conteúdo, lista de assets, matriz de competências atualizada       |

## 4. Critérios de conclusão por sessão

- Todas as lições revisadas possuem metadados completos (`summary`, `competencies`, `outcomes`, `metadata.updatedAt`).
- Componentes necessários foram mapeados e registrados em backlog com prioridade e complexidade estimadas.
- Pendências de conteúdo crítico (erros conceituais, links quebrados, exercícios faltantes) possuem responsável e data limite.
- Próxima sessão agendada com pauta preliminar e responsáveis confirmados.

## 5. Indicadores de acompanhamento

| Indicador                      | Descrição                                                          | Meta  |
| ------------------------------ | ------------------------------------------------------------------ | ----- |
| Cobertura de revisão           | Percentual de lições revisadas nas 4 semanas                       | ≥ 80% |
| Metadados completos            | Lições com `metadata.owners` e `metadata.updatedAt` preenchidos    | 100%  |
| Componentes validados          | Número de componentes novos/aprimorados com especificação aprovada | ≥ 6   |
| Pendências críticas resolvidas | Ações classificadas como "Alta" resolvidas até a semana seguinte   | ≥ 90% |

## 6. Checklist operacional para cada encontro

- [ ] Atualizar relatório `reports/content-validation-report.json` antes da reunião.
- [ ] Preparar resumo dos blocos legados e pendências em `reports/governance-alert.md`.
- [ ] Confirmar presença dos participantes obrigatórios com 24h de antecedência.
- [ ] Registrar decisões na ata compartilhada em até 24h após a sessão.
- [ ] Atualizar status dos itens no backlog (`docs/material-redesign-plan.md` e issues associadas).

## 7. Próximos passos

1. Aprovar o plano com coordenação acadêmica e docentes líderes.
2. Integrar o checklist de saneamento ao fluxo de validação (`npm run validate:content`).
3. Publicar calendário compartilhado (Google Calendar/Teams) com convites recorrentes para cada curso.
4. Revisitar o plano ao final da 4ª semana para priorizar a fase seguinte da migração (implementação técnica dos componentes).

---

> **Responsáveis:** squad de governança (design system + pedagogia) em parceria com lideranças de curso. Atualizações devem ser registradas neste documento a cada rodada de revisão.

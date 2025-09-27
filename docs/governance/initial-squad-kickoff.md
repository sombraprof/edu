# Governança Inicial do Programa de Modernização

## 1. Objetivo do passo

Estabelecer a célula multidisciplinar responsável por guiar a modernização dos componentes MD3 e a reestruturação pedagógica, garantindo decisões rápidas, responsabilidades claras e cadência de validação contínua.

## 2. Composição recomendada da squad

| Papel                      | Responsabilidades principais                                                                                | Titular proposto | Backup    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------- | --------- |
| **Product/Design Lead**    | Facilitar discovery visual, consolidar tokens MD3, arbitrar guidelines e priorizar demandas de UI/UX.       | _Definir_        | _Definir_ |
| **Pedagogia/Conteúdo**     | Revisar aderência às competências, definir metadados obrigatórios e aprovar jornadas de aprendizagem.       | _Definir_        | _Definir_ |
| **Front-end principal**    | Implementar componentes MD3, manter registry de blocos, publicar Storybook e zelar por acessibilidade.      | _Definir_        | _Definir_ |
| **Engenharia de Conteúdo** | Automatizar pipelines (`validate:*`, `report:*`), manter schema e relatórios de observabilidade/governança. | _Definir_        | _Definir_ |
| **QA/Accessibility**       | Conduzir auditorias de contraste, navegação e testes end-to-end dos fluxos educacionais críticos.           | _Definir_        | _Definir_ |
| **Stakeholder Acadêmico**  | Representar coordenação de curso, validar sequenciamento, aprovar entregáveis finais.                       | _Definir_        | _Definir_ |

> **Ação imediata:** confirmar titulares e backups até D+2 e registrar contatos/canais em `docs/governance/roster.md`.

## 3. Ritual operacional

- **Daily assíncrono (Slack/Teams):** atualização rápida sobre bloqueios de implementação e revisão de conteúdo.
- **Reunião semanal (60 min):**
  - Revisar indicadores `reports/content-observability.json` e `reports/governance-alert.md`.
  - Validar progresso nos componentes MD3 priorizados.
  - Aprovar migrações de conteúdo por disciplina (sequência ALGI → DDM → LPOO → TDJD → TGS).
- **Design Crit (quinzenal):** foco em tokens, protótipos e documentação viva (Storybook/Figma).
- **Revisão pedagógica (quinzenal, alternada):** avaliação das jornadas de aprendizagem e rubricas de exercícios.

## 4. Entregáveis do passo 1 (Semana 0)

1. **Matriz RACI das frentes principais** (design system, biblioteca didática, migração de conteúdo, automações).
2. **Roadmap validado** com marcos das semanas 1-12 e responsáveis atribuídos.
3. **Checklist de qualidade inicial** cobrindo MD3, acessibilidade, metadados e critérios pedagógicos.
4. **Calendário de saneamento** com docentes por disciplina e artefatos necessários para cada sessão.

> Registrar os entregáveis em issues dedicadas e anexar os artefatos a este diretório.

## 5. Backlog inicial da squad

| Prioridade | Item                            | Descrição                                                                                               | Dono sugerido                      | Prazo alvo |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------- |
| Alta       | Consolidar tokens MD3           | Auditar `src/assets/styles.css`, mapear lacunas versus design tokens e preparar proposta para Semana 1. | Product/Design Lead + Front-end    | D+5        |
| Alta       | Definir schema unificado        | Fechar atributos obrigatórios (JSON/MDX) e validar com `npm run validate:content`.                      | Engenharia de Conteúdo + Pedagogia | D+7        |
| Média      | Planejar sessões com docentes   | Identificar docentes-chave por disciplina, alinhar objetivos e artefatos.                               | Stakeholder Acadêmico              | D+7        |
| Média      | Atualizar guias de contribuição | Revisar `CONTENT_AUTHORING_GUIDE.md` com decisões preliminares da squad.                                | Pedagogia + Engenharia de Conteúdo | D+10       |
| Baixa      | Elaborar plano de capacitação   | Criar agenda de workshops sobre MD3 e ferramentas para equipe ampliada.                                 | Product/Design Lead                | D+14       |

## 6. Métricas de acompanhamento

- **Cobertura de blocos MD3**: percentual de lições por curso sem blocos legados (`reports/content-observability.json`).
- **Aderência a metadados**: percentual de lições/exercícios aprovados em `npm run validate:content` sem avisos.
- **SLA de revisão**: tempo médio para aprovar atualizações de conteúdo/componente (issue → merge).
- **Feedback pedagógico**: nível de satisfação dos docentes nas sessões de saneamento (escala 1-5).

## 7. Próximos passos após o passo 1

- Iniciar a execução da Semana 1 com foco em tokens MD3 e prototipação visual.
- Criar issues para Storybook e documentação viva baseada nos componentes prioritários.
- Preparar template de lições unificado (`lesson-template.mdx`/`lesson-template.json`) para ser validado pelo schema.

---

_Última atualização: preencher após cada reunião semanal para manter o diretório sincronizado com as decisões da squad._

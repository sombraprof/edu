# Plano de Modernização de Componentes e Conteúdos

## 1. Objetivos Gerais

- Aderir às diretrizes do Material Design 3 em toda a superfície da aplicação, criando um design system consistente e auditável.
- Reestruturar o acervo de aulas para eliminar duplicidades, corrigir erros conceituais e padronizar formatos de entrega.
- Substituir os componentes didáticos atuais por uma biblioteca nova, escalável e orientada às necessidades de cada disciplina.

## 2. Diagnóstico da Interface Atual

### 2.1 Fundações de estilo

- Os tokens de cor, tipografia, elevação e espaçamento passaram a ser gerados dinamicamente pelo módulo `src/theme/tokens.ts`, garantindo consistência entre aplicação e Storybook. `initMaterialTheme` injeta as variáveis MD3 (`--md-sys-*`) e mantém aliases legados enquanto os componentes são migrados. 【F:src/theme/tokens.ts†L1-L126】【F:src/theme/material-theme.ts†L1-L229】
- A alternância de tema agora respeita `prefers-color-scheme`, armazena a preferência do usuário e expõe `setMaterialTheme` para integrações externas (ex.: Storybook). 【F:src/theme/material-theme.ts†L231-L285】

### 2.2 Componentes didáticos existentes

- O diretório legado `src/components/didactics` foi removido nesta etapa; o novo `Md3Flowchart` já nasce com estrutura semântica, conexões configuráveis e tokens MD3 aplicados diretamente no componente de aula. 【F:src/components/lesson/Md3Flowchart.vue†L1-L214】
- A `TruthTable.vue` em `lesson/` foi reescrita com cabeçalho, descrição, legenda e estados MD3 declarativos, cobrindo ícones acessíveis, notas e densidade configurável. 【F:src/components/lesson/TruthTable.vue†L1-L327】
- Ainda carecemos de documentação viva consolidada; a nova pasta `docs/didactics` inicia esse processo com a especificação do fluxograma MD3 e deve receber as próximas migrações. 【F:docs/didactics/md3-flowchart.md†L1-L60】

### 2.3 Arquitetura de páginas

- O cabeçalho `SiteHeader.vue` consome o `Md3TopAppBar` com variantes (`small`, `center-aligned`, `medium`, `large`) e densidades configuráveis, alinhando hierarquia tipográfica e estado elevado automático conforme o scroll. 【F:src/components/SiteHeader.vue†L1-L74】【F:src/components/layout/Md3TopAppBar.vue†L1-L94】
- `Md3NavigationRail.vue` e `Md3NavigationDrawer.vue` introduzem navegação lateral padrão/collapsed e gavetas modal/padrão com badges e descrições, preparando o terreno para dashboards docentes e páginas de curso. 【F:src/components/layout/Md3NavigationRail.vue†L1-L123】【F:src/components/layout/Md3NavigationDrawer.vue†L1-L119】
- A camada de layout global segue usando utilitários Tailwind para conteúdo principal; precisamos evoluir para contêineres responsivos compartilhados (app shell completo).

## 3. Diagnóstico dos Conteúdos Didáticos

### 3.1 Estrutura de arquivos

- Cada curso mantém arquivos duplicados (`lesson-01.json` e `lesson-01.vue`) para a mesma aula, dificultando versionamento. 【F:src/content/courses/algi/lessons†L1-L6】
- Listagens como `lessons.json` apontam para arquivos inexistentes ou inconsistentes (ex.: `lesson-16.json` marcado como indisponível, embora não exista no diretório). 【F:src/content/courses/algi/lessons.json†L1-L64】
- Suplementos e exercícios compartilham o mesmo padrão duplicado (`*.json` + `*.vue`), mas sem normalização de metadados (falta campo de duração, competências, recursos avaliativos).

### 3.2 Qualidade pedagógica

- Planos de aula descrevem metodologias detalhadas, porém sem alinhamento a competências e habilidades mensuráveis (BNCC/ABED) e sem critérios de avaliação vinculados a rubricas.
- Aulas usam HTML embutido (`v-html`) sem sanitização nem componentes semânticos reutilizáveis, aumentando risco de inconsistências e problemas de acessibilidade. 【F:src/content/courses/algi/lessons/lesson-01.json†L1-L120】

## 4. Diretrizes para o Novo Design System

1. **Fundação de tokens MD3**: gerar paletas dinâmicas a partir de uma cor semente (Material Color Utilities) e fornecer escalas claras/escuro, elevações e estados interativos controlados por CSS custom properties.
2. **Biblioteca de componentes MD**: reconstruir app bars, navigation rails, cards, botões, banners e componentes didáticos específicos seguindo especificações do Material Web 3.
3. **Tematização por curso**: permitir acentos cromáticos por disciplina (bordas, ícones) sem comprometer consistência global.
4. **Documentação viva**: publicar um Storybook ou documentação MDX hospedando exemplos responsivos e diretrizes de uso.

## 5. Plano de Ação por Curso

### 5.1 Algoritmos e Programação I (ALGI)

- Mapear objetivos de aprendizagem por unidade e reorganizar aulas em módulos temáticos (Fundamentos, Estruturas de Seleção, Repetição, Modularização).
- Reescrever conteúdos em formato declarativo (`.md`/`MDC` ou JSON normalizado) com componentes semânticos (`<md-section>`, `<md-stepper>`).
- Criar novos componentes: "Tabela Verdade", "Fluxograma" e "Simulador de Execução" revisados, incluindo acessibilidade e animações MD.
- Implementar trilhas de exercícios com gradação de dificuldade e feedback automático.

### 5.2 Desenvolvimento para Dispositivos Móveis (DDM)

- Reestruturar aulas por sprints (Descoberta, UI/UX, Persistência, Integração, Publicação).
- Substituir componentes atuais por: "Painel de Arquitetura" (visualizar camadas MVVM/Clean), "Mapa de Release" e "Checklist de Loja".
- Revisar conteúdos para alinhar-se às guidelines de Android/iOS e atualizar tecnologias (Compose, SwiftUI, Flutter).

### 5.3 Linguagens de Programação Orientada a Objetos (LPOO)

- As aulas 01-08 foram migradas para o schema `md3.lesson.v1`, reorganizando objetivos, planos de voo e novos blocos MD3 (fluxogramas, tabelas de visibilidade e diagramas de blocos). 【F:src/content/courses/lpoo/lessons/lesson-01.json†L1-L214】【F:src/content/courses/lpoo/lessons/lesson-02.json†L1-L203】【F:src/content/courses/lpoo/lessons/lesson-03.json†L1-L214】【F:src/content/courses/lpoo/lessons/lesson-04.json†L1-L227】【F:src/content/courses/lpoo/lessons/lesson-05.json†L1-L210】【F:src/content/courses/lpoo/lessons/lesson-06.json†L1-L208】【F:src/content/courses/lpoo/lessons/lesson-07.json†L1-L242】【F:src/content/courses/lpoo/lessons/lesson-08.json†L1-L211】
- O índice `lessons.json` agora aponta para os arquivos JSON, traz resumo, tags, duração e `formatVersion`, permitindo que os relatórios de governança identifiquem o status real das aulas. 【F:src/content/courses/lpoo/lessons.json†L1-L64】
- Próximos passos: preparar um componente "ClassDesigner" a partir do `Md3BlockDiagram` para ilustrar relações UML, migrar exercícios (`modelagem-uml.json`, `refatoracao.json`) para o novo schema e registrar rubricas alinhadas às competências de orientação a objetos.

### 5.4 Tecnologia e Desenvolvimento para Jogos Digitais (TDJD)

- Estruturar jornadas: Ideação → Prototipagem → Produção → Publicação → Pós-lançamento.
- Desenvolver componentes visuais: "Pipeline Canvas", "Matriz de Mecânicas" e "Quadro de Assets".
- Integrar checklists técnicos (builds multiplataforma) e referências a motores modernos (Unity 6, Unreal 5, Godot 4).

### 5.5 Teoria Geral de Sistemas (TGS)

- Reorganizar aulas para enfatizar pensamento sistêmico aplicado (mapas de causalidade, diagramas de loops, modelagem de estoques e fluxos).
- Criar componente "System Mapper" para diagramas dinâmicos e "Radar de Competências" para avaliação formativa.
- Atualizar materiais com estudos de caso atuais (transformação digital, ESG, saúde pública).

## 6. Arquitetura de Conteúdo Proposta

1. **Formato único**: adotar Markdown enriquecido (MDX/MDC) ou JSON schema padronizado (`formatVersion`, `summary`, `competencies`, `outcomes`, `resources`, `assessment`, `metadata`).
2. **Pipelines automáticos**: scripts para validar schema, gerar relatórios de consistência e sincronizar índices (`lessons.json`, `exercises.json`).
3. **Metadados obrigatórios**: duração estimada, competências, recursos necessários, modalidade (presencial/assíncrona), avaliação associada.
4. **Separação de responsabilidades**: conteúdos textuais separados dos componentes; renderização feita por componentes genéricos (e.g., `<md-content-block>`).

### 6.1 Schema JSON Normalizado

- O diretório `schemas/` centraliza os contratos `lesson`, `lessons-index`, `exercises-index` e `supplements-index`, padronizando `formatVersion`, `summary`, `competencies`, `outcomes`, `metadata` e links de recursos para todas as disciplinas. 【F:schemas/lesson.schema.json†L1-L205】【F:schemas/lessons-index.schema.json†L1-L34】【F:schemas/exercises-index.schema.json†L1-L42】【F:schemas/supplements-index.schema.json†L1-L42】
- O módulo `src/content/schema/` expõe tipos TypeScript e os mesmos schemas JSON para consumo pelos renderizadores MD3, pipelines de geração e testes unitários. 【F:src/content/schema/index.ts†L1-L6】【F:src/content/schema/lesson.ts†L1-L70】
- O script `npm run validate:content` usa os novos schemas no Ajv, gera alertas de metadados obrigatórios ausentes (`summary`, `competencies`, `metadata.updatedAt`, `metadata.owners`) e mantém o relatório em `reports/content-validation-report.json`. 【F:scripts/validate-content.mjs†L1-L200】【F:scripts/validate-content.mjs†L1000-L1095】

## 7. Roadmap de Implementação

1. **Semana 1-2** – Pesquisa e definição de tokens MD3 + prototipação visual (Figma) + escolha de framework (Material Web + Tailwind compatibilizado).
2. **Semana 3-4** – Implementar fundações (tokens, helpers) e recriar componentes base (botões, cartões, layouts). Migrar `SiteHeader`/`Footer` para novos padrões.
3. **Semana 5-6** – Construir biblioteca didática (TruthTable, Flowchart, Diagramas) com testes de snapshot e documentação Storybook.
4. **Semana 7-8** – Migrar conteúdo do curso ALGI para novo schema, incluindo exercícios e suplementos revisados.
5. **Semana 9-10** – Repetir processo para DDM e LPOO, ajustando componentes específicos.
6. **Semana 11-12** – Finalizar TDJD e TGS, consolidar plano de manutenção contínua e governança de conteúdo.

## 8. Próximos Passos Imediatos

- [x] Montar squad de design + pedagogia para validar tokens e fluxos críticos (ver `docs/governance/initial-squad-kickoff.md`).
- [x] Definir schema JSON/MDX definitivo e scripts de validação.
- [x] Planejar sessões de revisão com docentes para saneamento de conteúdos incorretos antes da migração técnica (ver `docs/governance/faculty-review-sessions.md`).

### 8.1 Detalhamento do Passo 1 – Governança inicial

O diretório `docs/governance/` reúne o plano de ativação da squad multidisciplinar, com composição sugerida, rituais, backlog
inicial e métricas de acompanhamento. Essa estrutura deve ser atualizada semanalmente para registrar decisões, RACI e calendários de saneamento.

### 8.2 Detalhamento do Passo 2 – Sessões de revisão com docentes

O documento `docs/governance/faculty-review-sessions.md` organiza a agenda, indicadores e checklist operacional das quatro semanas de revisão por disciplina. Antes da migração técnica, a squad deve seguir o roteiro, registrar atas e atualizar o backlog com os encaminhamentos aprovados, garantindo que os conteúdos estejam saneados e com metadados completos.

## 9. Reconstrução da Biblioteca Didática

### 9.1 Fluxogramas (Flowchart)

- **API declarativa:** consolidada via `FlowNode`/`FlowConnection`, permitindo hidratar o componente diretamente dos conteúdos normalizados sem cálculos manuais. 【F:src/components/lesson/Md3Flowchart.vue†L66-L133】
- **Layout responsivo:** o novo `Md3Flowchart` utiliza cartões MD3, conectores verticais e ramificações em grid para suportar decisões múltiplas. Próximos passos incluem animações de foco/seleção e modo compacto para mobile extremo. 【F:src/components/lesson/Md3Flowchart.vue†L1-L214】
- **Documentação viva:** especificação publicada em `docs/didactics/md3-flowchart.md`, servindo como base para Storybook e exemplos integrados às aulas. 【F:docs/didactics/md3-flowchart.md†L1-L60】
- **Testes automatizados:** a suíte `Md3Flowchart.test.ts` cobre fluxos lineares, bifurcações e conexões customizadas; ampliar cenários visuais e testes de interação é etapa seguinte. 【F:src/components/lesson/**tests**/Md3Flowchart.test.ts†L1-L74】

### 9.2 Tabelas Verdade (TruthTable)

- **API MD3 consolidada:** o componente agora aceita títulos, descrições, legendas e `legend` configurável, com células serializáveis (`value`, `display`, `state`, `srLabel`) e suporte a alinhamento por coluna. 【F:src/components/lesson/TruthTable.vue†L63-L176】【F:docs/didactics/truth-table.md†L1-L74】
- **Estilização responsiva:** scroller com fallback para `color-mix`, estados `is-true/false/emphasis` tonalizados e legenda em cards MD3 para reforçar semântica. 【F:src/components/lesson/TruthTable.vue†L188-L327】
- **Próximos passos:** publicar cenários no Storybook, ligar o componente aos esquemas normalizados das aulas de lógica e criar presets específicos por disciplina (ex.: operadores avançados, comparativos de circuitos). 【F:docs/didactics/truth-table.md†L76-L101】

### 9.3 Diagramas de Blocos (BlockDiagram)

- **Componente MD3 publicado:** o novo `Md3BlockDiagram` entrega grid responsivo baseado em camadas, blocos tonais por tipo (`process`, `data-store`, `input-output`, `external`) e canais textuais acessíveis, com suporte a legenda e modo `dense`. 【F:src/components/lesson/Md3BlockDiagram.vue†L1-L197】
- **Integração no runtime:** `blockRegistry` reconhece o bloco `blockDiagram`, normalizando `blocks`, `channels`, `legend` e ativando métricas estruturadas diretamente a partir do conteúdo serializado. 【F:src/components/lesson/blockRegistry.ts†L1-L220】
- **Documentação e testes:** blueprint atualizado detalha o schema e cobertura de testes (`Md3BlockDiagram.test.ts`) garantindo ordenação, acessibilidade e legendas. Próximo passo é publicar stories e presets por disciplina.【F:docs/didactics/block-diagram.md†L1-L83】【F:src/components/lesson/\_\_tests\_\_/Md3BlockDiagram.test.ts†L1-L56】

### 9.4 Barra superior (Top App Bar)

- **Componente estrutural:** `Md3TopAppBar` agora expõe variantes (`small`, `center-aligned`, `medium`, `large`), densidades (`default`, `comfortable`, `compact`) e slots contextuais (`breadcrumbs`, `search`, `supporting`), mantendo elevação automática conforme o scroll. 【F:src/components/layout/Md3TopAppBar.vue†L1-L129】
- **Aplicação no shell:** `SiteHeader.vue` utiliza a variante `center-aligned` com densidade `comfortable`, enquanto o `Md3AppShell` injeta breadcrumbs, busca contextual e menus específicos por curso. 【F:src/components/SiteHeader.vue†L1-L74】【F:src/components/layout/Md3AppShell.vue†L1-L248】
- **Testes e documentação:** a suíte `Md3TopAppBar.test.ts` cobre variantes, densidade, elevação e slots de suporte; as histórias do Storybook exibem os cenários `small`, `center-aligned`, `medium` e `large` com ações interativas. 【F:src/components/layout/**tests**/Md3TopAppBar.test.ts†L1-L78】【F:src/components/layout/Md3TopAppBar.stories.ts†L1-L88】
- **Próximos passos:** capturar estados visuais (hover/focus) e validar componentes de busca/filtro no Storybook.

### 9.5 Navegação lateral (Navigation Rail & Drawer)

- **Rail MD3:** `Md3NavigationRail` oferece variantes `expanded`/`collapsed`, badges e seletor `density`, com eventos `select` e `update:activeId` para sincronizar com roteadores ou dashboards. 【F:src/components/layout/Md3NavigationRail.vue†L1-L123】
- **Drawer MD3:** `Md3NavigationDrawer` suporta modos `standard`/`modal`, descrições auxiliares e badges para pendências, funcionando como navegação persistente ou overlay. 【F:src/components/layout/Md3NavigationDrawer.vue†L1-L119】
- **Testes e stories:** suites dedicadas garantem seleção ativa e modifiers (`compact`, `modal`, `collapsed`); Storybook documenta cenários interativos para validação rápida com docentes. 【F:src/components/layout/**tests**/Md3NavigationRail.test.ts†L1-L51】【F:src/components/layout/**tests**/Md3NavigationDrawer.test.ts†L1-L47】【F:src/components/layout/Md3NavigationRail.stories.ts†L1-L71】【F:src/components/layout/Md3NavigationDrawer.stories.ts†L1-L63】
- **Próximos passos:** conectar badges e descrições a indicadores reais (progresso de migração, pendências docentes) e orquestrar comportamentos combinados com o bottom app bar.

### 9.7 App shell responsivo

- **Componentização completa:** `Md3AppShell` centraliza top app bar, rail, drawer modal e bottom app bar, expondo slots `brand`, `actions`, `top-supporting`, `main`, `secondary` e integrações para breadcrumbs e busca. 【F:src/components/layout/Md3AppShell.vue†L1-L248】
- **Busca e breadcrumbs:** o shell alimenta `CourseLayout.vue`, sincronizando o campo de busca com o roteador (`q`) e breadcrumbs dinâmicos para aulas/exercícios. 【F:src/pages/CourseLayout.vue†L1-L268】
- **Tokens de layout:** novos tokens de breakpoints, contêineres e alturas de app bar abastecem o shell e demais componentes, garantindo consistência responsiva. 【F:src/theme/tokens.ts†L1-L148】【F:src/theme/material-theme.ts†L1-L229】
- **Storybook e prototipagem:** histórias dedicadas documentam o shell completo, breadcrumbs, campo de busca e bottom app bar com roteador de memória para validar navegação e estados responsivos. 【F:src/components/layout/Md3AppShell.stories.ts†L1-L200】【F:src/components/layout/Md3Breadcrumbs.stories.ts†L1-L74】【F:src/components/layout/Md3SearchField.stories.ts†L1-L61】【F:src/components/layout/Md3BottomAppBar.stories.ts†L1-L83】
- **Próximos passos:** ligar badges e contagens a dados reais do painel docente e adicionar testes end-to-end mobile/viewport para cobrir transições de drawer/rail/bottom bar.

### 9.6 Higienização de HTML estruturado

- **Utilitário central:** o novo helper `sanitizeHtml` usa DOMPurify para remover `<script>`, atributos perigosos e normalizar iframes antes de injetar trechos ricos vindos do conteúdo serializado. 【F:src/utils/sanitizeHtml.ts†L1-L35】
- **Componentes blindados:** FlightPlan, ContentBlock, CardGrid, Accordion, LessonPlan e correlatos agora sanitizam cada `v-html`, preservando tipografia MD3 sem expor eventos inline ou código arbitrário. 【F:src/components/lesson/ContentBlock.vue†L1-L126】【F:src/components/lesson/CardGrid.vue†L1-L220】
- **Cobertura automatizada:** a suíte `SanitizeHtml.test.ts` cobre casos de injeção via atributos (`onerror`, `onclick`) e tags proibidas, garantindo que futuros componentes consumam o helper. 【F:src/components/lesson/**tests**/SanitizeHtml.test.ts†L1-L55】

## 10. Plano de Migração de Conteúdo por Disciplina

### 10.1 Algoritmos e Programação I (ALGI)

| Fase                    | Escopo                                                            | Ações principais                                                                                                                                                                                                       |
| ----------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diagnóstico             | Inventário dos 32 pares `.json`/`.vue` listados em `lessons.json` | Consolidar em um único formato estruturado, eliminando duplicidade de arquivos por aula.【F:src/content/courses/algi/lessons.json†L1-L120】                                                                            |
| Reescrita Sequencial    | Aulas 01-09                                                       | Converter narrativas para blocos semânticos (`<md-learning-object>`, `<md-activity>`) e remover HTML cru renderizado via `v-html` em componentes legados.【F:src/content/courses/algi/lessons/lesson-01.json†L1-L120】 |
| Estruturas Condicionais | Aulas 10-18                                                       | Integrar as aulas de lógica ao novo `Md3Flowchart`, gerando dados compatíveis (`nodes`, `connections`) e preparando exercícios de decisão com feedback automático.                                                     |
| Modularização e Vetores | Aulas 19-32                                                       | Definir projetos integradores com feedback automático, anexar metadados de tempo de estudo e competências obrigatórias.                                                                                                |

- **Progresso atual:** as aulas `lesson-01.json` a `lesson-15.json` estão no schema `md3.lesson.v1`, incluindo planos de aula, fluxogramas, tabelas verdade, cronogramas de avaliação e devolutivas alinhadas à NP1. O índice `lessons.json` aponta para os novos arquivos JSON com resumo, duração, tags e `formatVersion` atualizados. 【F:src/content/courses/algi/lessons/lesson-07.json†L1-L258】【F:src/content/courses/algi/lessons/lesson-10.json†L1-L266】【F:src/content/courses/algi/lessons/lesson-12.json†L1-L308】【F:src/content/courses/algi/lessons/lesson-13.json†L1-L326】【F:src/content/courses/algi/lessons/lesson-14.json†L1-L230】【F:src/content/courses/algi/lessons/lesson-15.json†L1-L360】【F:src/content/courses/algi/lessons.json†L97-L204】
- **Próximos passos imediatos:** migrar as aulas 16-18 (atividade prática assíncrona e introdução a laços `while`/`for`) para o schema unificado, iniciando a fase de estruturas de repetição e preparando materiais de laboratório específicos. 【F:src/content/courses/algi/lessons.json†L161-L204】

### 10.2 Desenvolvimento para Dispositivos Móveis (DDM)

| Fase                     | Escopo                                      | Ações principais                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Curadoria inicial        | `lessons/lesson-01.json` a `lesson-12.json` | Substituir blocos com HTML inline e classes Tailwind personalizadas por componentes MD (accordion, timeline, callout) parametrizados.【F:src/content/courses/ddm/lessons/lesson-01.json†L1-L120】 |
| Jornada por sprint       | Módulos descritos em `lessons.json`         | Reagrupar as aulas por sprint (Descoberta → Publicação) e garantir consistência de objetivos, duração e entregáveis.【F:src/content/courses/ddm/lessons.json†L1-L120】                            |
| Exercícios e suplementos | `exercises/*.json` e `supplements.json`     | Transformar exercícios em roteiros práticos integrados ao Storybook dos componentes e revisar metadados obrigatórios (competências, modalidade).                                                  |

- **Progresso atual:** as aulas `lesson-01.json` a `lesson-12.json` já estão no schema `md3.lesson.v1`, com navegação, ciclo de vida, Intents e mini projeto de contatos descritos em blocos MD3 estruturados. O índice `lessons.json` referencia os novos arquivos, inclui `summary`, `tags`, duração e `formatVersion`, eliminando os wrappers `.vue` remanescentes.
- **Próximos passos imediatos:** migrar as aulas 13-14 (integração com sensores e publicação) e preparar a rodada final de exercícios/suplementos antes de iniciar o saneamento de LPOO.

### 10.3 Linguagens de Programação Orientada a Objetos (LPOO)

| Fase                       | Escopo                                 | Ações principais                                                                                                                                                                   |
| -------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Levantamento               | `lessons.json` + diretório `lessons/`  | Padronizar objetivos por aula e remover trechos com HTML inline em favor de componentes de diagrama UML e timelines interativas.【F:src/content/courses/lpoo/lessons.json†L1-L80】 |
| Componentes especializados | Aulas de classes, herança e interfaces | Criar componentes "Class Designer" e "Interaction Diagram" com suporte a exportação de casos de uso e avaliações por rubrica.                                                      |
| Integração Git             | Materiais de projetos finais           | Definir templates GitHub Classroom, conectando atividades aos repositórios oficiais e automatizando correções.                                                                     |

### 10.4 Tecnologia e Desenvolvimento para Jogos Digitais (TDJD)

| Fase                    | Escopo                                              | Ações principais                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Revisão de conteúdo     | `lessons.json` e `lessons/lesson-01.json` em diante | Atualizar referências tecnológicas (Unity 6, Godot 4) e remover HTML com classes ad-hoc, substituindo por componentes de painel e matriz.【F:src/content/courses/tdjd/lessons.json†L1-L80】 |
| Componentes interativos | Módulos de produção e pós-lançamento                | Desenvolver "Pipeline Canvas", "Matriz de Mecânicas" e "Quadro de Assets" com suporte a drag-and-drop e avaliação formativa.                                                                |
| Governança              | `supplements.json` e `exercises.json`               | Incluir metadados de carga horária, plataformas alvo e critérios de avaliação contínua.                                                                                                     |

### 10.5 Teoria Geral de Sistemas (TGS)

| Fase                   | Escopo                           | Ações principais                                                                                                                                                                                      |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reorganização          | Aulas listadas em `lessons.json` | Reestruturar conteúdos em jornadas (mapas de causalidade → simulações) e substituir blocos de texto puro por componentes de visualização dinâmica.【F:src/content/courses/tgs/lessons.json†L1-L80】   |
| Componentes sistêmicos | Atividades de modelagem          | Criar "System Mapper" com suporte a loops de feedback, reaproveitando o padrão do `Md3Flowchart` para representar fluxos de causalidade, além do "Radar de Competências" para autoavaliação contínua. |
| Avaliação              | Materiais em `exercises/`        | Definir rubricas alinhadas às competências sistêmicas e integrar dashboards de acompanhamento.                                                                                                        |

## 11. Execução em andamento

- Remoção dos componentes legados em `src/components/didactics` para liberar a nova arquitetura de biblioteca didática. 【F:src/components/lesson/Md3Flowchart.vue†L1-L214】
- Entrega do novo `Md3Flowchart` com API declarativa, conectores configuráveis e tokens MD3 aplicados. 【F:src/components/lesson/Md3Flowchart.vue†L1-L214】
- Documentação inicial publicada em `docs/didactics/md3-flowchart.md`, orientando próximos componentes. 【F:docs/didactics/md3-flowchart.md†L1-L60】
- Testes atualizados para cobrir fluxos lineares, bifurcações e loops customizados. 【F:src/components/lesson/**tests**/Md3Flowchart.test.ts†L1-L74】

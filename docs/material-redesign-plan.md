# Plano de Modernização de Componentes e Conteúdos

## 1. Objetivos Gerais

- Aderir às diretrizes do Material Design 3 em toda a superfície da aplicação, criando um design system consistente e auditável.
- Reestruturar o acervo de aulas para eliminar duplicidades, corrigir erros conceituais e padronizar formatos de entrega.
- Substituir os componentes didáticos atuais por uma biblioteca nova, escalável e orientada às necessidades de cada disciplina.

## 2. Diagnóstico da Interface Atual

### 2.1 Fundações de estilo

- O arquivo `src/assets/styles.css` mantém tokens manuais de cor, tipografia e sombras que não seguem a paleta dinâmica do Material 3, nem aplicam esquemas derivados claros/escuros (p. ex. variáveis `--md-sys-color-*` com valores estáticos e inconsistentes). 【F:src/assets/styles.css†L1-L110】
- A alternância de tema no `main.ts` limita-se a adicionar/remover a classe `light`, sem gerenciamento de contrastes, modos dinâmicos ou persistência multicanal (não há sincronização com `prefers-color-scheme`). 【F:src/main.ts†L1-L15】

### 2.2 Componentes didáticos existentes

- O diretório legado `src/components/didactics` foi removido nesta etapa; o novo `Md3Flowchart` já nasce com estrutura semântica, conexões configuráveis e tokens MD3 aplicados diretamente no componente de aula. 【F:src/components/lesson/Md3Flowchart.vue†L1-L214】
- A `TruthTable.vue` em `lesson/` foi reescrita com cabeçalho, descrição, legenda e estados MD3 declarativos, cobrindo ícones acessíveis, notas e densidade configurável. 【F:src/components/lesson/TruthTable.vue†L1-L327】
- Ainda carecemos de documentação viva consolidada; a nova pasta `docs/didactics` inicia esse processo com a especificação do fluxograma MD3 e deve receber as próximas migrações. 【F:docs/didactics/md3-flowchart.md†L1-L60】

### 2.3 Arquitetura de páginas

- O cabeçalho `SiteHeader.vue` não utiliza componentes nativos de app bar do MD3 (e.g., `TopAppBar`), carecendo de hierarquia tipográfica e padrões de navegação adaptativa. 【F:src/components/SiteHeader.vue†L1-L59】
- Não há camada de layout responsiva consolidada; páginas fazem uso direto de classes utilitárias sem tokens espaciais padronizados.

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

- Consolidar aulas em torno de casos de uso reais, introduzindo diagramas UML interativos.
- Criar componente "Class Designer" com suporte a herança, interfaces e relações.
- Vincular exercícios a repositórios Git (templates) e definir rubricas de avaliação por competência.

### 5.4 Tecnologia e Desenvolvimento para Jogos Digitais (TDJD)

- Estruturar jornadas: Ideação → Prototipagem → Produção → Publicação → Pós-lançamento.
- Desenvolver componentes visuais: "Pipeline Canvas", "Matriz de Mecânicas" e "Quadro de Assets".
- Integrar checklists técnicos (builds multiplataforma) e referências a motores modernos (Unity 6, Unreal 5, Godot 4).

### 5.5 Teoria Geral de Sistemas (TGS)

- Reorganizar aulas para enfatizar pensamento sistêmico aplicado (mapas de causalidade, diagramas de loops, modelagem de estoques e fluxos).
- Criar componente "System Mapper" para diagramas dinâmicos e "Radar de Competências" para avaliação formativa.
- Atualizar materiais com estudos de caso atuais (transformação digital, ESG, saúde pública).

## 6. Arquitetura de Conteúdo Proposta

1. **Formato único**: adotar Markdown enriquecido (MDX/MDC) ou JSON schema padronizado (`title`, `objectives`, `activities`, `resources`, `assessments`).
2. **Pipelines automáticos**: scripts para validar schema, gerar relatórios de consistência e sincronizar índices (`lessons.json`, `exercises.json`).
3. **Metadados obrigatórios**: duração estimada, competências, recursos necessários, modalidade (presencial/assíncrona), avaliação associada.
4. **Separação de responsabilidades**: conteúdos textuais separados dos componentes; renderização feita por componentes genéricos (e.g., `<md-content-block>`).

## 7. Roadmap de Implementação

1. **Semana 1-2** – Pesquisa e definição de tokens MD3 + prototipação visual (Figma) + escolha de framework (Material Web + Tailwind compatibilizado).
2. **Semana 3-4** – Implementar fundações (tokens, helpers) e recriar componentes base (botões, cartões, layouts). Migrar `SiteHeader`/`Footer` para novos padrões.
3. **Semana 5-6** – Construir biblioteca didática (TruthTable, Flowchart, Diagramas) com testes de snapshot e documentação Storybook.
4. **Semana 7-8** – Migrar conteúdo do curso ALGI para novo schema, incluindo exercícios e suplementos revisados.
5. **Semana 9-10** – Repetir processo para DDM e LPOO, ajustando componentes específicos.
6. **Semana 11-12** – Finalizar TDJD e TGS, consolidar plano de manutenção contínua e governança de conteúdo.

## 8. Próximos Passos Imediatos

- Montar squad de design + pedagogia para validar tokens e fluxos críticos.
- Definir schema JSON/MDX definitivo e scripts de validação.
- Planejar sessões de revisão com docentes para saneamento de conteúdos incorretos antes da migração técnica.

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

- **Normalizar dimensões:** reconstruir o componente como grid responsivo baseado em tokens MD3, evitando coordenadas absolutas e mantendo legibilidade em telas menores.【F:docs/didactics/block-diagram.md†L1-L18】
- **Conectores semânticos:** avaliar utilitários (`elkjs`, `vue-flow`) ou algoritmos próprios para gerar ligações navegáveis por teclado, descritas no blueprint de bloco.【F:docs/didactics/block-diagram.md†L1-L18】
- **Pacote unificado:** publicar os componentes reprojetados em `@/components/md-didactics` com documentação interativa e testes de snapshot.

## 10. Plano de Migração de Conteúdo por Disciplina

### 10.1 Algoritmos e Programação I (ALGI)

| Fase                    | Escopo                                                            | Ações principais                                                                                                                                                                                                       |
| ----------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diagnóstico             | Inventário dos 32 pares `.json`/`.vue` listados em `lessons.json` | Consolidar em um único formato estruturado, eliminando duplicidade de arquivos por aula.【F:src/content/courses/algi/lessons.json†L1-L120】                                                                            |
| Reescrita Sequencial    | Aulas 01-09                                                       | Converter narrativas para blocos semânticos (`<md-learning-object>`, `<md-activity>`) e remover HTML cru renderizado via `v-html` em componentes legados.【F:src/content/courses/algi/lessons/lesson-01.json†L1-L120】 |
| Estruturas Condicionais | Aulas 10-18                                                       | Integrar as aulas de lógica ao novo `Md3Flowchart`, gerando dados compatíveis (`nodes`, `connections`) e preparando exercícios de decisão com feedback automático.                                                     |
| Modularização e Vetores | Aulas 19-32                                                       | Definir projetos integradores com feedback automático, anexar metadados de tempo de estudo e competências obrigatórias.                                                                                                |

### 10.2 Desenvolvimento para Dispositivos Móveis (DDM)

| Fase                     | Escopo                                      | Ações principais                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Curadoria inicial        | `lessons/lesson-01.json` a `lesson-12.json` | Substituir blocos com HTML inline e classes Tailwind personalizadas por componentes MD (accordion, timeline, callout) parametrizados.【F:src/content/courses/ddm/lessons/lesson-01.json†L1-L120】 |
| Jornada por sprint       | Módulos descritos em `lessons.json`         | Reagrupar as aulas por sprint (Descoberta → Publicação) e garantir consistência de objetivos, duração e entregáveis.【F:src/content/courses/ddm/lessons.json†L1-L120】                            |
| Exercícios e suplementos | `exercises/*.json` e `supplements.json`     | Transformar exercícios em roteiros práticos integrados ao Storybook dos componentes e revisar metadados obrigatórios (competências, modalidade).                                                  |

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

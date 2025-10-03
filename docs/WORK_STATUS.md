# Status das Atividades de Melhoria

## O que já foi entregue

1. **Revisão de arquitetura e manutenção** (`docs/ARCHITECTURE_REVIEW.md`)
   - Diagnóstico da estrutura atual (Vue 3 + Vite) e mapeamento dos principais pontos fortes e fragilidades.
   - Plano de ação para testes, validação de conteúdo e redução de boilerplate.
   - Roadmap priorizado com foco em automação de lições, aderência ao Material Design 3 (MD3) e governança de conteúdo.
2. **Playbook de prompts para LLMs** (`docs/LLM_PROMPT_PLAYBOOK.md`)
   - Conjunto de prompts reutilizáveis para criação, migração e revisão de aulas.
   - Checklist para garantir que a geração automatizada mantenha o padrão esperado (IDs, blocos válidos, bibliografia, etc.).
   - Diretrizes específicas para ajustes visuais alinhados ao MD3.
3. **Automação inicial de conteúdo**
   - CLI `npm run scaffold:lesson` para criar JSON, wrapper Vue e atualizar `lessons.json` em um único passo.
   - Validador `npm run validate:content` baseado em Ajv/TypeBox para garantir ids únicos e esquema mínimo antes do deploy.
4. **Padronização de lições publicadas**
   - IDs, arquivos JSON/Vue e índices `lessons.json` migrados para o padrão `lesson-XX` (zero-padding) em todos os cursos.
   - `validate:content` reforça correspondência entre id, nome do arquivo e esquema, evitando divergências futuras.
5. **Validação automática no fluxo de commits**
   - O pre-commit configurado com `simple-git-hooks` agora executa `npm run validate:content` sempre que arquivos de `src/content/` são modificados.
   - Previne que lições inconsistentes (ids diferentes do arquivo, blocos sem `type`, bibliografias vazias) cheguem ao repositório remoto.

6. **Renderer modular e validação reforçada de blocos**
   - `LessonRenderer` passou a usar um registry centralizado para mapear cada `block.type` ao componente Vue correspondente, eliminando o encadeamento de `v-if` e facilitando lazy-loading futuro.
   - O mesmo catálogo sustenta `validate:content`, que agora bloqueia blocos desconhecidos ou componentes customizados não registrados, reduzindo erros em contribuições humanas ou geradas por LLM.
7. **Campos obrigatórios por tipo de bloco**
   - `validate:content` agora verifica estrutura mínima para blocos MD3 críticos (`videos`, `callout`, `accordion`, `bibliography`, `truthTable`, etc.) e acusa quando faltam arrays, ids de vídeo ou bibliografias.
   - Os erros apontam o índice no `content[]`, o arquivo afetado e a dica em português, facilitando correção rápida por autores humanos ou assistidos por IA.

8. **Relatório agregado de validação**
   - `npm run validate:report` gera um JSON consolidando totais de lições avaliadas, quantidade de problemas/avisos e a lista de arquivos afetados por curso.
   - O relatório facilita a priorização de blocos legados ou inconsistências e pode ser redirecionado para outros caminhos com `--report <arquivo>`.

9. **Validação contínua no CI/CD**
   - O workflow de deploy executa `npm run validate:report` em todas as execuções, anexa o relatório agregado como artefato e interrompe a publicação quando houver problemas.
   - Permite baixar rapidamente o diagnóstico via GitHub Actions, mantendo o histórico das execuções anteriores para auditoria.

10. **Lint de nomenclatura para blocos chave**

- `validate:content` agora acusa valores fora do padrão em `callout.variant` e ícones de `lessonPlan`, garantindo que apenas tokens documentados sejam aceitos.
- `Callout.vue` passou a reconhecer o variant `task` com visual alinhado ao MD3 e `LessonPlan.vue` interpreta diferentes variações de nomes de ícones sem quebrar retrocompatibilidade.
- Guias de autoria e prompts de LLM foram atualizados para reforçar os nomes canônicos aceitos pelos validadores.

11. **Validação de cardGrid e manifestos de exercícios**

- `validate:content` passou a verificar que cada card do `cardGrid` tem título, conteúdo renderizável, ações válidas e variantes canônicas (aceitando apenas tons MD3 ou os mesmos tokens de `callout`).
- Campos numéricos como `columns` agora precisam ser inteiros entre 1 e 4, evitando grids quebrados.
- Os manifestos `exercises.json` passam por validação de esquema, prefixo de link (`courses/<curso>/exercises/`) e correspondência entre `id` e nome do arquivo, garantindo que wrappers/JSON existam quando a atividade estiver marcada como disponível.

12. **Proveniência e manifestos complementares**

- `validate:content` exige `metadata.generatedBy`, `metadata.model` e `metadata.timestamp` em cada exercício e passou a validar `supplements.json` (tipos permitidos, links/arquivos e duplicidades).
- Índices de exercícios foram atualizados com metadados de geração e cada curso agora possui um manifesto inicial de suplementos para registrar materiais extras.
- Guias de autoria e prompts de LLM descrevem como preencher os metadados e como versionar esses materiais opcionais.

13. **Relatório com metadados de geração**

- `npm run validate:report` passou a consolidar, por curso, quem gerou cada exercício/suplemento, qual modelo foi usado e os timestamps registrados, mantendo totais por autor/modelo e intervalo temporal das entregas.
- O snapshot em `reports/content-validation-report.json` facilita auditorias rápidas sem abrir os manifestos individuais.

Esses materiais dão visibilidade sobre o estado atual do projeto e aceleram a colaboração humana ou assistida por IA ao documentar expectativas, fluxos e boas práticas.

14. **Metadados canônicos por curso**

- `npm run validate:content` agora bloqueia `meta.json` sem `id` alinhado ao diretório do curso, títulos curtos ou descrições abaixo de 60 caracteres.
- O campo `institution` precisa usar nomes padronizados (`Unichristus`, `Unifametro`), evitando variações que quebrariam filtros e badges na interface.

15. **Painel do relatório de validação**

- Página dedicada no site (`/relatorios/validacao-conteudo`) resume totais da última execução do validador e lista lições com problemas/avisos.
- O cabeçalho ganhou atalho permanente para o painel, permitindo acompanhar os apontamentos sem rodar scripts manualmente.

16. **Proveniência no painel de relatório**

- A seção "Proveniência dos materiais gerados" apresenta cobertura de metadados por curso, autores mais frequentes e modelos usados em exercícios e suplementos.
- Ajuda a priorizar lacunas de rastreabilidade antes de liberar novos materiais e dá visibilidade a contribuições humanas ou assistidas por IA.

17. **Biblioteca MD3 avançada**

- Centralizamos os tokens de tipografia, superfícies, elevações e contrastes (`.md-typescale-*`, `.md-surface*`, `.md-elevation-*`, `.text-on-*`, `.md-icon--*`) em `src/assets/styles.css`.
- Atualizamos componentes-chave (painel de validação, cards de curso e blocos de lição) para consumir os novos utilitários e eliminar estilos inline divergentes.

18. **Observabilidade automatizada do conteúdo**

- `npm run report:observability` gera `reports/content-observability.json` com métricas por curso (lições publicadas, blocos MD3 vs. legados e cobertura de metadados em exercícios/suplementos).
- O relatório destaca as lições e exercícios que ainda usam blocos legados, facilitando priorizar migrações no roadmap de MD3.
- README e documentação de fluxo foram atualizados para divulgar o comando e incentivar a revisão contínua dos indicadores.

19. **Observabilidade integrada ao CI/CD**

- O workflow de deploy agora roda `npm run report:observability:check` após a validação, publica `reports/content-observability.json` como artefato e falha quando há exercícios ou suplementos sem metadados obrigatórios.
- Mantém os snapshots de validação e observabilidade disponíveis para download direto no GitHub Actions, reforçando a rastreabilidade das métricas a cada execução.

20. **Governança automatizada em CI/CD**

- `npm run report:governance` cruza validação e observabilidade gerando `reports/governance-alert.md`/`.json` com problemas, avisos, blocos legados e lacunas de metadados por curso.
- O workflow de deploy publica o alerta como artefato e mantém atualizada uma issue automática (`governanca-automatica`) com o resumo das pendências, facilitando o acompanhamento contínuo da redução de blocos legados.

21. **Squad de governança inicial estruturada**

- `docs/governance/initial-squad-kickoff.md` define papéis, rituais, backlog inicial e métricas do passo 1 do plano de modernização.
- O plano de modernização (`docs/material-redesign-plan.md`) passou a rastrear o avanço com checklists por passo, vinculando o diretório de governança às próximas entregas.

22. **Plano de sessões de revisão com docentes**

- `docs/governance/faculty-review-sessions.md` detalha agenda semanal por curso, indicadores e checklist operacional para o saneamento dos conteúdos antes da migração técnica.
- O plano de modernização foi atualizado para rastrear a execução das sessões e vincular os entregáveis aos próximos passos da biblioteca MD3.

23. **Inventário de conteúdo por curso (site pessoal)**

- `npm run report:courses` gera `reports/course-content-summary.json` consolidando aulas publicadas, arquivos ausentes e duplicidades `.json`/`.vue` por disciplina.
- `docs/content/personal-site-course-plan.md` traduz o relatório em um plano de ação voltado ao portal pessoal do professor, destacando prioridades para publicação das próximas aulas e criação de novos componentes MD3.

24. **Fundações MD3 consolidadas**

- `src/theme/tokens.ts` centraliza escalas de cor, tipografia, espaçamento, elevação e formas, enquanto `initMaterialTheme` aplica os tokens dinamicamente e mantém aliases legados durante a migração. 【F:src/theme/tokens.ts†L1-L126】【F:src/theme/material-theme.ts†L1-L229】
- `docs/design-system/tokens.md` documenta convenções de uso, próximos passos e como expandir o catálogo para motion/densidade.

25. **Storybook do design system**

- Configuração do Storybook 8 com Vite (`.storybook/main.ts` e `.storybook/preview.ts`) e scripts `npm run storybook`/`npm run build-storybook`. 【F:.storybook/main.ts†L1-L17】【F:.storybook/preview.ts†L1-L33】【F:package.json†L8-L28】
- Histórias publicadas para `Md3TopAppBar`, `Md3NavigationRail` e `Md3NavigationDrawer` com exemplos interativos e seletor de tema integrado. 【F:src/components/layout/Md3TopAppBar.stories.ts†L1-L88】【F:src/components/layout/Md3NavigationRail.stories.ts†L1-L71】【F:src/components/layout/Md3NavigationDrawer.stories.ts†L1-L63】

26. **Layouts de navegação MD3**

- Novos componentes `Md3NavigationRail.vue` e `Md3NavigationDrawer.vue` com variantes de densidade/modo, badges e ícones resolvidos automaticamente. 【F:src/components/layout/Md3NavigationRail.vue†L1-L123】【F:src/components/layout/Md3NavigationDrawer.vue†L1-L119】
- Suítes de teste cobrem seleção ativa e emissores de eventos; documentação descreve usos recomendados e próximos passos. 【F:src/components/layout/**tests**/Md3NavigationRail.test.ts†L1-L51】【F:src/components/layout/**tests**/Md3NavigationDrawer.test.ts†L1-L47】【F:docs/design-system/layout.md†L1-L33】

27. **Migração inicial das aulas de ALGI**

- As aulas 01-06 foram reescritas no schema `md3.lesson.v1` com objetivos, competências, recursos e avaliações alinhados ao plano pedagógico. 【F:src/content/courses/algi/lessons/lesson-01.json†L1-L226】【F:src/content/courses/algi/lessons/lesson-02.json†L1-L188】【F:src/content/courses/algi/lessons/lesson-03.json†L1-L196】【F:src/content/courses/algi/lessons/lesson-04.json†L1-L238】【F:src/content/courses/algi/lessons/lesson-05.json†L1-L224】【F:src/content/courses/algi/lessons/lesson-06.json†L1-L210】
- Os conteúdos integram componentes MD3 recém-criados (Md3LogicOperators, Md3Flowchart, Md3Table), novos checklists e laboratórios guiados para apoiar o professor em sala. 【F:src/content/courses/algi/lessons/lesson-01.json†L129-L199】【F:src/content/courses/algi/lessons/lesson-02.json†L96-L164】【F:src/content/courses/algi/lessons/lesson-05.json†L93-L210】【F:src/content/courses/algi/lessons/lesson-06.json†L87-L186】【F:src/components/lesson/blockRegistry.ts†L14-L44】
- O índice `lessons.json` agora traz resumo, duração, tags e `formatVersion` atualizados, habilitando os painéis de governança e relatórios automáticos. 【F:src/content/courses/algi/lessons.json†L1-L96】

28. **Primeira onda de migração do curso DDM**

- As aulas 01-06 foram revisadas para o schema `md3.lesson.v1`, aproveitando blocos MD3 (FlightPlan, Callout, Accordion, AudioBlock) e objetivos alinhados ao ecossistema Android. 【F:src/content/courses/ddm/lessons/lesson-01.json†L1-L160】【F:src/content/courses/ddm/lessons/lesson-02.json†L1-L160】【F:src/content/courses/ddm/lessons/lesson-03.json†L1-L160】【F:src/content/courses/ddm/lessons/lesson-04.json†L1-L160】【F:src/content/courses/ddm/lessons/lesson-05.json†L1-L160】【F:src/content/courses/ddm/lessons/lesson-06.json†L1-L160】
- O `lessons.json` do curso passou a referenciar apenas os arquivos JSON dessas aulas e agora inclui descrição, resumo, duração estimada, tags e `formatVersion` para alimentar governança e dashboards. 【F:src/content/courses/ddm/lessons.json†L1-L72】

29. **Segunda onda de migração do curso ALGI**

- As aulas 07-09 foram reescritas no schema `md3.lesson.v1`, com objetivos, competências e blocos MD3 (Md3Table, TruthTable, checklists) cobrindo operadores, leituras sequenciais e estudos de caso aplicados. 【F:src/content/courses/algi/lessons/lesson-07.json†L1-L258】【F:src/content/courses/algi/lessons/lesson-08.json†L1-L269】【F:src/content/courses/algi/lessons/lesson-09.json†L1-L267】
- O índice `lessons.json` foi atualizado para expor resumos, duração e tags das novas aulas, mantendo o curso alinhado ao painel de governança. 【F:src/content/courses/algi/lessons.json†L1-L120】

30. **Condicionais avançadas do curso ALGI migradas**

- As aulas 10-12 incorporam condicionais binárias, switch-case e cadeias `else if` no schema `md3.lesson.v1`, utilizando Md3Flowchart, TruthTable e checklists para guiar decisões e testes. 【F:src/content/courses/algi/lessons/lesson-10.json†L1-L266】【F:src/content/courses/algi/lessons/lesson-11.json†L1-L266】【F:src/content/courses/algi/lessons/lesson-12.json†L1-L308】
- `lessons.json` aponta agora para os novos arquivos JSON, adicionando resumo, tags e duração às aulas 10-12 para habilitar os relatórios de governança. 【F:src/content/courses/algi/lessons.json†L97-L180】

31. **NP1 e devolutiva do curso ALGI normalizadas no schema MD3**

- As aulas 13-15 foram reescritas em `md3.lesson.v1`, cobrindo decisões compostas, aplicação da NP1 e devolutiva pós-prova com fluxogramas, tabelas verdade, planos de voo e guias de correção. 【F:src/content/courses/algi/lessons/lesson-13.json†L1-L326】【F:src/content/courses/algi/lessons/lesson-14.json†L1-L230】【F:src/content/courses/algi/lessons/lesson-15.json†L1-L360】
- O índice `lessons.json` referencia as novas aulas JSON com resumo, duração, tags e `formatVersion`, eliminando os wrappers `.vue` remanescentes da fase inicial. 【F:src/content/courses/algi/lessons.json†L121-L180】

32. **Segunda onda de migração do curso DDM**

- As aulas 07-12 foram reescritas no schema `md3.lesson.v1`, cobrindo ciclo de vida, preservação de estado, Intents explícitas/implícitas e o mini app de contatos com blocos MD3 declarativos. 【F:src/content/courses/ddm/lessons/lesson-07.json†L1-L318】【F:src/content/courses/ddm/lessons/lesson-08.json†L1-L333】【F:src/content/courses/ddm/lessons/lesson-09.json†L1-L348】【F:src/content/courses/ddm/lessons/lesson-10.json†L1-L352】【F:src/content/courses/ddm/lessons/lesson-11.json†L1-L303】【F:src/content/courses/ddm/lessons/lesson-12.json†L1-L323】
- O índice `lessons.json` aponta para os novos arquivos JSON e adiciona descrições, resumos, tags e duração para alimentar o painel do professor. 【F:src/content/courses/ddm/lessons.json†L1-L132】

33. **Primeira onda de migração do curso LPOO**

- As aulas 01-08 foram reescritas no schema `md3.lesson.v1` com objetivos, planos de voo, fluxogramas, tabelas de visibilidade e diagramas de blocos cobrindo fundamentos, encapsulamento, herança, polimorfismo, contratos e o projeto integrador. 【F:src/content/courses/lpoo/lessons/lesson-01.json†L1-L214】【F:src/content/courses/lpoo/lessons/lesson-02.json†L1-L203】【F:src/content/courses/lpoo/lessons/lesson-03.json†L1-L214】【F:src/content/courses/lpoo/lessons/lesson-04.json†L1-L227】【F:src/content/courses/lpoo/lessons/lesson-05.json†L1-L210】【F:src/content/courses/lpoo/lessons/lesson-06.json†L1-L208】【F:src/content/courses/lpoo/lessons/lesson-07.json†L1-L242】【F:src/content/courses/lpoo/lessons/lesson-08.json†L1-L211】
- O índice `lessons.json` agora referencia apenas os arquivos JSON e fornece resumo, tags, duração e `formatVersion`, eliminando wrappers `.vue` e alimentando os relatórios automáticos. 【F:src/content/courses/lpoo/lessons.json†L1-L64】

34. **App shell MD3 com breadcrumbs, busca e navegação adaptativa**

- `Md3AppShell` passa a coordenar top app bar, rail, drawer modal e bottom app bar com slots para breadcrumbs, busca contextual e conteúdos secundários, substituindo o layout Tailwind anterior. 【F:src/components/layout/Md3AppShell.vue†L1-L248】
- `CourseLayout.vue` foi reescrito sobre o novo shell, carregando metadados de curso, breadcrumbs dinâmicos e busca integrada ao roteador (`?section=&q=`), enquanto `CourseHome.vue` consome filtros e pesquisa a partir da mesma URL. 【F:src/pages/CourseLayout.vue†L1-L268】【F:src/pages/CourseHome.vue†L1-L240】
- A fundação de tokens ganhou breakpoints, contêineres e alturas de app bar (`--md-sys-breakpoint-*`, `--md-sys-layout-container-*`, `--md-sys-app-bar-height-*`) para sustentar os novos layouts responsivos. 【F:src/theme/tokens.ts†L1-L148】【F:src/theme/material-theme.ts†L1-L229】

35. **Storybook dos shells de navegação MD3**

- Histórias interativas documentam o `Md3AppShell`, a barra inferior, breadcrumbs e campo de busca com roteador em memória, cobrindo a navegação adaptativa e eventos de busca/navegação antes da integração nas telas reais. 【F:src/components/layout/Md3AppShell.stories.ts†L1-L200】【F:src/components/layout/Md3BottomAppBar.stories.ts†L1-L83】【F:src/components/layout/Md3Breadcrumbs.stories.ts†L1-L74】【F:src/components/layout/Md3SearchField.stories.ts†L1-L61】
- A documentação de layout e do Storybook foi atualizada para refletir o novo escopo, próximos passos de viewports e testes visuais. 【F:docs/design-system/layout.md†L42-L55】【F:docs/design-system/storybook.md†L15-L32】

36. **Plano de ação de LPOO reequilibrado e comunicado ao QA/Implantação**

- `docs/content/personal-site-course-plan.md` removeu a pendência de migração das aulas 09-12 e detalha o reequilíbrio do cronograma 09-16, produção de vídeos e liberação de exercícios com janela alinhada à APS. 【F:docs/content/personal-site-course-plan.md†L115-L141】
- `docs/material-redesign-plan.md` passou a consolidar os novos marcos (semanas 11-13), responsáveis e dependências de QA para cronograma, vídeos e exercícios do curso de LPOO. 【F:docs/material-redesign-plan.md†L118-L132】
- A atualização foi registrada neste relatório para informar QA e implantação; compartilharemos o resumo no canal de acompanhamento para antecipar validações de testes e publicação.

## O que ainda pode ser feito

A partir das recomendações listadas na revisão de arquitetura, seguem frentes prioritárias:

1. **Automação e validação**
   - Visualizar o histórico em gráficos/sparklines e publicar diffs percentuais para destacar ganhos semanais nas issues automáticas.
   - Estender os relatórios para incluir séries temporais e evolução percentual da migração MD3 usando o histórico consolidado.
2. **Refinamento do front-end**
   - Montar Storybook ou Chromatic para validar visualmente componentes críticos e garantir regressão visual sobre os novos utilitários.
   - Converter wrappers `.vue` redundantes para carregamento dinâmico baseado em JSON, reduzindo retrabalho.
3. **Fluxo de conteúdo**
   - Versionar manifestos de cursos e suplementos (exercícios, labs, leituras) para facilitar expansão do acervo.
   - Criar rotinas de revisão trimestrais usando o relatório de observabilidade para checar pendências de migração.
4. **Documentação viva**
   - Criar um diretório de ADRs (`docs/decisions/`) para registrar decisões técnicas.
   - Atualizar os guias periodicamente com aprendizados de novas migrações ou evoluções de design.

Seguir essas etapas transforma a revisão em plano operacional, permitindo que a equipe avance com segurança tanto em melhorias estruturais quanto na expansão contínua do conteúdo.

## Visão geral (tabela)

| Frente prioritária                            | Status       | Observações                                                                                                                        |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Validação de `meta.json`                      | ✅ Concluída | Guardrails adicionados em `validate:content` garantem slug, instituição canônica e descrição robusta.                              |
| Painel para relatório consolidado             | ✅ Concluída | Página dedicada publica o JSON agregado com totais, status por curso e detalhes das lições afetadas.                               |
| Biblioteca MD3 avançada (tipografia/elevação) | ✅ Concluída | Tipos de letra, superfícies, elevações e helpers de contraste consolidados em `src/assets/styles.css` e adotados no painel/blocks. |
| Observabilidade de conteúdo                   | ✅ Concluída | `npm run report:observability` gera métricas sobre blocos MD3 x legados, lições disponíveis e cobertura de metadados.              |
| Observabilidade automatizada no CI            | ✅ Concluída | Workflow gera o relatório, publica artefato dedicado e falha quando faltam metadados obrigatórios em exercícios/suplementos.       |
| Proveniência exibida no painel                | ✅ Concluída | Painel traz cobertura de metadados, autores recorrentes e modelos utilizados por curso.                                            |
| Governança automática no CI                   | ✅ Concluída | Workflow gera `reports/governance-alert.{md,json}` e mantém issue `governanca-automatica` com problemas/avisos e blocos legados.   |
| Histórico do alerta de governança             | ✅ Concluída | `reports/governance-history.json` concentra métricas por execução e habilita o comparativo automático no relatório em Markdown.    |
| Snapshots semanais de governança              | ✅ Concluída | `npm run report:governance:history` gera tabela semanal e o workflow publica o agregado na issue automática.                       |

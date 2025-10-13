# Plano de ação para o site pessoal do professor

Este documento traduz os dados do relatório `reports/course-content-summary.json` em um plano de execução imediato, levando em conta que o portal atende exclusivamente às turmas do professor Tiago Sombra. O foco é garantir informações confiáveis sobre aulas já ministradas, preparar espaço para as próximas turmas e acelerar a reconstrução dos componentes didáticos em Material Design 3 (MD3).

## Visão geral dos cursos

- Foram catalogadas 5 disciplinas com 92 aulas listadas, mas apenas 61 possuem arquivos consumíveis pelo site. 【F:reports/course-content-summary.json†L5-L112】【F:reports/course-content-summary.json†L277-L404】
- Todos os cursos mantêm pares redundantes `.json` + `.vue` para cada aula, o que duplica manutenção e bloqueia a migração para o novo schema MD3. 【F:reports/course-content-summary.json†L165-L250】【F:reports/course-content-summary.json†L335-L404】【F:reports/course-content-summary.json†L472-L512】【F:reports/course-content-summary.json†L600-L676】【F:reports/course-content-summary.json†L763-L838】
- Os manifestos de exercícios existem para todas as disciplinas, porém nenhum está plenamente publicado e ainda há arquivos órfãos sem registro no índice. 【F:reports/course-content-summary.json†L253-L274】【F:reports/course-content-summary.json†L408-L428】【F:reports/course-content-summary.json†L515-L535】【F:reports/course-content-summary.json†L678-L698】【F:reports/course-content-summary.json†L841-L861】

## Prioridades transversais

1. **Consolidar o formato único de aula** – Remover wrappers `.vue` redundantes e migrar todo o conteúdo para JSON normalizado com os blocos MD3 (`lessonPlan`, `md3Flowchart`, `truthTable`, `blockDiagram`).
2. **Publicar o inventário de aulas** – Exibir no painel administrativo e na home um contador que diferencie aulas publicadas das que ainda estão em produção (status "em breve").
3. **Padronizar exercícios e suplementos** – Garantir que cada `exercises.json` e `supplements.json` referencie um arquivo existente com metadados completos (competências, tempo estimado, modo de aplicação).
4. **Componentes MD3 específicos por disciplina** – Reutilizar os novos componentes (`Md3Flowchart`, `Md3BlockDiagram`, `TruthTable`) como base e planejar variações específicas por curso (ex.: um `SprintBoard` para DDM, `SystemMapper` para TGS).

## Plano por disciplina

### Algoritmos e Programação I (ALGI)

- Há 23 aulas marcadas como "em breve" que ainda não possuem arquivos correspondentes (`lesson-16` a `lesson-40`). 【F:reports/course-content-summary.json†L18-L110】
- As 15 primeiras aulas existem em duplicidade (`lesson-XX.json` + `lesson-XX.vue`) e precisam ser consolidadas. 【F:reports/course-content-summary.json†L165-L250】
- Exercícios listados (`lista1.json`, `lista2.json`) não estão conectados ao manifesto e devem migrar para o schema com feedback automático. 【F:reports/course-content-summary.json†L253-L265】

**Ações imediatas**

1. As aulas 01-15 já estão consolidadas em `md3.lesson.v1` com planos, avaliações e devolutivas; o próximo foco é migrar as aulas 16-18 para cobrir a transição às estruturas de repetição. 【F:src/content/courses/algi/lessons/lesson-13.json†L1-L326】【F:src/content/courses/algi/lessons/lesson-14.json†L1-L230】【F:src/content/courses/algi/lessons/lesson-15.json†L1-L360】
2. Escrever os arquivos das aulas 16-24 com foco na transição para estruturas de repetição, reaproveitando `Md3Flowchart` para diagramas de laços e o `TruthTable` para exercícios de lógica booleana, e sinalizar status "em produção" no índice até finalizar os blocos interativos.
3. Revisar o roteiro das aulas 25-40 e publicar versões mínimas (sumário, objetivos, plano de aula) para que os alunos acompanhem o progresso do semestre, marcando o status como "rascunho" no índice até finalizar os blocos interativos.
4. Migrar `lista1.json` e `lista2.json` para o schema de exercícios com rubricas e gabarito, conectando-os ao `validate:content`.

### Desenvolvimento para Dispositivos Móveis (DDM)

- Todas as 14 aulas estão publicadas, mas mantêm wrappers duplicados e conteúdo legado com HTML embutido. 【F:reports/course-content-summary.json†L277-L404】
- Há dois exercícios (`api-sync.json`, `ux-audit.json`) fora do manifesto padronizado. 【F:reports/course-content-summary.json†L408-L420】

**Ações imediatas**

1. As aulas 01-12 já estão consolidadas em `md3.lesson.v1`, com blocos MD3 para ciclo de vida, Intents e mini app de contatos; restam as aulas 13-14 para concluir a unidade. 【F:src/content/courses/ddm/lessons/lesson-07.json†L1-L318】【F:src/content/courses/ddm/lessons/lesson-08.json†L1-L333】【F:src/content/courses/ddm/lessons/lesson-09.json†L1-L348】【F:src/content/courses/ddm/lessons/lesson-10.json†L1-L352】【F:src/content/courses/ddm/lessons/lesson-11.json†L1-L303】【F:src/content/courses/ddm/lessons/lesson-12.json†L1-L323】
2. Migrar as aulas 13-14 para JSON MD3, introduzindo presets de sensores/publicação e preparando a migração dos exercícios.
3. Criar o componente `SprintBoard` para visualizar backlog e status das atividades práticas (inspirado nas cartas do `Md3BlockDiagram`).
4. Atualizar os exercícios para incluírem rubricas (protótipo funcional, critérios de UX) e anexar links para repositórios ou formulários de entrega.

### Linguagens de Programação Orientada a Objetos (LPOO)

- As doze primeiras aulas foram migradas para `md3.lesson.v1`, removendo wrappers `.vue`, enriquecendo objetivos, planos de voo e blocos MD3 específicos da disciplina (fluxogramas, tabelas de visibilidade e diagramas de blocos). 【F:src/content/courses/lpoo/lessons/lesson-01.json†L1-L214】【F:src/content/courses/lpoo/lessons/lesson-02.json†L1-L203】【F:src/content/courses/lpoo/lessons/lesson-03.json†L1-L214】【F:src/content/courses/lpoo/lessons/lesson-04.json†L1-L227】【F:src/content/courses/lpoo/lessons/lesson-05.json†L1-L210】【F:src/content/courses/lpoo/lessons/lesson-06.json†L1-L208】【F:src/content/courses/lpoo/lessons/lesson-07.json†L1-L242】【F:src/content/courses/lpoo/lessons/lesson-08.json†L1-L211】【F:src/content/courses/lpoo/lessons/lesson-09.json†L1-L248】【F:src/content/courses/lpoo/lessons/lesson-10.json†L1-L250】【F:src/content/courses/lpoo/lessons/lesson-11.json†L1-L246】【F:src/content/courses/lpoo/lessons/lesson-12.json†L1-L240】
- O índice `lessons.json` traz resumos, tags, duração e `formatVersion`, habilitando relatórios e a navegação do site pessoal sem wrappers legados. 【F:src/content/courses/lpoo/lessons.json†L1-L64】
- Exercícios (`modelagem-uml.json`, `refatoracao.json`) ainda não seguem o schema de competências e precisam de rubricas alinhadas. 【F:reports/course-content-summary.json†L515-L527】

**Ações imediatas**

1. Projetar o componente `ClassDesigner` derivado do `Md3BlockDiagram` para representar relações UML, preparando presets para Storybook.
2. Reequilibrar o cronograma das aulas 09-16, antecipando a revisão de herança/polimorfismo para a semana anterior à NP2 e registrando checkpoints no `lessons.json` (sumário, objetivos avaliativos e entregas por sprint).
3. Publicar os vídeos de apoio dos módulos 09-12 (análise de casos, refatoração guiada e padrões de projeto introdutórios) diretamente nos blocos `videos`, garantindo descrição, duração e legendas revisadas.
4. Liberar os exercícios revisados com rubricas de encapsulamento, herança e polimorfismo, conectando-os ao `validate:content`, abrindo janela de submissão assistida uma semana antes da APS e sinalizando dependências de testes automatizados.

### Tecnologia e Desenvolvimento para Jogos Digitais (TDJD)

- Quinze aulas publicadas com wrappers duplicados e ausência de modo "denso" para mobile. 【F:reports/course-content-summary.json†L539-L676】
- Exercícios (`protótipo-papel.json`, `vertical-slice.json`) estão isolados sem vínculo no manifesto oficial. 【F:reports/course-content-summary.json†L678-L689】

**Ações imediatas**

1. Migrar aulas para JSON MD3 com ênfase nos novos componentes `Md3BlockDiagram` (pipelines) e planejar um `AssetBoard` para controlar artefatos de produção.
2. Implementar preset de `Md3Flowchart` dedicado a pipelines de jogos (idéia → protótipo → vertical slice → release) com destaque para milestones.
3. Revisar exercícios, adicionando critérios de avaliação para protótipos em papel e slices jogáveis, além de links para submission (Itch.io, GitHub releases).

### Teoria Geral de Sistemas (TGS)

- Quinze aulas publicadas em duplicidade e sem componentes específicos para mapas de causalidade. 【F:reports/course-content-summary.json†L701-L838】
- Exercícios (`loop-feedback.json`, `mapa-sistema.json`) aparecem como órfãos no diretório. 【F:reports/course-content-summary.json†L841-L852】

**Ações imediatas**

1. Criar o componente `SystemMapper` reutilizando a base do `Md3BlockDiagram` com suporte a loops de reforço/balanceamento e indicadores.
2. Migrar aulas para JSON MD3 incluindo blocos `lessonPlan`, `callout` e `systemMapper` para explicar exemplos práticos (saúde, ESG, transformação digital).
3. Integrar exercícios com estudos de caso que coletem feedback qualitativo dos alunos (reflexões guiadas) e métricas de compreensão sistêmica.

## Próximos passos operacionais

1. Executar `npm run report:courses` semanalmente para monitorar a redução de duplicidades e o avanço da publicação das novas aulas.
2. Integrar o relatório ao painel `/reports/content-validation` (atalho "Relatório de validação"/rota `validation-report`), destacando contadores de aulas "publicadas" vs "em produção" para cada disciplina.
3. Atualizar `docs/material-redesign-plan.md` conforme cada curso migrar para JSON MD3, mantendo histórico de entregas na `docs/WORK_STATUS.md`.
4. Após consolidar o formato JSON, iniciar a documentação em Storybook com exemplos reais das aulas do professor, garantindo consistência visual antes da próxima turma.

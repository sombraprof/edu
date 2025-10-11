# Schema de Aula Normalizada (md3.lesson.v1)

O schema `md3.lesson.v1` garante que todas as disciplinas compartilhem o mesmo contrato de conteúdo antes da migração para os componentes MD3. Ele é publicado em `schemas/lesson.schema.json` e consumido em tempo de desenvolvimento/execução via `src/content/schema/`.

## Campos obrigatórios

| Campo     | Tipo            | Descrição                                                                                             |
| --------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| `id`      | `string`        | Identificador canônico (`lesson-01`, `lesson-10`), igual ao nome do arquivo.                          |
| `title`   | `string`        | Título exibido na navegação e cabeçalhos.                                                             |
| `content` | `LessonBlock[]` | Sequência de blocos semânticos renderizados pelos componentes MD3. Cada bloco precisa indicar `type`. |

## Metadados pedagógicos

| Campo           | Tipo                                             | Obrigatório | Observações                                               |
| --------------- | ------------------------------------------------ | ----------- | --------------------------------------------------------- |
| `formatVersion` | `'md3.lesson.v1'`                                | Recomendado | Marca a adesão ao schema atual e ativa migrações futuras. |
| `summary`       | `string`                                         | Recomendado | Resumo de 1-2 parágrafos que contextualiza a aula.        |
| `objectives`    | `string[]`                                       | Recomendado | Objetivos específicos alinhados à BNCC/ABED.              |
| `competencies`  | `string[]`                                       | Recomendado | Competências estruturantes cobradas na aula.              |
| `outcomes`      | `string[]`                                       | Recomendado | Resultados observáveis utilizados em avaliações.          |
| `skills`        | `string[]`                                       | Opcional    | Habilidades detalhadas derivadas das competências.        |
| `prerequisites` | `string[]`                                       | Opcional    | Conteúdos a revisar antes da aula.                        |
| `tags`          | `string[]`                                       | Opcional    | Marcadores para filtros e relatórios.                     |
| `modality`      | `'in-person' \| 'remote' \| 'hybrid' \| 'async'` | Opcional    | Modalidade primária da aula.                              |
| `duration`      | `number`                                         | Opcional    | Duração estimada (minutos).                               |

## Recursos e avaliação

| Campo          | Tipo                                                        | Observações                                         |
| -------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| `resources`    | `{ label: string; url: string; type?: string; }[]`          | Links obrigatórios disponibilizados aos estudantes. |
| `bibliography` | `string[]`                                                  | Referências formatadas (ABNT/APA).                  |
| `assessment`   | `{ type?: string; description?: string; rubric?: string; }` | Resumo da estratégia avaliativa vinculada à aula.   |

## Metadados operacionais

| Campo                | Tipo                                    | Obrigatório | Observações                            |
| -------------------- | --------------------------------------- | ----------- | -------------------------------------- |
| `metadata.status`    | `'draft' \| 'in-review' \| 'published'` | Recomendado | Estado da aula no fluxo de governança. |
| `metadata.updatedAt` | `string (date-time)`                    | Recomendado | Última revisão registrada em ISO 8601. |
| `metadata.owners`    | `string[]`                              | Recomendado | Responsáveis pedagógicos/tecnológicos. |
| `metadata.sources`   | `string[]`                              | Opcional    | Fontes externas utilizadas na aula.    |

## Novos blocos declarativos (2024-09)

Os manifests de aulas e exercícios agora contam com vinte blocos inéditos que atendem a cenários de exposição e prática. Todos já estão descritos no schema (`schemas/lesson.schema.json`) e no renderer (`src/components/lesson/blockRegistry.ts`). A tabela abaixo resume os campos mínimos esperados:

| Tipo (`type`)      | Campos obrigatórios                                   | Campos opcionais relevantes                                                                                                                  |
| ------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `definitionCard`   | `term`, `definition`                                  | `source`, `sourceUrl`                                                                                                                        |
| `comparativeTable` | `headers`, `rows[].{label, values[]}`                 | `title`, `description`                                                                                                                       |
| `systemDiagram`    | `nodes[].{id,label}`                                  | `connections[]`, `legend`                                                                                                                    |
| `codeChallenge`    | `prompt`                                              | `code`, `question`, `options[]`, `answerExplanation`                                                                                         |
| `memoryVisualizer` | —                                                     | `stack[]`, `heap[]`, `notes`                                                                                                                 |
| `caseStudy`        | `scenario`                                            | `title`, `dataPoints[]`, `questions[]`, `tasks[]`                                                                                            |
| `statCard`         | `label`, `value`                                      | `context`, `source`, `trend`                                                                                                                 |
| `knowledgeCheck`   | `prompt`, `options[].{id,text}`                       | `title`, `explanation`, `allowMultiple`                                                                                                      |
| `dualAssessment`   | `theory`, `practice`                                  | `title`, `summary`; sub-blocos herdam campos opcionais de `knowledgeCheck`/`codeSubmission`                                                  |
| `interactiveDemo`  | `url`                                                 | `title`, `description`, `height`                                                                                                             |
| `pedagogicalNote`  | `content`                                             | `title`, `audience`                                                                                                                          |
| `codeSubmission`   | `prompt`                                              | `language`, `boilerplate`, `tests[]`, `tips[]`                                                                                               |
| `dragAndDrop`      | `steps[].{id,label}`                                  | `title`, `instructions`                                                                                                                      |
| `conceptMapper`    | `nodes[].{id,label}`                                  | `description`, `relationships[]`, `nodes[].{category,details,position}`, `layout.{type,force.{linkDistance,chargeStrength,collisionRadius}}` |
| `dataEntryForm`    | `fields[].{id,label}`                                 | `submitLabel`, `description`, `fields[].{type,required,options[],placeholder}`                                                               |
| `scenarioBuilder`  | `inputs[]`, `processes[]`, `outputs[]`                | `description`, `guidingQuestions[]`                                                                                                          |
| `peerReviewTask`   | `criteria[].{id,label}`                               | `description`, `dueDate`, `steps[]`                                                                                                          |
| `testGenerator`    | `tags[]`                                              | `description`, `difficulties[]`                                                                                                              |
| `rubricDisplay`    | `criteria[].{criterion,levels[].{level,description}}` | `title`, `description`                                                                                                                       |
| `selfAssessment`   | `prompts[].{id,label}`                                | `description`, `prompts[].placeholder`                                                                                                       |

| `videoAnnotation` | `video.provider`, `video.src` (quando `html5`) ou `video.url`/`videoId` | `title`, `description`, `annotations[].{label,time}`, `annotations[].question`, `checkpoints[].{label,time}` |
|

### Bloco `conceptMapper`

- `layout.type` define se o renderer calcula o posicionamento (`"auto"`, padrão) ou respeita coordenadas pré-processadas (`"preset"`).
- `layout.force` aceita ajustes finos da simulação de força (`linkDistance`, `chargeStrength`, `collisionRadius`) para cenários com muitos nós.
- `nodes[].position` recebe coordenadas `{x, y}` (compatíveis com a `viewBox` 720×480) quando o time de autoria quiser controlar a malha manualmente ou replicar um layout estático.
- O renderer mantém a listagem textual para acessibilidade, e os grupos permanecem colapsáveis — descreva relações relevantes no campo `relationships[]` para garantir o contexto completo.

### Bloco `dualAssessment`

O bloco combina avaliação teórica e prática em um único item da sequência de conteúdo:

- `theory`: reaproveita integralmente o schema de `knowledgeCheck`, exigindo `prompt` e `options[].{id,text}` e aceitando campos opcionais como `title`, `explanation` e `allowMultiple`.
- `practice`: reutiliza o schema de `codeSubmission`, com `prompt` obrigatório e suporte opcional a `language`, `boilerplate`, `tests[].{name,input,expectedOutput}` e `tips[]`.
- Ambos os sub-blocos incluem `type` fixo (`"knowledgeCheck"` e `"codeSubmission"`), garantindo que validadores e renderizadores detectem automaticamente os componentes adequados.

Essa composição permite apresentar um cheque de conhecimento seguido de uma entrega prática sem perder os metadados específicos de cada bloco.

> Os blocos de exercícios reutilizam o mesmo schema das aulas, permitindo que `LessonRenderer` trate ambos os contextos de maneira unificada. 【F:schemas/lesson.schema.json†L1-L431】【F:src/components/lesson/blockRegistry.ts†L1-L305】

## Relacionados

- `schemas/lessons-index.schema.json`: índice canônico das aulas disponíveis em cada curso. 【F:schemas/lessons-index.schema.json†L1-L34】
- `schemas/exercises-index.schema.json`: garante metadados de geração para roteiros de exercício. 【F:schemas/exercises-index.schema.json†L1-L42】
- `schemas/supplements-index.schema.json`: normaliza materiais suplementares e tipos permitidos. 【F:schemas/supplements-index.schema.json†L1-L42】
- `scripts/validate-content.mjs`: valida todos os arquivos, gera alertas de metadados ausentes e emite relatório consolidado. 【F:scripts/validate-content.mjs†L1-L200】【F:scripts/validate-content.mjs†L1000-L1095】

## Próximos passos

1. Migrar gradualmente as aulas legadas (`lesson-*.json`) para o novo schema preenchendo `summary`, `competencies`, `outcomes` e `metadata` obrigatórios.
2. Atualizar `scaffold:lesson` para gerar arquivos já compatíveis com `md3.lesson.v1`.
3. Publicar stories MDX demonstrando como os blocos declarativos consomem os campos normalizados.

# Content Authoring Guide for EDU

This document explains how to produce new lessons and exercises that integrate seamlessly with the EDU application.

## 0. Authoring with Teacher Mode

### Start the local stack

- Run `npm run dev:teacher` to launch Vite and the automation service (`teacher:service`) with the proxy already pointing to `/teacher-api`.
- Keep the service bound to `127.0.0.1` unless you configure `TEACHER_SERVICE_TOKEN`, VPN/reverse proxy and the allowlists described in [`automation-backend.md`](professor-module/automation-backend.md). The API is designed for local authoring sessions.
- Open `http://localhost:5173/`. The **Professor** panel appears automatically when the automation service is reachable (locally or via `VITE_TEACHER_API_URL`).

### Use the block panel

- Open any lesson/exercise. The sidebar "Editar aula"/"Editar exercício" exposes metadata fields, tag/array helpers and the ordered list of blocks rendered by [`LessonAuthoringPanel.vue`](../src/components/lesson/LessonAuthoringPanel.vue).
- Use the dropdown at the top of the "Blocos de conteúdo" section to insert new blocks. Reorder items with the arrow buttons, remove entries with the trash icon and select **Editar detalhes** to load the contextual form for the chosen block.
- The **Reverter alterações** button restores the latest snapshot fetched from disk. It becomes available when the panel detects local edits that are still pending.
- Status chips report "Sem alterações pendentes", "Salvando alterações…" or "Alterações salvas" based on [`useAuthoringSaveTracker`](../src/composables/useAuthoringSaveTracker.ts).

### Autosave workflow

- When you switch lessons/exercises the panel issues `GET /api/teacher/content?path=…` and hydrates the authoring model with the JSON returned by the service (`useTeacherContentEditor`).
- Every edit is diffed against the last snapshot. After ~800 ms without additional changes the panel sends a `PUT /api/teacher/content` with the updated payload. Success responses surface a toast-style message (`Alterações salvas às HH:MM:SS`). Errors keep the change in the queue until the service recovers.
- If the service is offline you will see "Serviço de automação não configurado" and the panel remains disabled. Start `npm run dev:teacher` or define `VITE_TEACHER_API_URL` to restore autosave.

### Block type conventions

- Prefer the canonical block types declared in [`supportedBlockTypes`](../src/components/lesson/blockRegistry.ts) – e.g. `lessonPlan`, `flightPlan`, `contentBlock`, `callout`, `cardGrid`, `timeline`, `videos`, `resourceGallery`, `quiz`, `promptTip`.
- Utilize `imageFigure` para imagens com zoom/lightbox. Defina `src`/`alt` quando houver apenas uma figura, `credit` para citar a fonte e `lightbox: false` quando quiser desativar o zoom. Referencie arquivos locais (`@/content/...` ou `@/assets/...`) para que o build gere automaticamente variantes responsivas; use `images[]` (galerias) ou `sources[]` para declarar variações personalizadas. Caminhos apontando para `public/` continuam funcionando, mas sem geração automática de `srcset`.
- Keep `callout.variant` within the approved list (`info`, `good-practice`, `academic`, `warning`, `task`, `error`). The same enums apply to authoring in the panel and to JSON produced manually.
- Use `legacySection` only while migrating sanitised HTML. The panel highlights legacy entries so you can plan refactors into MD3-native blocks.
- The `component` block type allows reusing the custom registry (e.g. `Md3Table`, `InteractiveDemo`, `RubricDisplay`). Set `component` to the key exposed by [`supportedCustomComponents`](../src/components/lesson/blockRegistry.ts) and provide the expected shape inside `props`.

#### Dedicated block editors (teacher panel)

The authoring sidebar now renders specialised forms for the following block types. Every form emulates the data shape produced by [`defaultBlockTemplates`](../src/components/authoring/defaultBlockTemplates.ts) and emits `update:block` automatically when fields change.

| Block type                           | Required fields                               | Authoring notes                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checklist`                          | `title`, at least one entry in `items[]`      | Use frases de ação; entradas vazias são descartadas automaticamente.                                                                                             |
| `timeline` / `stepper`               | `title`, `steps[].title`                      | Combine com descrições curtas (3–4 linhas) para guiar o estudante.                                                                                               |
| `glossary`                           | `title`, `terms[].term`, `terms[].definition` | Prefira definições no presente e contextualizadas para o curso.                                                                                                  |
| `flashcards`                         | `title`, `cards[].front`, `cards[].back`      | Pense em perguntas diretas no lado frontal e explicações sucintas no verso.                                                                                      |
| `videos` / `videosBlock`             | `title`, `videos[].title`, `videos[].url`     | Utilize URLs públicas (YouTube, Vimeo, Stream) com legendas opcionalmente informando duração.                                                                    |
| `bibliography` / `bibliographyBlock` | `title`, `items[]`                            | Padronize o formato (ABNT/APA) e mantenha a ordem alfabética.                                                                                                    |
| `interactiveDemo`                    | `title`, `url`                                | Descreva pré-requisitos e como o estudante deve explorar a demo. Utilize os campos opcionais `provider`, `page`, `theme` para ajustar o embed quando necessário. |
| `codePlayground`                     | `initialCode`                                 | Forneça um snippet inicial curto e oriente o uso de `print(...)` para registrar saídas no painel.                                                                |
| `codeSubmission`                     | `title`, `language`, `tests[]`                | Os testes são strings executadas pelo avaliador; garanta que cobrem casos positivos e negativos.                                                                 |
| `promptTip`                          | `title`, `audience`, `prompt`                 | Use `tags[]` para facilitar buscas no painel e `tips[]` para destacar boas práticas.                                                                             |
| `flightPlan`                         | `title`, `items[]`                            | Ideal para resumir macro etapas em aulas síncronas.                                                                                                              |
| `accordion` / `representations`      | `items[].title`, `items[].content`            | Reforce o contraste entre tópicos – títulos curtos e conteúdos objetivos.                                                                                        |
| `parsons` / `parsonsPuzzle`          | `title`, `prompt`, `lines[]`                  | Cada linha representa um bloco rearrastável; evite inserir comentários desnecessários.                                                                           |

String lists ignoram entradas em branco e mantêm pelo menos um item vazio para facilitar a digitação. Conteúdos em textarea suportam quebras de linha — não é necessário inserir `\n` manualmente.

##### Bloco `codePlayground`

- Ideal para demonstrações rápidas em JavaScript ou TypeScript. O editor utiliza o Monaco carregado sob demanda e aplica fallback para `<textarea>` quando o worker não puder ser inicializado.
- Mantenha o código inicial curto (5–15 linhas) e explique no campo `description` qual comportamento o estudante deve observar ao clicar em **Executar**.
- Prefira `print(...)` e `console.log(...)` para exibir resultados. O retorno da função também é renderizado no painel de saída.

Exemplo de payload JSON:

```json
{
  "type": "codePlayground",
  "title": "Explorando laços",
  "description": "Compare os loops while e for imprimindo valores no painel.",
  "language": "typescript",
  "initialCode": "for (let i = 1; i <= 3; i++) {\\n  print(`Iteração ${i}`);\\n}\\nprint('Fim.');"
}
```

> ⚠️ **Segurança:** o código roda no mesmo contexto da página. Evite expor tokens, manipular DOM diretamente ou acessar APIs externas sensíveis. Limite-se a exemplos determinísticos que não dependam de rede e reforcem conceitos da aula.

> **Blocos ainda no modo genérico:** `scenarioMatrix`, `spriteSheet`, `crcCards`, `apiEndpoints`, `definitionCard`, `comparativeTable`, `systemDiagram`, `codeChallenge`, `memoryVisualizer`, `caseStudy`, `statCard`, `dualAssessment`, `pedagogicalNote`, `dragAndDrop`, `conceptMapper`, `bugFixChallenge`, `dataEntryForm`, `scenarioBuilder`, `peerReviewTask`, `testGenerator`, `rubricDisplay`, `selfAssessment`, `truthTable`, `blockDiagram`, `md3Flowchart`, `classDesigner`, `audio`, `md3Table`, `pipelineCanvas`, `systemMapper`, `balancedScorecard`, `component`, `legacySection`. Utilize o botão **Editar JSON** (editor genérico) para esses tipos e mantenha o formato do `defaultBlockTemplates` como referência.

#### Bloco `interactiveDemo`

- `provider` (opcional) identifica o serviço do embed e aceita apenas os valores descritos na tabela abaixo. A detecção automática pelo domínio continua funcionando; utilize o campo quando precisar documentar o provedor explicitamente.
- `page` controla o modo de visualização (por exemplo, `embed` ou `present`). Quando omitido, aplicamos o preset recomendado para cada serviço.
- `theme` alterna entre os temas disponibilizados pelo provedor (quando houver suporte).
- URLs fora da lista de domínios aprovados exibem um aviso e o iframe deixa de ser renderizado – mantenha os compartilhamentos públicos.

| Provedor            | Domínios aceitos                  | Altura padrão | Modos suportados              | Temas disponíveis | Observações                                                                    |
| ------------------- | --------------------------------- | ------------- | ----------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| `figma`             | `figma.com`, `www.figma.com`      | 720 px        | `embed`, `present`            | `light`, `dark`   | O link é encapsulado em `https://www.figma.com/embed?embed_host=edu&url=…`.    |
| `miro`              | `miro.com`, `www.miro.com`        | 768 px        | `board`                       | —                 | Habilitamos `?embed=1` para manter o iframe no modo colaborativo.              |
| `canva`             | `canva.com`, `www.canva.com`      | 720 px        | `view`, `present`             | —                 | O preset `view` adiciona `?embed=1`; altere para `present` para exibir slides. |
| `google-slides`     | `docs.google.com`                 | 540 px        | `embed`, `present`, `preview` | —                 | Reescrevemos o caminho para `/presentation/d/<id>/<modo>` automaticamente.     |
| `powerpoint-online` | `onedrive.live.com`, `office.com` | 540 px        | `embed`                       | —                 | Forçamos `em=2` quando o parâmetro não estiver presente na URL.                |

> 💡 Combine `height` com os presets acima somente quando a demo exigir uma área diferente da padrão do provedor.

## 1. High-Level Architecture

- All renderable content lives under `src/content/courses/<courseId>/`.
- Every lesson or exercise is defined by a pair of files:
  - `<id>.json`: structured data consumed by `LessonRenderer.vue`.
  - `<id>.vue`: a thin wrapper that imports the JSON, exposes the `meta` object and mounts `<LessonRenderer :data="..." />`.
- `lessons.json` and `exercises.json` act as indexes (`{ id, title, description/summary, file?, link?, available, metadata }`).
- Each exercise entry must include `metadata` with `generatedBy`, `model` (ex.: `manual`, `gpt-4o-mini`) e `timestamp` ISO para auditoria.
- In `exercises.json`, keep the `link` prefix as `courses/<courseId>/exercises/...` (ou URL absoluta) e reutilize o mesmo slug para o `id`, `.vue` wrapper e `.json` payload.
- `supplements.json` (opcional) lista materiais extras (`{ id, title, type, description?, file?/link?, available?, metadata }`). Use `type` ∈ `reading | lab | project | slide | video | reference`.
- Vue pages (`LessonView.vue`, `ExerciseView.vue`, `CourseHome.vue`) dynamically import these indexes and render the JSON blocks.

### Imagens responsivas e créditos

- Salve a imagem base no próprio diretório de conteúdo (`src/content/courses/<curso>/media/...`) ou em `src/assets/media`. Use nomes descritivos e mantenha a versão em alta qualidade (a pipeline gera recortes menores automaticamente). Imagens em `public/` continuam válidas, porém são entregues apenas na resolução original.
- Ao preencher um bloco `imageFigure`, aponte `src` para o caminho do arquivo local (`"public/media/figura.jpg"` ou `"@/content/courses/algi/media/figura.png"`). Durante o build o plugin [`vite-imagetools`](https://github.com/JonasKruckenberg/imagetools) cria `srcset` em AVIF/WEBP e mantém um fallback no formato original.
- Use `credit` para informar autoria/licença (texto simples ou com marcação HTML sanitizada) e `caption` para contextualizar a imagem. Ambos aparecem no `<figcaption>` e são reutilizados na lightbox.
- Defina `lightbox: false` caso a imagem não deva abrir em modal (por exemplo, infográficos com muito texto). Em galerias (`images[]`), o campo pode ser aplicado individualmente.
- Quando precisar controlar manualmente as fontes (`<source>`), informe `sources[]` com objetos `{ srcset, type?, media?, sizes?, descriptor?, width?, density? }`. Também é possível gerar pares específicos informando `src` + `width`/`density` — o utilitário monta o `srcset` final preservando caminhos relativos.
- Após editar imagens, rode `npm run validate:content` para garantir que os novos campos (`credit`, `lightbox`, `sources`) passaram pelas validações de esquema.

### Metadados do curso (`meta.json`)

- Mantenha `id` igual ao diretório do curso (`algi`, `tdjd`, etc.). Qualquer divergência interrompe a validação.
- `title` deve descrever o curso em pelo menos 8 caracteres úteis (após `trim`).
- `institution` aceita apenas nomes canônicos (`Unichristus`, `Unifametro`) e não pode conter espaços extras no início/fim.
- `description` precisa ter ao menos 60 caracteres para comunicar claramente o foco do curso na home.
- `npm run validate:content` acusa mensagens em português apontando qualquer campo fora do padrão.

## 2. Supported Block Types

`LessonRenderer.vue` understands the following `type` values inside the `content` array:

| Type                | Description                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- | ----------------- | ------------------------------------------------------- |
| `lessonPlan`        | High level plan with hero cards (object must match the existing AlgI schema). Icons must use the canonical tokens (`bullseye`, `target`, `graduation-cap`, `calendar-days`, `users`, etc.). |
| `contentBlock`      | Rich paragraphs, optional sub-blocks and callouts.                                                                                                                                          |
| `imageFigure`       | Single image or gallery with optional caption/credit and lightbox zoom. Use `src`/`alt` para imagens simples ou declare `images[]` (`{ src, alt?, caption?, credit? }`).                    |
| `callout`           | Highlight box with `variant` (`info`, `good-practice`, `academic`, `warning`, `task`, `error`). Use sempre valores em minúsculas e com hífen quando necessário.                             |
| `flightPlan`        | Ordered list of key items (timeline of the class).                                                                                                                                          |
| `timeline`          | Step-by-step timeline.                                                                                                                                                                      |
| `accordion`         | Expandable sections (`title`, `content` HTML).                                                                                                                                              |
| `videos`            | Embedded YouTube resources.                                                                                                                                                                 |
| `checklist`         | List of completion items.                                                                                                                                                                   |
| `bibliography`      | References in HTML/Markdown.                                                                                                                                                                |
| `truthTable`        | Matrix data for logic tables.                                                                                                                                                               |
| `representations`   | Used in AlgI to compare narrative/flowchart/pseudocode.                                                                                                                                     | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode.                               | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. | `representations` | Used in AlgI to compare narrative/flowchart/pseudocode. |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `balancedScorecard` | Visualiza perspectivas, objetivos e indicadores do BSC com dados declarativos (`perspectives`, `objectives`, `indicators`).                                                                 |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |
| `legacySection`     | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces).                                                                                                       |                   | Sanitised HTML that still needs future componentisation (rendered with MD3 surfaces). |

> Prefer declarative blocks (`lessonPlan`, `contentBlock`, `callout`, etc.) over `legacySection`. Use `legacySection` only as a temporary bridge when automatic conversion is not feasible.

#### Dual assessment em prática

Use `dualAssessment` quando quiser propor uma checagem teórica seguida de uma entrega prática curta no mesmo bloco. Os sub-objetos `theory` e `practice` reaproveitam exatamente os schemas de `knowledgeCheck` e `codeSubmission`:

```jsonc
{
  "type": "dualAssessment",
  "title": "Consolidando vetores",
  "summary": "Revise conceitos e pratique a implementação de uma função de soma.",
  "theory": {
    "type": "knowledgeCheck",
    "prompt": "Qual estrutura percorre todos os elementos de um array em JavaScript?",
    "options": [
      { "id": "a", "text": "for ... of" },
      { "id": "b", "text": "if ... else" },
      { "id": "c", "text": "switch" },
    ],
    "explanation": "`for ... of` itera cada item sequencialmente, o que é ideal para revisar vetores.",
  },
  "practice": {
    "type": "codeSubmission",
    "prompt": "Implemente a função `sumArray(numbers)` retornando a soma dos valores.",
    "language": "javascript",
    "boilerplate": "export function sumArray(numbers) {\n  // seu código aqui\n}\n",
    "tests": [{ "name": "soma elementos", "input": "[1,2,3]", "expectedOutput": "6" }],
    "tips": ["Inicialize um acumulador e some cada item do array."],
  },
}
```

Aplique o mesmo padrão para qualquer combinação teoria + prática: mantenha os campos obrigatórios (`prompt` e `options` na teoria, `prompt` na prática) e somente acrescente opcionais que façam sentido para o contexto.

### Card grids sem surpresas

- Prefira o array `cards` para novos conteúdos (cada item aceita `title`, `subtitle`, `body` ou `content`, além de `actions`).
- Garanta que exista algum campo renderizável (`body`, `content`, `description`, `footer` ou `items`). Blocos sem texto são rejeitados pelo validador.
- O campo `columns` deve estar entre 1 e 4. Valores fracionários ou fora desse intervalo são considerados inválidos.
- Quando precisar mapear estados visuais, utilize `tone` (`primary`, `success`, `neutral`, etc.) ou variantes canônicas (`info`, `good-practice`, `academic`, `warning`, `task`, `error`).
- Ações (`actions`) precisam conter pares `{ "label": "...", "href": "..." }` e, se `external` for usado, mantenha-o booleano.

## 3. Design & Material 3 Tokens

The global styles are defined in `src/assets/styles.css`. When handcrafting HTML inside `legacySection.html`, rely on the shared MD3 utilities instead of ad-hoc styling:

- **Typography:** `.md-typescale-display-*`, `.md-typescale-headline-*`, `.md-typescale-title-*`, `.md-typescale-body-*`, `.md-typescale-label-*` provide the correct `line-height`, weight and letter spacing for each level of the Material 3 scale.
- **Colour & contrast:** `.text-on-surface`, `.text-on-surface-variant`, `.text-on-primary`, `.text-on-primary-container`, `.text-on-secondary-container` guarantee readable foreground combinations.
- **Surfaces & depth:** `.md-surface`, `.md-surface-container`, `.md-surface-container-high`, `.md-surface-primary`, `.md-surface-primary-container` combined with `.md-elevation-1/2/3` replace bespoke backgrounds and shadows.
- **Icon sizing:** `.md-icon` with modifiers (`--sm`, `--md`, `--lg`) aligns Lucide icons to the MD3 dimension system.
- **Spacing:** prefer the spacing tokens (`var(--md-sys-spacing-*)`) already declared at the root when adding gaps or paddings.

Inside legacy sections the renderer automatically wraps blocks with MD3 cards (`data-legacy-card`) and grids (`data-legacy-grid`). You only need to produce semantic HTML (`<h3>`, `<ul>`, `<p>`, `<code>`).

## 4. Naming & Language Conventions

- Variable, file and function names must be in English (e.g. `lessonSummary`, not `resumoAula`).
- User-facing copy can remain in Portuguese (pt-BR) because it is content-specific.
- Comments inside the codebase must be written in English and explain _why_ rather than _what_.

## 5. Workflow for New Content

1. Execute `npm run scaffold:lesson -- --course <slug> --number <NN> --title "Aula X"` (or pass `--id lesson-NN`) to scaffold the trio (`lessons.json`, `<id>.json`, `<id>.vue`). Lesson ids must follow the zero-padded pattern `lesson-01`, `lesson-02`, etc.
2. Author the structured JSON describing the new lesson content. Reuse existing block schemas whenever possible.
3. Adjust the generated Vue wrapper if necessary (meta/objective or availability flags).
4. Run `npm run validate:content` (or `npm run validate:report` to persist the aggregated JSON com o resumo de metadados) to ensure the schema and file references remain consistent e auditáveis.
5. Run `npm run format` followed by `npm run build` to ensure the Vue compiler accepts the new content.

### Metadados de geração e manifestos complementares

- Sempre preencha o objeto `metadata` (`generatedBy`, `model`, `timestamp`) ao criar ou atualizar entradas em `exercises.json` e `supplements.json`. Use `generatedBy: "Equipe EDU"` para trabalho manual ou o identificador da IA responsável.
- Prefira timestamps em UTC (`2024-06-14T00:00:00.000Z`). Esses campos ajudam a rastrear conteúdo produzido por LLMs e priorizar revisões humanas.
- `supplements.json` pode listar PDFs, slides, planilhas ou outros assets. Defina `type` para orientar o consumo (`reading`, `slide`, `lab`, etc.) e mantenha `available: false` até que o arquivo/link esteja pronto.
- Após rodar `npm run validate:report`, consulte `reports/content-validation-report.json` para ver o consolidado por curso (totais por autor/modelo, intervalo temporal e entradas individuais) antes de enviar mudanças.
- Use `npm run report:observability` para acompanhar quantas lições continuam com blocos legados, qual a cobertura de blocos MD3 em cada curso e se exercícios/suplementos mantêm metadados completos.
- Rode `npm run report:observability:check` quando quiser reproduzir o mesmo guardrail do CI/CD; o workflow de deploy falha automaticamente se encontrar exercícios ou suplementos sem `metadata` obrigatório.
- Execute `npm run report:governance` para gerar `reports/governance-alert.md`/`.json`, atualizar `reports/governance-history.json` com a série temporal e obter um resumo dos cursos que ainda têm problemas/avisos, blocos legados e lacunas de metadados (combinação direta dos dois relatórios anteriores).
- Em seguida rode `npm run report:governance:history` para sintetizar os dados em `reports/governance-history-summary.json` e gerar a tabela semanal `reports/governance-history.md`, usada pela issue automática para registrar a evolução.
- O GitHub Actions atualiza automaticamente uma issue com label `governanca-automatica` a cada execução da pipeline, usando esse resumo para indicar prioridades e acompanhar a redução de blocos legados ao longo do tempo.
- A página `/relatorios/validacao-conteudo` exibe os mesmos dados com cobertura por curso, autores recorrentes e modelos utilizados, facilitando a conferência visual dos metadados antes do deploy.

### Automating HTML-first lessons

When an AI or collaborator delivers the lesson as `<section>`-structured HTML, skip manual JSON editing by piping the markup
through `create-lesson-from-html.mjs`:

```bash
node scripts/create-lesson-from-html.mjs \
  --course algi \
  --id lesson-42 \
  --title "Aula 42: Algoritmos Avançados" \
  --objective "Explorar técnicas de backtracking." \
  --input aula42.html
```

Or feed the HTML directly from the terminal/AI:

```bash
pbpaste | node scripts/create-lesson-from-html.mjs \
  --course algi \
  --id lesson-42 \
  --title "Aula 42: Algoritmos Avançados" \
  --objective "Explorar técnicas de backtracking."
```

The script will:

- Transform each `<section>` into a `legacySection` block (preserving IDs and headings as titles).
- Generate/overwrite `src/content/courses/<course>/lessons/<id>.json`.
- Scaffold the matching Vue wrapper (`<id>.vue`).
- Insert or update the lesson entry inside `lessons.json` (keeping alphabetical order).

You can still refine the generated JSON afterwards, migrating chunks from `legacySection` to richer block types when time
allows.

The helper scripts in `scripts/` (`structure-legacy-sections.mjs`, `apply-lesson-template.mjs`, `convert-exercises-to-json.mjs`) can speed up migrations when scraping legacy HTML, but hand-crafted lessons should follow the structured format from the start.

## 6. Accessibility & Media

- Always provide descriptive text for media (e.g. `title` for videos, descriptive captions in callouts).
- Use semantic HTML tags (`<strong>`, `<em>`, `<code>`, `<ol>`, `<ul>`, `<table>`) so screen readers can navigate the content.
- When embedding code samples, set the `language` field in `code` blocks (e.g. `"language": "typescript"`).

## 7. Checklist Before Submitting Content

- [ ] JSON validates and mirrors the schema used in AlgI (`npm run validate:content` ou `npm run validate:report`).
- [ ] Vue wrapper renders `<LessonRenderer :data="..." />` and nothing else.
- [ ] Icons correspond to the Lucide palette (`GraduationCap`, `Target`, `BookOpen`, etc.) and will be mapped automatically when using `legacySection` ids.
- [ ] Blocos `cardGrid` trazem título + conteúdo e usam variantes/tónus canônicos (`info`, `good-practice`, `primary`, `neutral`, etc.).
- [ ] Spacing, casing and tokens follow Material Design 3 conventions.
- [ ] `npm run format` and `npm run build` succeed locally.

Following this guide keeps the authoring experience consistent and ensures that any AI-assisted content generation aligns with the platform’s architecture, design language, and accessibility expectations.

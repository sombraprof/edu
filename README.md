# EDU · Courses Hub

Vue 3 + Vite application that centralises aulas e exercícios do Prof. Tiago Sombra seguindo Material Design 3.

## 🚀 Como iniciar

```bash
npm ci
npm run dev
```

Para gerar o build de produção:

```bash
npm run build
npm run preview
```

## 📂 Estrutura de conteúdo

Todo o conteúdo versionado vive em `src/content/courses/<id>/`:

```
src/content/courses/<id>/
├── meta.json                 # Metadados da disciplina (id, título, instituição, descrição)
├── lessons.json              # Índice das aulas ({ id, title, description?, available, file })
├── lessons/
│   ├── lessonX.json          # Dados estruturados (LessonRenderer)
│   └── lessonX.md            # Wrapper <LessonRenderer :data="..." />
├── exercises.json            # Índice dos exercícios ({ id, title, summary?, available, file })
└── exercises/
    ├── exerciseY.json        # Dados estruturados iguais às aulas
    └── exerciseY.md          # Wrapper <LessonRenderer :data="..." />
```

Cada `.json` usa o mesmo formato consumido por `LessonRenderer.vue`. Blocos legados ficam em `{ type: 'legacySection', title, html }` e são renderizados com superfícies MD3.

## 🛠️ Fluxo de criação / migração

1. Adicione/actualize os arquivos JSON na pasta da disciplina.
2. Rode os utilitários quando necessário:
   - `node scripts/structure-legacy-sections.mjs` converte HTML legado (em `public/courses`) em seções normalizadas.
   - `node scripts/apply-lesson-template.mjs` gera o wrapper `.md` de cada aula.
   - `node scripts/convert-exercises-to-json.mjs` faz o mesmo para os exercícios.
3. Registe a disciplina em `src/data/courses.ts` (para aparecer na home).
4. Execute `npm run build` antes de commitar para garantir que tudo compila.

## 🧩 Componentes principais

- `LessonRenderer.vue` orquestra todos os blocos (lessonPlan, ContentBlock, Callout, Timeline, etc.).
- `LegacySection.vue` e `LegacyHtml.vue` aplicam MD3 a conteúdo HTML que ainda não foi totalmente decomposto.
- `ExerciseView.vue` reutiliza `LessonRenderer`, garantindo a mesma experiência das aulas.

## 📦 Deploy / PWA

- Configuração feita com `vite-plugin-pwa`, SPA fallback activado para GitHub Pages.
- O fluxo de publicação está em `.github/workflows/deploy.yml`.

## 💡 Dicas

- Preferira actualizar os arquivos JSON/MD em `src/content` – a pasta `public/courses` hoje serve apenas como fonte para scripts de migração.
- Sempre que integrar conteúdo legacy, rode os scripts acima para manter o design consistente e evitar regressões de acessibilidade.
- O build de verificação (`npm run build`) ajuda a pegar erros de template (por exemplo, tokens inesperados em `.md`).

# EDU Platform Architecture & Maintenance Review

## 1. Arquitetura Atual

### 1.1 Organização do código

- **Framework**: Vue 3 + Vite, roteamento com `vue-router` e head management com `@vueuse/head`. O ponto de entrada monta `App.vue` e injeta o roteador sem outros providers globais, mantendo o shell leve.【F:src/main.ts†L1-L16】【F:src/router/index.ts†L1-L28】
- **Estrutura de conteúdo**: Cursos vivem em `src/content/courses/<courseId>/` com metadados, índices (`lessons.json`/`exercises.json`) e pares JSON/Vue para cada aula ou exercício. O `LessonRenderer` converte os blocos declarativos em componentes específicos.【F:README.md†L31-L47】【F:src/components/lesson/LessonRenderer.vue†L1-L100】
- **Camada de apresentação**: tokens MD3 e utilitários Tailwind estão centralizados em `src/assets/styles.css`, mas vários espaçamentos e dimensões ainda são aplicados inline (ex.: `LessonRenderer` usa `gap` via style literal).【F:src/assets/styles.css†L1-L120】【F:src/components/lesson/LessonRenderer.vue†L1-L8】

### 1.2 Pontos fortes

- Separação clara entre dados (JSON) e renderização (Vue), que facilita reuso e internacionalização futura.
- Documentação de autoria robusta (`docs/CONTENT_AUTHORING_GUIDE.md`) já orienta colaboradores e IA sobre os blocos disponíveis.【F:docs/CONTENT_AUTHORING_GUIDE.md†L1-L76】
- Scripts para migração de HTML aceleram importação de conteúdo legado, reduzindo o tempo de onboarding.【F:README.md†L63-L75】
- IDs e arquivos agora seguem o padrão `lesson-XX`, reduzindo divergências entre `lessons.json`, wrappers Vue e JSON de conteúdo.【F:src/content/courses/algi/lessons.json†L1-L24】

### 1.3 Riscos e gargalos

- **Componentes monolíticos**: `LessonRenderer` concentra lógica de roteamento de blocos, dificultando tree-shaking. Sugestão: mover o mapa `type -> componente` para um registry externo e permitir lazy loading por tipo.
- **Estilos inline**: uso recorrente de `:style` com tokens impede composição com Tailwind/MD3 e reduz consistência. Ideal encapsular espaçamentos em utilitários (`.md-stack`, `.md-gap-*`).
- **Assets duplicados**: cada lição possui arquivo `.vue` wrapper, mesmo que apenas monte `LessonRenderer`. Esse boilerplate aumenta diffs em massa.

## 2. Manutenção

### 2.1 Processos atuais

- Prettier com hooks (`simple-git-hooks`) garante formatação homogênea.【F:package.json†L22-L41】
- Testes unitários cobrem apenas componentes MD3 específicos, deixando lacunas em páginas críticas e roteamento (ex.: teste de `Md3Table`).

### 2.2 Recomendações

1. **Validação de conteúdo**
   - Evoluir o schema JSON existente (`npm run validate:content`) para cobrir blocos específicos, links obrigatórios e metadados avançados.
   - Adicionar lint customizado que verifica se para cada `lesson` listado existe par `.json`/wrapper e se IDs seguem regex (`lesson-[0-9]{2}` etc.).
2. **Testabilidade**
   - Criar testes de snapshot para `LessonRenderer` com fixtures reais de `algi` e `ddm` para detectar regressões de MD3.
   - Adicionar teste de roteamento garantindo que rotas órfãs redirecionam para `/` e que `CourseLayout` injeta breadcrumbs corretamente.
3. **Automação de wrappers**
   - Gerar wrappers em build (`vite` plugin) ao invés de comitar `.vue` individuais. Alternativamente, substituir wrappers por `defineAsyncComponent(() => import(...json))` diretamente na rota.
4. **Documentação viva**
   - Centralizar decisões de arquitetura (por exemplo, tema, fallback offline, dependências obrigatórias) em um ADR (Architecture Decision Record) dentro de `docs/decisions/`.

## 3. Expansão de Conteúdo

### 3.1 Fluxo proposto

1. `npm run scaffold:lesson -- --course <id> --id <slug>` executa CLI que:
   - Cria JSON inicial vazio com objetivo placeholder.
   - Atualiza `lessons.json` mantendo ordenação natural.
   - Gera wrapper Vue com `meta` e import do JSON.
2. `npm run validate:content` roda schema mínimo + verificação de arquivos pendentes.
3. Criar biblioteca de componentes de conteúdo (ex.: `Md3Quote`, `Md3Quiz`) para incentivar uso de blocos declarativos e reduzir `legacySection`.

### 3.2 Exercícios e materiais extras

- Criar diretório `supplements/` por curso com manifestos (PDFs, slides). O JSON index poderia ter campo `type` (`exercise`, `lab`, `reading`).
- Introduzir blocos interativos (`quiz`, `stepper`). LLMs podem gerar JSON padrão se existir documentação com exemplos (ver seção 4).

## 4. Suporte a LLMs e prompts internos

### 4.1 Estrutura sugerida

- `docs/llm/README.md` com visão geral (ver arquivo `docs/LLM_PROMPT_PLAYBOOK.md`).
- Prompts especializados para tarefas:
  - **Nova aula**: inclui checklist de blocos, tokens MD3 e tom de voz.
  - **Refatoração de legado**: orienta converter HTML em blocos estruturados, mapear headings para `callout` ou `timeline`.
  - **Ajustes de design**: instruções para nunca remover tokens MD3 e para usar componentes existentes.
- Checklist para revisão humana: `docs/llm/REVIEW_CHECKLIST.md` com passos para validar conteúdo gerado.

### 4.2 Observabilidade

- Incluir metadados no JSON (`generatedBy`, `model`, `timestamp`) para auditar quando uma aula veio de LLM e exigir revisão antes do publish.
- Consolidar validação + observabilidade via `npm run report:governance`, gerando o par `reports/governance-alert.{md,json}`, alimentando `reports/governance-history.json` e permitindo que o workflow do GitHub Actions publique os artefatos e mantenha uma issue automática com o resumo das pendências (problemas, avisos, blocos legados e metadados faltantes).
- Produzir snapshots semanais com `npm run report:governance:history`, garantindo que a issue automática exiba a tabela de evolução além do alerta atual.

## 5. Material Design 3

### 5.1 Avaliação atual

- Tokens básicos (cores, espaçamento, bordas) presentes, porém faltam **tipografia**, **elevações** e **estados** aplicados de forma consistente. Ex.: `.btn` usa mix de Tailwind + CSS custom, mas cartões de conteúdo dependem de classes ad hoc nos componentes.【F:src/assets/styles.css†L78-L160】【F:src/components/lesson/Callout.vue†L1-L60】
- Layouts aplicam `max-w-6xl`, `gap-12` diretamente em `App.vue`, fugindo da escala MD3 (12 == 48px, mas tokens definidos vão até `--md-sys-spacing-24`).【F:src/App.vue†L1-L25】

### 5.2 Plano de ação

1. **Biblioteca de utilitários MD3**: criar `@layer components` com classes `md-stack-6`, `md-card`, `md-title-large`, etc., substituindo styles inline. _(Concluído — ver `docs/WORK_STATUS.md`, item 17.)_
2. **Tipografia**: mapear tokens MD3 (`headline`, `title`, `body`) em `@layer base` e remover classes Tailwind livres (`text-xl`, `font-semibold`).
3. **Temas dinâmicos**: expor toggle claro/escuro atual via `ThemeToggle` mas salvar preferências com fallback SSR-safe e permitir esquemas alternativos (ex.: tema da instituição).
4. **Auditoria visual**: montar storybook MD3 (ou Chromatic) para validar componentes em isolamento.

## 6. Workflow de conversão (scripts vs. HTML manual)

### 6.1 Situação

- Scripts como `create-lesson-from-html.mjs` aceleram migração, mas introduzem `legacySection` e retrabalho manual para componentizar depois.【F:README.md†L63-L75】
- A dependência de wrappers `.vue` significa que qualquer mudança de template exige regenerar todos os arquivos.

### 6.2 Recomendações

- Reescrever scripts para produzir diretamente o JSON final, exigindo que IA forneça dados estruturados (já existem exemplos na documentação). Adicionar validação que rejeita HTML cru.
- Implementar modo interativo: script lê HTML, sugere mapeamento (`<section class="objetivos">` -> `contentBlock`) e abre prompts para confirmar.
- Migrar wrappers para carregamento dinâmico: `LessonView` importa JSON via `defineAsyncComponent(() => import(...))`, eliminando passo extra.
- Para conteúdo estático (landing pages), preferir componentes Vue nativos em vez de HTML convertido, mantendo coesão com MD3.

## 7. Roadmap sugerido

| Prioridade | Item                                                  | Impacto                                          |
| ---------- | ----------------------------------------------------- | ------------------------------------------------ |
| Alta       | Automatizar validação de conteúdo e padronizar IDs    | Evita regressões e melhora colaboração humana/IA |
| Alta       | Refatorar `LessonRenderer` para registry modular      | Reduz acoplamento e facilita lazy-loading        |
| Média      | Biblioteca de utilitários MD3 + tipografia tokenizada | Consistência visual e menos CSS inline           |
| Média      | CLI `scaffold:lesson` + manifest unificado            | Onboarding de novos cursos rápido                |
| Média      | Storybook/Chromatic para componentes críticos         | Detecta regressões visuais                       |
| Baixa      | Telemetria de geração por LLM                         | Auditoria e confiança na automação               |
| Baixa      | Migração completa dos wrappers `.vue`                 | Reduz boilerplate e diffs desnecessários         |

---

Este diagnóstico deve orientar o próximo ciclo de manutenção, combinando ajustes estruturais (registry de blocos, schemas) com melhorias de DX (CLI, prompts) e refinamentos visuais (utilitários MD3). A execução incremental reduz retrabalho e prepara o projeto para expansão contínua de conteúdo.

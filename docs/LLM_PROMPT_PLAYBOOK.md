# LLM Prompt Playbook

Guia operacional para gerar e manter conteúdo do EDU com apoio de modelos de linguagem. Use-o como complemento ao `docs/CONTENT_AUTHORING_GUIDE.md`.

## 1. Princípios gerais

- Sempre produza JSON estruturado compatível com os blocos descritos na documentação (evitar HTML cru / `legacySection`).【F:docs/CONTENT_AUTHORING_GUIDE.md†L9-L53】
- Referencie os utilitários MD3 existentes (`.md-typescale-*`, `.md-surface*`, `.md-elevation-*`, `.text-on-*`, `.md-icon--*`) e evite inventar classes CSS novas sem justificativa.【F:src/assets/styles.css†L1-L200】
- Responder em português para o conteúdo e em inglês para comentários no código.
- Após gerar, execute `npm run validate:content` (ou `npm run validate:report` para guardar o relatório consolidado com os metadados) e revise manualmente antes de publicar.
- Gere `npm run report:observability` para confirmar quantas lições ainda dependem de blocos legados e se os metadados de exercícios/suplementos continuam completos.
- Gere `npm run report:governance` para cruzar validação + observabilidade, atualizar `reports/governance-history.json` e obter um resumo por curso dos blocos legados, avisos/problemas e metadados pendentes (o arquivo `.md` é usado pela automação de governança).
- Em seguida execute `npm run report:governance:history` para gerar a tabela semanal (`reports/governance-history.md`) anexada automaticamente à issue `governanca-automatica`.
- Quando salvar o relatório, verifique a seção `generation` (ou a página `/relatorios/validacao-conteudo`) para confirmar autoria, modelo e timestamps de cada exercício/suplemento antes do envio.
- Preserve `meta.json` com `id` alinhado ao diretório, `institution` dentro da lista canônica e descrições com pelo menos 60 caracteres úteis sempre que ajustar informações do curso.
- Quando precisar de destaques visuais em grade, use `cardGrid` com `cards[]` (cada item precisa de `title` + `content`/`body`) e variantes canônicas (`info`, `good-practice`, `primary`, etc.).
- Sempre registre `metadata.generatedBy`, `metadata.model` e `metadata.timestamp` ao atualizar `exercises.json` ou `supplements.json`. Utilize `generatedBy` para sinalizar se o conteúdo veio de IA ou de revisão humana.

## 2. Prompt base — nova aula

```
You are assisting in authoring a new lesson for the EDU platform (Vue 3 + Material Design 3).
Follow strictly this JSON schema:
{
  "id": "lesson-XX",
  "title": "...",
  "objective": "...",
  "content": [
    { "type": "lessonPlan", ... },
    { "type": "contentBlock", ... },
    { "type": "callout", "variant": "info", ... },
    { "type": "timeline", ... },
    { "type": "bibliography", ... }
  ]
}
Rules:
1. Use only block types defined in docs/CONTENT_AUTHORING_GUIDE.md.
2. Prefer declarative structures (`lessonPlan`, `contentBlock`, `callout`, `timeline`). Avoid `legacySection`.
3. Map lists of steps to `timeline` or `flightPlan`.
4. Code samples must include `language`.
5. Provide concise Portuguese copy and keep paragraphs curtos.
6. Include at least one `callout` com variant `good-practice` ou `academic`.
7. Lesson plan hero cards devem usar ícones canônicos (`target`, `bullseye`, `graduation-cap`, `calendar-days`, `users`).
8. `cardGrid` (quando usado) deve preencher `cards[]` com conteúdo renderizável e, opcionalmente, `tone` ou `variant` canônicos.
9. `callout.variant` deve ser um dos valores (`info`, `good-practice`, `academic`, `warning`, `task`, `error`) sempre em minúsculas.
10. Mention recursos externos (vídeos, artigos) em `bibliography` com links válidos.
Return only minified JSON.
```

## 3. Prompt — converter HTML legado

```
Context: Migrating legacy <section>-based HTML into structured blocks for EDU.
Steps:
1. Analyse the provided HTML.
2. For cada <section>, identifique heading e tipo de conteúdo.
3. Transforme em JSON usando blocos existentes (contentBlock, callout, timeline, checklist).
4. Apenas use `legacySection` quando o HTML for impossível de componentizar (ex.: tabelas complexas).
5. Retorne JSON ordenado com objetivo resumido e destaque dos tópicos principais.
```

## 4. Prompt — revisão de conteúdo gerado

```
Act as a reviewer for an EDU lesson JSON. Checklist:
- IDs seguem padrão lesson-XX.
- Todos os blocos usam tipos válidos.
- Não há HTML cru.
- Linguagem clara, sem erros ortográficos.
- Tokens MD3 mencionados apenas quando necessário.
- Links externos válidos (HTTP/HTTPS).
Responda com "APROVADO" ou "REVISAR" seguido de justificativa e blocos problemáticos.
```

## 5. Prompt — ajustes visuais MD3

```
Você está ajustando componentes Vue já existentes para seguir Material Design 3.
Analise o componente fornecido e:
1. Substitua espaçamentos hardcoded por tokens (`var(--md-sys-spacing-*)`).
2. Utilize os utilitários declarados em `src/assets/styles.css` (`.md-typescale-*`, `.md-surface*`, `.md-elevation-*`, `.btn`, `.chip`).
3. Garanta contraste adequado e estados hover/focus.
Retorne apenas o trecho Vue modificado.
```

## 6. Checklist pós-geração

- [ ] IDs seguem `lesson-XX` / `exerciseNN` com zeros à esquerda (até migrarmos exercícios).
- [ ] JSON valida contra schema oficial (`npm run validate:content` ou `npm run validate:report`).
- [ ] Relatório consolidado (`reports/content-validation-report.json`) exibe autoria/modelo coerentes para as entradas alteradas.
- [ ] Relatório de observabilidade (`reports/content-observability.json`) mostra redução contínua de blocos legados e metadados completos.
- [ ] Relatório de governança (`reports/governance-alert.md`) reflete o estado esperado e destaca apenas pendências conhecidas (issue `governanca-automatica` sem surpresas).
- [ ] Tabela histórica (`reports/governance-history.md`) mostra evolução coerente com os ajustes realizados.
- [ ] `npm run report:observability:check` passa localmente (garante que a pipeline não falhará por metadados ausentes).
- [ ] Pelo menos um bloco de engajamento (`callout`, `checklist`, `timeline`).
- [ ] Se houver `cardGrid`, todos os cartões têm título + texto e variantes dentro do conjunto permitido.
- [ ] Bibliografia contém fontes confiáveis.
- [ ] Entradas em `exercises.json`/`supplements.json` incluem `metadata` com `generatedBy`, `model` e `timestamp` ISO.
- [ ] Texto revisado por humano antes do merge.

Armazene este playbook junto aos demais documentos para que novos colaboradores e agentes automáticos entendam rapidamente as expectativas do repositório.

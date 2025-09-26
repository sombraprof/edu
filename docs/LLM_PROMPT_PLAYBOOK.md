# LLM Prompt Playbook

Guia operacional para gerar e manter conteúdo do EDU com apoio de modelos de linguagem. Use-o como complemento ao `docs/CONTENT_AUTHORING_GUIDE.md`.

## 1. Princípios gerais

- Sempre produza JSON estruturado compatível com os blocos descritos na documentação (evitar HTML cru / `legacySection`).【F:docs/CONTENT_AUTHORING_GUIDE.md†L9-L53】
- Referencie tokens MD3 e componentes existentes; nunca invente classes CSS novas sem justificativa.【F:src/assets/styles.css†L1-L160】
- Responder em português para o conteúdo e em inglês para comentários no código.
- Após gerar, execute `npm run validate:content` (ou `npm run validate:report` para guardar o relatório consolidado) e revise manualmente antes de publicar.

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
7. Mention recursos externos (vídeos, artigos) em `bibliography` com links válidos.
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
2. Utilize utilitários declarados em src/assets/styles.css (`.surface`, `.btn`, etc.).
3. Garanta contraste adequado e estados hover/focus.
Retorne apenas o trecho Vue modificado.
```

## 6. Checklist pós-geração

- [ ] IDs seguem `lesson-XX` / `exerciseNN` com zeros à esquerda (até migrarmos exercícios).
- [ ] JSON valida contra schema oficial (`npm run validate:content` ou `npm run validate:report`).
- [ ] Pelo menos um bloco de engajamento (`callout`, `checklist`, `timeline`).
- [ ] Bibliografia contém fontes confiáveis.
- [ ] Texto revisado por humano antes do merge.

Armazene este playbook junto aos demais documentos para que novos colaboradores e agentes automáticos entendam rapidamente as expectativas do repositório.

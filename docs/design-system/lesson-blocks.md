# Lesson Blocks — Novos Componentes

Esta página documenta três blocos interativos para usar nas aulas: `quiz`, `flashcards` e `resourceGallery`. Eles já estão integrados ao `LessonRenderer` via `blockRegistry` e prontos para uso em arquivos `.json` de lições.

## QuizBlock (`type: "quiz"` ou `"multipleChoice"`)

Bloco de múltipla escolha (simples ou múltipla) com feedback e explicações por alternativa.

Exemplo — escolha única:

```json
{
  "type": "quiz",
  "title": "🧐 Mini-Quiz",
  "question": "Qual é a saída de `<code>2 + 2 * 2</code>`?",
  "multiple": false,
  "shuffle": true,
  "allowRetry": true,
  "options": [
    {
      "text": "A) 6",
      "correct": true,
      "explanation": "Multiplicação antes da soma: 2 + (2*2) = 6."
    },
    { "text": "B) 8" },
    { "text": "C) 4" }
  ],
  "feedback": { "correct": "Certo! 🎉", "incorrect": "Quase lá. Tente novamente!" }
}
```

Exemplo — múltiplas corretas:

```json
{
  "type": "quiz",
  "title": "Selecione as corretas",
  "question": "Quais são estruturas lineares?",
  "multiple": true,
  "options": [
    { "text": "Fila", "correct": true },
    { "text": "Pilha", "correct": true },
    { "text": "Árvore", "correct": false }
  ]
}
```

Também disponível via bloco `component`:

```json
{
  "type": "component",
  "component": "QuizBlock",
  "props": { "data": { "title": "Quiz", "options": ["A", "B"] } }
}
```

## Flashcards (`type: "flashcards"`)

Cartões frente/verso com navegação por setas e flip por espaço/enter. Aceita `front/back` ou `question/answer` e também strings simples.

```json
{
  "type": "flashcards",
  "title": "Conceitos-chave",
  "description": "Use espaço/enter para virar, setas para navegar.",
  "shuffle": true,
  "cards": [
    { "front": "<b>Encapsulamento</b>", "back": "Protege estado interno expondo interface." },
    { "front": "<b>Herança</b>", "back": "Reuso e especialização de classes." },
    { "question": "Polimorfismo?", "answer": "Múltiplas formas de um mesmo contrato." },
    "OOP: Encapsulamento ↔ proteção de estado interno."
  ]
}
```

Via bloco `component`:

```json
{
  "type": "component",
  "component": "Flashcards",
  "props": { "data": { "cards": ["Item 1", "Item 2"] } }
}
```

## ResourceGallery (`type: "resourceGallery"`)

Galeria responsiva de recursos externos com miniatura, fonte, autor e licença. Aceita `items` inline ou `src` apontando para um JSON publicado (ex.: em `public/resources/*.json`).

Inline:

```json
{
  "type": "resourceGallery",
  "title": "Galeria — Fluxogramas",
  "items": [
    {
      "type": "image",
      "title": "Euclid algorithm flowchart",
      "url": "https://commons.wikimedia.org/wiki/File:Euclid_algorithm_flowchart_diagram_in_Breton.svg",
      "thumbnail": "https://upload.wikimedia.org/.../640px-...png",
      "author": "Huñvreüs",
      "source": "Wikimedia Commons",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  ]
}
```

Com `src` (carregamento no cliente):

```json
{
  "type": "resourceGallery",
  "title": "Galeria — Sistemas",
  "src": "resources/systems-thinking.json"
}
```

> Observação: o componente resolve `src` relativo ao `BASE_URL` do Vite (ex.: `/edu/` em preview), então prefira caminhos como `resources/arquivo.json` (sem barra inicial).

### Gerando recursos CC com o agregador

O repositório inclui `scripts/aggregate-open-resources.mjs`, que coleta imagens (Openverse + Wikimedia) e, opcionalmente, áudios (Openverse). Exemplos:

```bash
npm run resources:aggregate -- --query "pensamento sistêmico" --limit 24 --out public/resources/pensamento-sistemico.json
npm run resources:aggregate -- --query "engenharia de software" --limit 24 --audio --out public/resources/engenharia-software.json
```

Os JSONs gerados têm o formato `{ query, generatedAt, items: ResourceItem[] }` e já funcionam diretamente no `resourceGallery`.

## Stepper (`type: "stepper"`)

Bloco de passos sequenciais com indicadores clicáveis e navegação Anterior/Próximo. Cada passo pode ter descrição em texto, HTML ou um trecho de código.

```json
{
  "type": "stepper",
  "title": "Pipeline de implementação",
  "summary": "Siga as etapas na ordem sugerida.",
  "steps": [
    { "title": "Planejamento", "description": "Defina escopo e riscos." },
    { "title": "Desenvolvimento", "content": "<p>Implemente as funcionalidades centrais.</p>" },
    { "title": "Teste", "code": "npm test", "language": "bash" }
  ]
}
```

## TabsBlock (`type: "tabs"`)

Abas para organizar conteúdo textual e snippets de código.

```json
{
  "type": "tabs",
  "title": "Abas — Comparativo",
  "tabs": [
    { "label": "Texto", "content": "<p>Conteúdo em HTML sanitizado.</p>" },
    { "label": "Código", "code": "console.log('Olá')", "language": "javascript" }
  ]
}
```

## Glossary (`type: "glossary"`)

Lista de termos e definições com busca.

```json
{
  "type": "glossary",
  "title": "Glossário — OOP",
  "items": [
    { "term": "Encapsulamento", "definition": "Ocultar detalhes internos de implementação." },
    { "term": "Herança", "definition": "Especialização de classes." },
    { "term": "Polimorfismo", "definition": "Múltiplas formas de um mesmo contrato." }
  ]
}
```

## ParsonsPuzzle (`type: "parsons"` ou `"parsonsPuzzle"`)

Reordenação de linhas de código para formar uma solução. Botões de mover para cima/baixo facilitam o uso em sala e em mobile.

```json
{
  "type": "parsons",
  "title": "Soma de elementos",
  "instructions": "Reordene as linhas para formar o algoritmo correto.",
  "lines": [
    "int sum = 0;",
    "for (int i = 0; i < n; i++) {",
    "  sum += v[i];",
    "}",
    "printf(\"%d\", sum);"
  ],
  "solution": [
    "int sum = 0;",
    "for (int i = 0; i < n; i++) {",
    "  sum += v[i];",
    "}",
    "printf(\"%d\", sum);"
  ]
}
```

## ScenarioMatrix (`type: "scenarioMatrix"`)

Matriz 2×2 para TGS (ex.: risco x impacto, automação x complexidade) com itens por quadrante.

```json
{
  "type": "scenarioMatrix",
  "title": "Matriz — TGS",
  "x": { "label": "Automação", "positive": "Alta", "negative": "Baixa" },
  "y": { "label": "Complexidade", "positive": "Alta", "negative": "Baixa" },
  "items": [
    { "label": "Cenário A", "quadrant": "++" },
    { "label": "Cenário B", "quadrant": "+-" },
    { "label": "Cenário C", "quadrant": "-+" },
    { "label": "Cenário D", "quadrant": "--" }
  ]
}
```

## SpriteSheetViewer (`type: "spriteSheet"`)

Visualizador de spritesheet para Jogos: define largura/altura do frame, colunas/linhas e FPS para reprodução.

```json
{
  "type": "spriteSheet",
  "title": "Personagem",
  "src": "/sprites/character.png",
  "frameWidth": 64,
  "frameHeight": 64,
  "cols": 8,
  "rows": 4,
  "frameCount": 32,
  "fps": 8
}
```

## CRCCards (`type: "crcCards"`)

Cartões CRC para design OO (LPOO): nome, responsabilidades e colaboradores, em grade responsiva.

```json
{
  "type": "crcCards",
  "title": "CRC — Biblioteca",
  "classes": [
    {
      "name": "Livro",
      "responsibilities": ["Armazenar metadados", "Disponibilizar status"],
      "collaborators": ["Autor", "Empréstimo"]
    },
    {
      "name": "Usuário",
      "responsibilities": ["Solicitar empréstimo", "Devolver item"],
      "collaborators": ["Empréstimo"]
    }
  ]
}
```

## ApiEndpoints (`type: "apiEndpoints"`)

Documenta endpoints usados pelo app Mobile com método, path, descrição e snippet cURL.

```json
{
  "type": "apiEndpoints",
  "title": "API — Catálogo",
  "baseUrl": "https://api.example.com",
  "endpoints": [
    {
      "method": "GET",
      "path": "/products",
      "desc": "Lista produtos",
      "sample": "curl -s https://api.example.com/products"
    },
    {
      "method": "POST",
      "path": "/orders",
      "desc": "Cria pedido",
      "auth": "Bearer",
      "sample": "curl -X POST -H 'Authorization: Bearer …' -d @order.json https://api.example.com/orders"
    }
  ]
}
```

## Storybook

Foram adicionadas histórias para exploração visual:

- `Lesson/Blocks/QuizBlock`
- `Lesson/Blocks/Flashcards`
- `Lesson/Blocks/ResourceGallery`
- `Lesson/Blocks/Stepper`
- `Lesson/Blocks/TabsBlock`
- `Lesson/Blocks/Glossary`
- `Lesson/Blocks/ParsonsPuzzle`
- `Lesson/Blocks/ScenarioMatrix`
- `Lesson/Blocks/SpriteSheetViewer`
- `Lesson/Blocks/CRCCards`

Abra com `npm run storybook`.

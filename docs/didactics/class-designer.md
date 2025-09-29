# ClassDesigner (MD3)

O `ClassDesigner` traduz diagramas de classes UML para a linguagem visual do Material Design 3, permitindo que aulas de orientação a objetos apresentem relacionamentos, atributos e responsabilidades em formato totalmente declarativo.

## API declarativa

```ts
interface UmlMember {
  id: string;
  signature: string; // exemplo: "+ nome: String"
  visibility?: 'public' | 'private' | 'protected' | 'package';
  note?: string;
}

interface UmlClass {
  id: string;
  name: string;
  stereotype?: string; // <<interface>>, <<service>>
  summary?: string;
  type?: 'class' | 'interface' | 'enum';
  attributes?: UmlMember[];
  methods?: UmlMember[];
  responsibilities?: string[];
  notes?: string[];
}

interface UmlRelationship {
  id: string;
  from: string;
  to: string;
  type:
    | 'association'
    | 'aggregation'
    | 'composition'
    | 'inheritance'
    | 'realization'
    | 'dependency';
  description?: string;
  fromMultiplicity?: string;
  toMultiplicity?: string;
}

interface UmlLegendItem {
  id: string;
  label: string;
  description?: string;
  kind?: UmlRelationship['type'] | UmlClass['type'];
}

interface ClassDesignerProps {
  title?: string;
  summary?: string;
  classes: UmlClass[];
  relationships?: UmlRelationship[];
  legend?: UmlLegendItem[];
}
```

- `classes` aceita atributos e métodos separados para manter a semântica dos diagramas UML. O componente converte a visibilidade em ícones padrão (`+`, `-`, `#`, `~`) automaticamente.
- `relationships` são renderizados como cartões textuais com multiplicidades e descrições legíveis por leitores de tela, substituindo setas complexas.
- `legend` permite registrar convenções de estereótipos ou tipos de relacionamento utilizados na aula.

## Fundamentos de design

- **Card MD3 acessível**: cada classe é um `article` com cabeçalho, lista de atributos/métodos e responsabilidades. Os estados de foco usam `box-shadow` MD3 e mantêm contraste AA. 【F:src/components/lesson/ClassDesigner.vue†L1-L170】
- **Tipografia declarada**: os títulos usam `text-title-medium`, enquanto assinaturas aplicam `text-body-medium` com fonte monoespaçada opcional em membros. 【F:src/components/lesson/ClassDesigner.vue†L46-L130】
- **Relacionamentos textuais**: apresentados em uma lista com `role="list"`, contendo etiqueta do tipo (`Herança`, `Composição`, etc.), multiplicidades e descrição resumida. 【F:src/components/lesson/ClassDesigner.vue†L132-L170】

## Testes

A suíte `ClassDesigner.test.ts` cobre:

1. Renderização de classes com atributos e métodos completos.
2. Conversão automática de visibilidade para símbolos UML.
3. Exibição de relacionamentos com multiplicidades e legenda opcional. 【F:src/components/lesson/**tests**/ClassDesigner.test.ts†L1-L81】

## Próximos passos

1. Publicar stories no Storybook demonstrando diagramas típicos (modelo entidade-relacionamento, camadas de serviço, padrões de projeto).
2. Criar presets para exercícios de LPOO (ex.: composição vs agregação) usando o `blockRegistry` (`type: "classDesigner"`). 【F:src/components/lesson/blockRegistry.ts†L1-L360】
3. Conectar o componente às rubricas de avaliação de modelagem UML previstas em `docs/material-redesign-plan.md`.

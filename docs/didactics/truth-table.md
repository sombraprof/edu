# Md3TruthTable

O componente `TruthTable` foi reescrito como parte da biblioteca de blocos MD3 para aulas de lógica, oferecendo uma API acessível, declarativa e preparada para alimentar as futuras migrações de conteúdo estruturado.

## Objetivos de design

- **Acessibilidade first-class** – suporte a título, descrição, legenda e rótulos específicos para leitores de tela.
- **Estados semânticos MD3** – células e legendas aproveitam tokens de cor dinâmicos, cobrindo verdade, falsidade, destaque e estados neutros.
- **Conteúdo serializável** – cabeçalhos, linhas e notas estruturadas em objetos simples (`headers`, `rows`, `legend`) para serem preenchidos a partir dos novos esquemas de aulas.

## Propriedades

| Propriedade   | Tipo                             | Obrigatório | Descrição                                                             |
| ------------- | -------------------------------- | ----------- | --------------------------------------------------------------------- |
| `title`       | `string`                         | Não         | Cabeçalho exibido no topo do cartão.                                  |
| `description` | `string`                         | Não         | Texto auxiliar exibido abaixo do título.                              |
| `caption`     | `string`                         | Não         | Legenda semântica do `<table>`, posicionada abaixo da grade.          |
| `headers`     | `(string \| TruthTableHeader)[]` | Sim         | Lista de cabeçalhos, permitindo controlar alinhamento e visibilidade. |
| `rows`        | `TruthTableRow[]`                | Sim         | Dados tabulares; cada linha é um array de células declarativas.       |
| `legend`      | `TruthTableLegendItem[]`         | Não         | Coleção opcional com explicações para os estados exibidos na tabela.  |
| `dense`       | `boolean`                        | Não         | Reduz o preenchimento interno para encaixe em layouts compactos.      |

### Estruturas auxiliares

```ts
interface TruthTableHeader {
  label: string;
  srOnly?: boolean;
  align?: 'start' | 'center' | 'end';
}

interface TruthTableCell {
  value?: string | number | boolean | null;
  display?: string;
  srLabel?: string;
  state?: 'true' | 'false' | 'emphasis' | 'muted' | 'neutral';
  icon?: 'check' | 'x' | 'dash' | 'none';
  note?: string;
  align?: 'start' | 'center' | 'end';
  colSpan?: number;
  rowSpan?: number;
}

type TruthTableRow = TruthTableCell[];

interface TruthTableLegendItem {
  label: string;
  description?: string;
  state?: 'true' | 'false' | 'emphasis' | 'muted' | 'neutral';
  icon?: 'check' | 'x' | 'dash' | 'none';
}
```

- `display` permite exibir texto mesmo quando o estado é renderizado com ícones.
- `srLabel` define um rótulo dedicado para leitores de tela quando a célula não possui conteúdo textual visível.

## Estilização

- Estrutura baseada em `<section>` + `<table>` com `role="region"` para rolagem horizontal acessível. 【F:src/components/lesson/TruthTable.vue†L1-L86】
- Tokens MD3 aplicados em títulos, células e legendas, além de fallbacks para ambientes sem suporte a `color-mix`. 【F:src/components/lesson/TruthTable.vue†L188-L327】
- Estados (`is-true`, `is-false`, `is-emphasis`, etc.) usam cores de sucesso, erro e superfícies variantes para reforçar o significado. 【F:src/components/lesson/TruthTable.vue†L247-L286】

## Exemplo

```vue
<TruthTable
  title="Tabela-Verdade do AND"
  description="Todas as entradas precisam ser verdadeiras para que a saída permaneça verdadeira."
  caption="Combinações do operador lógico AND."
  :legend="[
    { label: 'Verdadeiro', state: 'true', description: 'Saída igual a 1.' },
    { label: 'Falso', state: 'false', description: 'Saída igual a 0.' },
  ]"
  :headers="['A', 'B', 'A ∧ B']"
  :rows="[
    [{ value: 'Verdadeiro' }, { value: 'Verdadeiro' }, { state: 'true', display: 'Verdadeiro' }],
    [{ value: 'Verdadeiro' }, { value: 'Falso' }, { state: 'false', display: 'Falso' }],
  ]"
  dense
/>
```

A API preparada para serialização garante que as futuras migrações para MDX/JSON possam preencher a tabela com base em dados normalizados, sem dependência de HTML manual.

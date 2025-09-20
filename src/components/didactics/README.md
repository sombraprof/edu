# 📚 Biblioteca de Componentes Didáticos

Uma coleção de componentes Vue reutilizáveis para elementos educacionais, seguindo o Material Design 3. Cada componente é responsivo, acessível e aceita props para personalização de conteúdo.

## 🎯 Componentes Disponíveis

### 1. TruthTable - Tabelas Verdade/Falso
Componente para exibir tabelas verdade de operadores lógicos.

```vue
<template>
  <TruthTable
    title="Tabela Verdade - Operador E (AND)"
    :headers="['A', 'B', 'A ∧ B']"
    :rows="[
      ['V', 'V', 'V'],
      ['V', 'F', 'F'],
      ['F', 'V', 'F'],
      ['F', 'F', 'F']
    ]"
    :legend="true"
  />
</template>

<script setup>
import { TruthTable } from '@/components/didactics';
</script>
```

### 2. Flowchart - Fluxogramas
Componente para criar fluxogramas interativos com nós conectados.

```vue
<template>
  <Flowchart
    title="Fluxograma: Verificação de Aprovação"
    :nodes="flowchartNodes"
    :connections="flowchartConnections"
    :legend="flowchartLegend"
  />
</template>

<script setup>
import { Flowchart } from '@/components/didactics';

const flowchartNodes = [
  {
    id: "start",
    type: "start",
    content: "Início",
    x: 50,
    y: 50
  },
  {
    id: "decision",
    type: "decision",
    content: "Média ≥ 7.0?",
    x: 300,
    y: 150
  }
];

const flowchartConnections = [
  { from: "start", to: "decision", label: "Sim" }
];
</script>
```

### 3. BlockDiagram - Diagramas de Blocos
Componente para diagramas de blocos com conexões e legendas.

```vue
<template>
  <BlockDiagram
    title="Diagrama de Blocos: Sistema"
    :blocks="systemBlocks"
    :connections="systemConnections"
    :legend="systemLegend"
  />
</template>

<script setup>
import { BlockDiagram } from '@/components/didactics';

const systemBlocks = [
  {
    id: "input",
    type: "input",
    title: "Entrada",
    content: "Dados de entrada",
    x: 50,
    y: 50,
    width: 150,
    height: 80
  },
  {
    id: "process",
    type: "process",
    title: "Processamento",
    content: "Lógica de negócio",
    x: 250,
    y: 50,
    width: 150,
    height: 80
  }
];

const systemConnections = [
  { from: "input", to: "process", label: "Fluxo de dados" }
];
</script>
```

## 🚀 Instalação e Uso

### Importação
```typescript
// Importar componentes individuais
import { TruthTable, Flowchart, BlockDiagram } from '@/components/didactics';

// Ou importar tudo
import * as Didactics from '@/components/didactics';
```

### Uso em Templates Vue
```vue
<template>
  <div>
    <TruthTable v-bind="truthTableData" />
    <Flowchart v-bind="flowchartData" />
    <BlockDiagram v-bind="blockDiagramData" />
  </div>
</template>
```

## 📋 Props e Interfaces

### TruthTable Props
```typescript
interface TruthTableProps {
  title?: string;
  description?: string;
  headers: string[];
  rows: (string | boolean | number)[][];
  legend?: boolean;
}
```

### Flowchart Props
```typescript
interface FlowchartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'io' | 'end' | 'database' | 'subprocess';
  content: string;
  icon?: string;
  x: number;
  y: number;
}

interface FlowchartConnection {
  from: string;
  to: string;
  label?: string;
}

interface FlowchartProps {
  title?: string;
  description?: string;
  nodes: FlowchartNode[];
  connections: FlowchartConnection[];
  legend?: LegendItem[];
  dimensions?: { width: number; height: number };
}
```

### BlockDiagram Props
```typescript
interface BlockDiagramBlock {
  id: string;
  type: 'process' | 'data' | 'input' | 'output' | 'storage' | 'decision' | 'custom';
  title?: string;
  content: string;
  icon?: string;
  items?: BlockItem[];
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BlockDiagramProps {
  title?: string;
  description?: string;
  blocks: BlockDiagramBlock[];
  connections: BlockDiagramConnection[];
  legend?: LegendItem[];
  dimensions?: { width: number; height: number };
}
```

## 🎨 Estilos e Temas

### Material Design 3
Todos os componentes seguem as diretrizes do Material Design 3:
- ✅ Cores do sistema MD3
- ✅ Sombras e elevações apropriadas
- ✅ Bordas arredondadas
- ✅ Tipografia consistente
- ✅ Estados interativos (hover, focus)

### Responsividade
- ✅ Layout adaptável para mobile e desktop
- ✅ Overflow horizontal com scroll
- ✅ Fontes escaláveis
- ✅ Espaçamentos responsivos

### Tema Dark/Light
- ✅ Suporte automático ao tema do sistema
- ✅ Contraste adequado em ambos os temas
- ✅ Transições suaves entre temas

## 📖 Exemplos Práticos

### Exemplo Completo
```vue
<template>
  <div class="space-y-8">
    <!-- Tabela Verdade -->
    <TruthTable
      title="Operador Lógico E (AND)"
      description="Tabela verdade do operador E"
      :headers="['A', 'B', 'A ∧ B']"
      :rows="[
        ['V', 'V', 'V'],
        ['V', 'F', 'F'],
        ['F', 'V', 'F'],
        ['F', 'F', 'F']
      ]"
      :legend="true"
    />

    <!-- Fluxograma -->
    <Flowchart
      title="Algoritmo de Ordenação"
      :nodes="sortingNodes"
      :connections="sortingConnections"
      :dimensions="{ width: 800, height: 600 }"
    />

    <!-- Diagrama de Blocos -->
    <BlockDiagram
      title="Arquitetura do Sistema"
      :blocks="architectureBlocks"
      :connections="architectureConnections"
      :legend="architectureLegend"
    />
  </div>
</template>

<script setup>
import { TruthTable, Flowchart, BlockDiagram } from '@/components/didactics';

// Dados dos componentes aqui...
</script>
```

## 🔧 Desenvolvimento

### Estrutura de Arquivos
```
src/components/didactics/
├── TruthTable.vue          # Componente de tabelas verdade
├── Flowchart.vue           # Componente de fluxogramas
├── BlockDiagram.vue        # Componente de diagramas de blocos
├── index.ts                # Exportações e tipos
├── examples.ts             # Exemplos de uso
└── README.md              # Esta documentação
```

### Adicionando Novos Componentes
1. Crie o arquivo `.vue` do componente
2. Adicione as interfaces TypeScript em `index.ts`
3. Exporte o componente em `index.ts`
4. Adicione exemplos em `examples.ts`
5. Atualize esta documentação

## 🎯 Casos de Uso

### Educação em Computação
- ✅ Tabelas verdade para lógica digital
- ✅ Fluxogramas para algoritmos
- ✅ Diagramas de blocos para arquitetura de sistemas

### Ensino de Matemática
- ✅ Tabelas de valores para funções
- ✅ Diagramas de blocos para processos matemáticos
- ✅ Fluxogramas para resolução de problemas

### Ensino Técnico
- ✅ Diagramas de blocos para processos industriais
- ✅ Fluxogramas para procedimentos técnicos
- ✅ Tabelas para especificações técnicas

## 🚀 Performance

- ✅ Componentes lazy-loaded
- ✅ Renderização otimizada com Vue 3
- ✅ CSS eficiente sem frameworks pesados
- ✅ Bundle size otimizado

## 📄 Licença

Este projeto é parte do sistema EDU - Courses Hub e segue a mesma licença do projeto principal.

---

**💡 Dica:** Para ver exemplos completos, consulte o arquivo `examples.ts` nesta pasta.
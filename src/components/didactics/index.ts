/**
 * Biblioteca de Componentes Didáticos
 *
 * Componentes reutilizáveis para elementos educacionais seguindo Material Design 3.
 * Cada componente é responsivo e aceita props para personalização de conteúdo.
 */

export { default as TruthTable } from './TruthTable.vue';
export { default as Flowchart } from './Flowchart.vue';
export { default as BlockDiagram } from './BlockDiagram.vue';

// Tipos de dados para os componentes
export interface TruthTableData {
  title?: string;
  description?: string;
  headers: string[];
  rows: (string | boolean | number)[][];
  legend?: boolean;
}

export interface FlowchartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'io' | 'end' | 'database' | 'subprocess';
  content: string;
  icon?: string;
  x: number;
  y: number;
}

export interface FlowchartConnection {
  from: string;
  to: string;
  label?: string;
}

export interface FlowchartData {
  title?: string;
  description?: string;
  nodes: FlowchartNode[];
  connections: FlowchartConnection[];
  legend?: Array<{
    type: string;
    label: string;
    color: string;
  }>;
  dimensions?: { width: number; height: number };
}

export interface BlockDiagramBlock {
  id: string;
  type: 'process' | 'data' | 'input' | 'output' | 'storage' | 'decision' | 'custom';
  title?: string;
  content: string;
  icon?: string;
  items?: Array<{
    id: string;
    content: string;
  }>;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BlockDiagramConnection {
  from: string;
  to: string;
  label?: string;
  color?: string;
  dashed?: boolean;
}

export interface BlockDiagramData {
  title?: string;
  description?: string;
  blocks: BlockDiagramBlock[];
  connections: BlockDiagramConnection[];
  legend?: Array<{
    type: string;
    label: string;
    color: string;
    borderColor?: string;
  }>;
  dimensions?: { width: number; height: number };
}

// Funções utilitárias
export const createTruthTable = (data: TruthTableData) => data;
export const createFlowchart = (data: FlowchartData) => data;
export const createBlockDiagram = (data: BlockDiagramData) => data;
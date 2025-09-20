/**
 * Exemplos de uso dos componentes didáticos
 *
 * Este arquivo contém exemplos práticos de como usar cada componente
 * com dados realistas para demonstração e teste.
 */

import { createTruthTable, createFlowchart, createBlockDiagram } from './index';

// Exemplo 1: Tabela Verdade do Operador E (AND)
export const truthTableExample = createTruthTable({
  title: "Tabela Verdade - Operador E (AND)",
  description: "O operador <strong>E</strong> resulta em verdadeiro apenas quando ambas as condições são verdadeiras.",
  headers: ["Condição A", "Condição B", "Resultado (A ∧ B)"],
  rows: [
    ["V", "V", "V"],
    ["V", "F", "F"],
    ["F", "V", "F"],
    ["F", "F", "F"]
  ],
  legend: true
});

// Exemplo 2: Fluxograma de um Programa Simples
export const flowchartExample = createFlowchart({
  title: "Fluxograma: Verificação de Aprovação",
  description: "Fluxograma que representa a lógica de aprovação de um aluno baseada na média e frequência.",
  nodes: [
    {
      id: "start",
      type: "start",
      content: "Início",
      x: 50,
      y: 50
    },
    {
      id: "input",
      type: "io",
      content: "Ler média e frequência",
      x: 50,
      y: 150
    },
    {
      id: "check-grade",
      type: "decision",
      content: "Média ≥ 7.0?",
      x: 300,
      y: 150
    },
    {
      id: "check-attendance",
      type: "decision",
      content: "Frequência ≥ 75%?",
      x: 300,
      y: 250
    },
    {
      id: "approved",
      type: "end",
      content: "Aprovado",
      x: 50,
      y: 350
    },
    {
      id: "failed",
      type: "end",
      content: "Reprovado",
      x: 550,
      y: 350
    }
  ],
  connections: [
    { from: "start", to: "input" },
    { from: "input", to: "check-grade" },
    { from: "check-grade", to: "check-attendance", label: "Sim" },
    { from: "check-grade", to: "failed", label: "Não" },
    { from: "check-attendance", to: "approved", label: "Sim" },
    { from: "check-attendance", to: "failed", label: "Não" }
  ],
  legend: [
    { type: "start", label: "Início/Fim", color: "secondary" },
    { type: "process", label: "Processamento", color: "primary" },
    { type: "decision", label: "Decisão", color: "tertiary" },
    { type: "io", label: "Entrada/Saída", color: "surface-container" }
  ],
  dimensions: { width: 700, height: 450 }
});

// Exemplo 3: Diagrama de Blocos de um Sistema
export const blockDiagramExample = createBlockDiagram({
  title: "Diagrama de Blocos: Sistema de Gerenciamento Escolar",
  description: "Representação visual dos componentes principais de um sistema de gerenciamento escolar.",
  blocks: [
    {
      id: "user",
      type: "input",
      title: "Usuário",
      content: "Professor, Aluno ou Administrador",
      icon: "users",
      x: 50,
      y: 50,
      width: 150,
      height: 80
    },
    {
      id: "interface",
      type: "process",
      title: "Interface Web",
      content: "Frontend responsivo com autenticação",
      icon: "monitor",
      x: 250,
      y: 50,
      width: 180,
      height: 80
    },
    {
      id: "api",
      type: "process",
      title: "API REST",
      content: "Serviços backend para lógica de negócio",
      icon: "server",
      x: 480,
      y: 50,
      width: 150,
      height: 80
    },
    {
      id: "database",
      type: "storage",
      title: "Banco de Dados",
      content: "Armazenamento de dados de alunos, cursos e notas",
      icon: "database",
      x: 350,
      y: 180,
      width: 200,
      height: 100,
      items: [
        { id: "students", content: "Dados dos alunos" },
        { id: "courses", content: "Informações dos cursos" },
        { id: "grades", content: "Notas e avaliações" }
      ]
    },
    {
      id: "reports",
      type: "output",
      title: "Relatórios",
      content: "Geração de boletins e estatísticas",
      icon: "hard-drive",
      x: 50,
      y: 320,
      width: 150,
      height: 80
    },
    {
      id: "backup",
      type: "data",
      title: "Backup",
      content: "Sistema de backup automático",
      icon: "cloud",
      x: 550,
      y: 320,
      width: 130,
      height: 80
    }
  ],
  connections: [
    { from: "user", to: "interface", label: "Acesso" },
    { from: "interface", to: "api", label: "Requisições" },
    { from: "api", to: "database", label: "CRUD" },
    { from: "database", to: "reports", label: "Dados" },
    { from: "database", to: "backup", label: "Backup", dashed: true }
  ],
  legend: [
    { type: "input", label: "Entrada (Usuários)", color: "tertiary-container", borderColor: "tertiary" },
    { type: "process", label: "Processamento", color: "primary-container", borderColor: "primary" },
    { type: "storage", label: "Armazenamento", color: "surface-container", borderColor: "outline" },
    { type: "output", label: "Saída (Relatórios)", color: "success-container", borderColor: "success" }
  ],
  dimensions: { width: 750, height: 450 }
});

// Exemplo 4: Tabela Verdade com Operadores Lógicos
export const logicOperatorsExample = createTruthTable({
  title: "Tabela Verdade - Operadores Lógicos Básicos",
  description: "Comparação entre os operadores <strong>E (∧)</strong>, <strong>OU (∨)</strong> e <strong>NÃO (¬)</strong>.",
  headers: ["A", "B", "A ∧ B", "A ∨ B", "¬A", "¬B"],
  rows: [
    ["V", "V", "V", "V", "F", "F"],
    ["V", "F", "F", "V", "F", "V"],
    ["F", "V", "F", "V", "V", "F"],
    ["F", "F", "F", "F", "V", "V"]
  ],
  legend: true
});

// Exemplo 5: Fluxograma de Algoritmo de Ordenação
export const sortingFlowchartExample = createFlowchart({
  title: "Fluxograma: Algoritmo Bubble Sort",
  description: "Representação visual do algoritmo de ordenação Bubble Sort.",
  nodes: [
    {
      id: "start",
      type: "start",
      content: "Início",
      x: 50,
      y: 50
    },
    {
      id: "input-array",
      type: "io",
      content: "Ler array de números",
      x: 50,
      y: 150
    },
    {
      id: "init-i",
      type: "process",
      content: "i = 0",
      x: 300,
      y: 150
    },
    {
      id: "check-i",
      type: "decision",
      content: "i < n-1?",
      x: 300,
      y: 250
    },
    {
      id: "init-j",
      type: "process",
      content: "j = 0",
      x: 50,
      y: 350
    },
    {
      id: "check-j",
      type: "decision",
      content: "j < n-i-1?",
      x: 300,
      y: 350
    },
    {
      id: "compare",
      type: "decision",
      content: "array[j] > array[j+1]?",
      x: 550,
      y: 350
    },
    {
      id: "swap",
      type: "process",
      content: "Trocar array[j] ↔ array[j+1]",
      x: 550,
      y: 450
    },
    {
      id: "increment-j",
      type: "process",
      content: "j = j + 1",
      x: 300,
      y: 450
    },
    {
      id: "increment-i",
      type: "process",
      content: "i = i + 1",
      x: 50,
      y: 250
    },
    {
      id: "output",
      type: "io",
      content: "Exibir array ordenado",
      x: 50,
      y: 550
    },
    {
      id: "end",
      type: "end",
      content: "Fim",
      x: 300,
      y: 550
    }
  ],
  connections: [
    { from: "start", to: "input-array" },
    { from: "input-array", to: "init-i" },
    { from: "init-i", to: "check-i" },
    { from: "check-i", to: "init-j", label: "Sim" },
    { from: "check-i", to: "output", label: "Não" },
    { from: "init-j", to: "check-j" },
    { from: "check-j", to: "compare", label: "Sim" },
    { from: "check-j", to: "increment-i", label: "Não" },
    { from: "compare", to: "swap", label: "Sim" },
    { from: "compare", to: "increment-j", label: "Não" },
    { from: "swap", to: "increment-j" },
    { from: "increment-j", to: "check-j" },
    { from: "increment-i", to: "check-i" },
    { from: "output", to: "end" }
  ],
  dimensions: { width: 800, height: 650 }
});

// Exportar todos os exemplos
export const examples = {
  truthTableExample,
  flowchartExample,
  blockDiagramExample,
  logicOperatorsExample,
  sortingFlowchartExample
};
#!/usr/bin/env node
// Upgrades Alg I lessons by fixing resource URLs and injecting selected interactive blocks.
// Safe and idempotent: only adds when not present and fixes obviously invalid URLs.

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const LESSONS_DIR = path.join(ROOT, 'src/content/courses/algi/lessons');
const REPORT = { fixedResources: {}, injectedBlocks: {} };
const MOODLE_URL = 'https://eadsp.unichristus.edu.br/';

// Topic mapping for richer, aligned content per lesson
function getTopic(num) {
  if (num <= 0) return 'unknown';
  if ([1, 2].includes(num)) return 'intro';
  if ([3, 4].includes(num)) return 'alg_steps';
  if (num === 5) return 'flowcharts';
  if (num === 6) return 'types';
  if (num === 7) return 'operators';
  if ([8, 9, 10, 11].includes(num)) return 'sequentials';
  if (num === 12) return 'conditionals_basic';
  if (num === 13) return 'conditionals_compound';
  if (num === 17) return 'while';
  if (num === 18) return 'for';
  if (num === 19) return 'loops_compare';
  if (num === 20) return 'do_while';
  if (num === 21) return 'nested_loops';
  if ([22, 23, 24].includes(num)) return 'integrator';
  if ([25, 26].includes(num)) return 'functions_intro';
  if ([27, 28].includes(num)) return 'functions_integration';
  if (num === 30) return 'vectors_intro';
  if (num === 31) return 'vectors_ops';
  if (num === 32) return 'linear_search';
  if (num === 33) return 'matrices_intro';
  if (num === 34) return 'matrices_ops';
  if (num === 35) return 'structs_intro';
  if (num === 36) return 'structs_array';
  if (num === 37) return 'structs_update';
  if (num === 38) return 'review';
  if (num === 39) return 'exam';
  if (num === 40) return 'wrapup';
  return 'general';
}

const TOPIC_REFS = {
  intro: [
    'FORBELLONE, A. L. V.; EBERSPÄCHER, H. F. Algoritmos: Introdução à lógica.',
    'MANZANO, J. A. N. G.; OLIVEIRA, J. F. Capítulo 1 — Conceitos básicos.',
  ],
  flowcharts: ['FORBELLONE & EBERSPÄCHER — Fluxogramas (cap. introdutório).'],
  types: ['BACKES — Tipos primitivos em C (cap. básico).'],
  operators: ['FORBELLONE — Operadores e precedência.'],
  sequentials: ['MANZANO — Estruturas sequenciais em C.'],
  conditionals_basic: ['FORBELLONE — Estruturas de decisão (if/else).'],
  conditionals_compound: ['FORBELLONE — Composição de condições (else if).'],
  while: ['MANZANO — Laço while em C.'],
  for: ['MANZANO — Laço for em C.'],
  loops_compare: ['BACKES — Comparando laços for/while.'],
  do_while: ['MANZANO — Laço do-while (menus).'],
  nested_loops: ['Exercícios de laços aninhados (tabelas).'],
  functions_intro: ['BACKES — Funções, protótipos e escopo.'],
  functions_integration: ['Boas práticas de modularização.'],
  vectors_intro: ['MANZANO — Vetores (cap. 9).'],
  vectors_ops: ['Operações em vetores: soma, média, extremos.'],
  linear_search: ['Busca linear (sequencial) em vetores.'],
  matrices_intro: ['Matrizes 2D — leitura e escrita.'],
  matrices_ops: ['Somatório de linhas/colunas.'],
  structs_intro: ['BACKES — Structs: definição e acesso.'],
  structs_array: ['Vetores de structs.'],
  structs_update: ['Atualização de registros em structs.'],
  review: ['Revisões integradas da disciplina.'],
};

function academicCalloutFor(topic) {
  const list = TOPIC_REFS[topic] || TOPIC_REFS.intro;
  return {
    type: 'callout',
    variant: 'academic',
    title: 'Leitura recomendada',
    content: [{ type: 'list', items: list }],
  };
}

function tabsPseudoCFor(topic) {
  switch (topic) {
    case 'sequentials':
      return {
        type: 'tabs',
        title: 'Sequencial — Pseudocódigo × C',
        tabs: [
          {
            label: 'Pseudocódigo',
            content:
              '<pre>ler preco\nler desconto\nfinal ← preco - (preco*desconto/100)\nescrever final</pre>',
          },
          {
            label: 'C',
            code: '#include <stdio.h>\nint main(){float p,d; scanf("%f%f",&p,&d); printf("%.2f\\n", p - (p*d/100));}',
            language: 'c',
          },
        ],
      };
    case 'conditionals_basic':
      return {
        type: 'tabs',
        title: 'Decisão (if/else) — Pseudocódigo × C',
        tabs: [
          {
            label: 'Pseudocódigo',
            content:
              '<pre>ler nota\nse nota ≥ 7 então\n  escrever "Aprovado"\nsenão\n  escrever "Reprovado"</pre>',
          },
          {
            label: 'C',
            code: '#include <stdio.h>\nint main(){float n; scanf("%f", &n); if(n>=7) puts("Aprovado"); else puts("Reprovado");}',
            language: 'c',
          },
        ],
      };
    case 'linear_search':
      return {
        type: 'tabs',
        title: 'Busca linear — Pseudocódigo × C',
        tabs: [
          {
            label: 'Pseudocódigo',
            content: '<pre>para i de 0 até n-1\n  se v[i] = x então retorna i\nretorna -1</pre>',
          },
          {
            label: 'C',
            code: 'int busca(int*v,int n,int x){for(int i=0;i<n;i++) if(v[i]==x) return i; return -1;}',
            language: 'c',
          },
        ],
      };
    default:
      return {
        type: 'tabs',
        title: 'Representações: Pseudocódigo × C',
        tabs: [
          { label: 'Pseudocódigo', content: '<pre>ler A, B\nsoma ← A + B\nescrever soma</pre>' },
          {
            label: 'C',
            code: '#include <stdio.h>\nint main(){int a,b; scanf("%d %d",&a,&b); printf("%d\\n", a+b);}',
            language: 'c',
          },
        ],
      };
  }
}

function stepperFor(topic) {
  if (topic === 'for') {
    return {
      type: 'stepper',
      title: 'for (inicialização; condição; incremento)',
      steps: [
        { title: 'Inicialização', description: 'int i = 0;' },
        { title: 'Condição', description: 'i < n' },
        { title: 'Incremento', description: 'i++' },
      ],
    };
  }
  if (topic === 'do_while') {
    return {
      type: 'stepper',
      title: 'do { ... } while (condição);',
      steps: [
        { title: 'Executa', description: 'Bloco executa ao menos uma vez.' },
        { title: 'Testa', description: 'Condição ao final decide continuar.' },
      ],
    };
  }
  if (topic === 'vectors_ops') {
    return {
      type: 'stepper',
      title: 'Operações com vetores',
      steps: [
        { title: 'Somatório', description: 'Percorrer e somar' },
        { title: 'Média', description: 'Somatório / n' },
        { title: 'Extremos', description: 'Maior/Menor' },
      ],
    };
  }
  return {
    type: 'stepper',
    title: 'Modelo Entrada → Processamento → Saída',
    steps: [
      { title: 'Entrada', description: 'Ler dados do usuário (scanf) e validar.' },
      { title: 'Processamento', description: 'Aplicar cálculos e regras de negócio.' },
      { title: 'Saída', description: 'Exibir resultados formatados (printf).' },
    ],
  };
}

function truthTableBasic() {
  return {
    type: 'truthTable',
    title: 'Tabela da verdade (AND/OR)',
    headers: ['A', 'B', 'A && B', 'A || B'],
    rows: [
      [{ value: 'F' }, { value: 'F' }, { value: 'F' }, { value: 'F' }],
      [{ value: 'F' }, { value: 'T' }, { value: 'F' }, { value: 'T' }],
      [{ value: 'T' }, { value: 'F' }, { value: 'F' }, { value: 'T' }],
      [{ value: 'T' }, { value: 'T' }, { value: 'T' }, { value: 'T' }],
    ],
  };
}

function testCasesCalloutFor(topic) {
  const byTopic = {
    sequentials: `# Entrada → Saída\n100 10 -> 90.00\n250 5 -> 237.50`,
    conditionals_basic: `# Entrada → Saída\nnota=7.5 -> Aprovado\nnota=6.9 -> Reprovado`,
    conditionals_compound: `# Entrada → Saída\nidade=18, media=9.0 -> Aprovado com Mérito\nidade=17, media=8.0 -> Aprovado\nidade=20, media=3.5 -> Reprovado`,
    while: `# Sequência de leituras (termina com 0)\n3 5 0 -> soma=8\n10 -2 2 0 -> soma=10`,
    for: `# Entrada → Saída\nn=5 -> 1 2 3 4 5`,
    loops_compare: `# for\nn=3 -> 1 2 3\n# while\nn=3 -> 1 2 3`,
    do_while: `# Entrada → Saída (menu repete)\n1 2 0 -> executou duas operações e encerrou`,
    functions_intro: `# Funções\ninput: 2 3 -> soma()=5`,
    vectors_intro: `# Vetor (leitura e exibição)\n[5, 2, 9] -> imprime 5 2 9`,
    vectors_ops: `# Vetor (soma, média, extremos)\n[10, 20, 30] -> soma=60, média=20, maior=30, menor=10`,
    linear_search: `# Busca linear\n[3,5,7], x=5 -> 1\n[3,5,7], x=10 -> -1`,
    matrices_intro: `# Matriz 2x2\n[[1,2],[3,4]] -> imprime em tabela`,
    matrices_ops: `# Soma por linha\n[[1,2],[3,4]] -> L1=3, L2=7`,
    structs_intro: `# Struct Pessoa\nEntrada: Ana 20 -> Pessoa{nome=Ana, idade=20}`,
    structs_array: `# Vetor de produtos (3) -> lista formatada`,
    structs_update: `# Busca/atualização\nCPF=123 atualiza saldo +100 -> novo saldo esperado`,
    review: `# Monte seus próprios casos com base nas revisões.`,
  };
  const code = byTopic[topic] || `# Defina entradas e saídas esperadas para validar seu programa.`;
  return {
    type: 'callout',
    variant: 'info',
    title: 'Casos de teste sugeridos',
    content: [{ type: 'code', code, language: 'plaintext' }],
  };
}

function goodPracticeCalloutFor(topic) {
  const common = [
    'Use nomes de variáveis autoexplicativos (ex.: total, media, indice).',
    'Evite números mágicos; use constantes quando apropriado.',
    'Comente trechos que expressem intenção (não o óbvio).',
  ];
  const byTopic = {
    conditionals_basic: [
      'Ordene condições do caso mais restritivo para o mais amplo.',
      'Use parênteses para reforçar a intenção em expressões complexas.',
    ],
    for: [
      'Prefira contadores com nomes i, j, k para laços simples; nomes mais descritivos quando a intenção não for óbvia.',
    ],
    while: ['Garanta avanço de estado dentro do laço para evitar loops infinitos.'],
    functions_intro: [
      'Funções pequenas e coesas: uma responsabilidade clara por função.',
      'Prefira passar dados por parâmetro ao invés de depender de variáveis globais.',
    ],
    vectors_ops: ['Inicialize acumuladores apropriadamente (ex.: soma=0, maior=INT_MIN).'],
    linear_search: ['Retorne cedo ao encontrar o elemento para reduzir custo.'],
    structs_update: ['Valide índices/IDs antes de atualizar registro.'],
  };
  const items = [...common, ...(byTopic[topic] || [])];
  return {
    type: 'callout',
    variant: 'good-practice',
    title: 'Boas práticas',
    content: [{ type: 'list', items }],
  };
}

function solutionCodeFor(topic) {
  switch (topic) {
    case 'sequentials':
      return `#include <stdio.h>\nint main(){\n  float preco, desc;\n  if (scanf("%f %f", &preco, &desc)!=2) return 1;\n  float final = preco - (preco*desc/100.0f);\n  printf("%.2f\n", final);\n  return 0;\n}`;
    case 'conditionals_basic':
      return `#include <stdio.h>\nint main(){\n  float nota;\n  if (scanf("%f", &nota)!=1) return 1;\n  if (nota >= 7.0f) puts("Aprovado"); else puts("Reprovado");\n  return 0;\n}`;
    case 'for':
      return `#include <stdio.h>\nint main(){\n  int n; if (scanf("%d", &n)!=1) return 1;\n  for (int i=1;i<=n;i++){ printf("%d%s", i, i==n?"\n":" "); }\n  return 0;\n}`;
    case 'linear_search':
      return `int busca(int *v, int n, int x){\n  for (int i=0;i<n;i++){ if (v[i]==x) return i; }\n  return -1;\n}`;
    case 'vectors_ops':
      return `#include <stdio.h>\n#include <limits.h>\nint main(){\n  int n; if (scanf("%d", &n)!=1) return 1;\n  int x, soma=0, maior=INT_MIN, menor=INT_MAX;\n  for (int i=0;i<n;i++){\n    scanf("%d", &x); soma+=x; if (x>maior) maior=x; if (x<menor) menor=x;\n  }\n  printf("soma=%d media=%.2f maior=%d menor=%d\n", soma, (double)soma/n, maior, menor);\n  return 0;\n}`;
    case 'matrices_ops':
      return `#include <stdio.h>\nint main(){\n  int m[2][2];\n  for (int i=0;i<2;i++) for (int j=0;j<2;j++) scanf("%d", &m[i][j]);\n  for (int i=0;i<2;i++){\n    int soma=0; for (int j=0;j<2;j++){ soma+=m[i][j]; }\n    printf("L%d=%d\n", i+1, soma);\n  }\n  return 0;\n}`;
    case 'functions_intro':
      return `int soma(int a, int b){ return a+b; }\n#include <stdio.h>\nint main(){ int a,b; scanf("%d %d", &a,&b); printf("%d\n", soma(a,b)); }`;
    default:
      return `// Exercício base da aula — implemente aqui sua solução em C.`;
  }
}

function solutionReferenceCallout(topic) {
  return {
    type: 'callout',
    variant: 'academic',
    title: 'Solução de referência',
    content: [{ type: 'code', code: solutionCodeFor(topic), language: 'c' }],
  };
}

function commonErrorsCalloutFor(topic) {
  const examples = {
    operators: {
      bad: 'printf("%d", 2 + 2 * 2); // espera 8 (incorreto)',
      good: 'printf("%d", 2 + (2 * 2)); // 6 (correto: precedência)',
    },
    conditionals_basic: {
      bad: 'if (nota = 7) { /* ... */ } // usa = no lugar de ==',
      good: 'if (nota == 7) { /* ... */ } // comparação correta',
    },
    for: {
      bad: 'for (int i=0; i<n; ) { /* sem incremento */ }',
      good: 'for (int i=0; i<n; i++) { /* ok */ }',
    },
    while: {
      bad: 'while (x != 0) { /* não altera x */ }',
      good: 'while (x != 0) { /* ... */ scanf("%d", &x); }',
    },
    functions_intro: {
      bad: 'int soma(int a,int b){ printf("%d", a+b); } // mistura cálculo e I/O',
      good: 'int soma(int a,int b){ return a+b; } // devolve resultado',
    },
    vectors_ops: {
      bad: 'int maior = 0; // pode falhar com negativos',
      good: '#include <limits.h>\nint maior = INT_MIN; // robusto',
    },
    linear_search: {
      bad: 'int idx; for(int i=0;i<n;i++){ if(v[i]==x) idx=i; } // percorre tudo',
      good: 'for(int i=0;i<n;i++){ if(v[i]==x) return i; } // retorna cedo',
    },
    matrices_ops: {
      bad: 'int soma; for(int i=0;i<2;i++){ for(int j=0;j<2;j++){ soma+=m[i][j]; } } // soma não inicializada',
      good: 'for(int i=0;i<2;i++){ int soma=0; for(int j=0;j<2;j++){ soma+=m[i][j]; } printf("L%d=%d\n", i+1, soma);} ',
    },
    structs_update: {
      bad: 'clientes[idx].saldo += valor; // sem verificar idx',
      good: 'if (idx>=0) clientes[idx].saldo += valor; // validação',
    },
  };
  const pair = examples[topic];
  const items = [
    'Leia o enunciado e valide entradas antes de processar.',
    'Inicialize variáveis; evite estados indefinidos.',
  ];
  const content = [{ type: 'list', items }];
  if (pair) {
    content.push({ type: 'paragraph', text: '<strong>Anti-exemplo</strong>' });
    content.push({ type: 'code', code: pair.bad, language: 'c' });
    content.push({ type: 'paragraph', text: '<strong>Refatorado</strong>' });
    content.push({ type: 'code', code: pair.good, language: 'c' });
  }
  return {
    type: 'callout',
    variant: 'warning',
    title: 'Erros comuns e refatorações',
    content,
  };
}

function warmUpCalloutFor(topic) {
  const prompts = {
    intro: [
      'Liste 3 problemas do cotidiano que envolvem passos e decisões.',
      'Escreva um algoritmo curto (texto) para um deles.',
    ],
    alg_steps: [
      'Descreva 5 passos para preparar um café.',
      'Identifique entrada, processamento e saída.',
    ],
    flowcharts: [
      'Desenhe um fluxograma simples de um login (em papel).',
      'Marque início/fim e decisões.',
    ],
    types: ['Diga 3 exemplos para int/float/char.', 'Por que const ajuda em legibilidade?'],
    operators: [
      'Dê 2 exemplos de expressões e calcule manualmente.',
      'Onde parênteses mudam o resultado?',
    ],
    sequentials: ['Leia 2 números e calcule desconto.', 'Formate a saída com 2 casas decimais.'],
    conditionals_basic: [
      'Regras de aprovação: defina em palavras.',
      'Traduza uma regra em if/else.',
    ],
    while: ['Quando while é melhor que for?', 'Dê um exemplo prático.'],
    for: ['Quando for é melhor que while?', 'Dê um exemplo prático.'],
    functions_intro: ['Divida um problema em 3 funções coesas.', 'Escreva nomes sugestivos.'],
    vectors_intro: ['Para um vetor de 5 notas, que operações são úteis?', 'Como percorrê-lo?'],
  };
  const items = prompts[topic] || [
    'Escreva em 3 minutos: o que você lembra da aula passada?',
    'Compartilhe com a dupla.',
  ];
  return {
    type: 'callout',
    variant: 'task',
    title: 'Warm-up (início da aula)',
    content: [{ type: 'list', items }],
  };
}

function checkOutCalloutFor(topic) {
  const prompts = {
    intro: ['Em uma frase: o que é um algoritmo?', 'Qual dúvida fica para a próxima aula?'],
    sequentials: [
      'Qual parte do EPS te gerou mais dúvidas?',
      'Cite um caso de teste que você usou.',
    ],
    conditionals_basic: ['Escreva uma condição curta com && ou ||.', 'O que confundiu hoje?'],
    for: ['Qual foi o padrão de incremento que você usou?', 'Quando preferir while?'],
  };
  const items = prompts[topic] || [
    'Registre 1 aprendizado e 1 dúvida.',
    'Entregue no AVA (campo de texto).',
  ];
  return {
    type: 'callout',
    variant: 'task',
    title: 'Check-out (fechamento rápido)',
    content: [{ type: 'list', items }],
  };
}

function flashcardsFor(topic) {
  const decks = {
    intro: [
      { front: '<b>Algoritmo</b>', back: 'Sequência finita de passos para resolver um problema.' },
      { front: '<b>EPS</b>', back: 'Entrada, Processamento, Saída.' },
    ],
    types: [
      { front: '<b>int</b>', back: 'Inteiros' },
      { front: '<b>float</b>', back: 'Ponto flutuante' },
      { front: '<b>char</b>', back: 'Caractere' },
    ],
    operators: [
      { front: '<b>Precedência</b>', back: '*, / antes de +, -' },
      { front: '<b>Parênteses</b>', back: 'Explicitam intenção' },
    ],
    functions_intro: [
      { front: '<b>Protótipo</b>', back: 'Assinatura da função' },
      { front: '<b>Escopo</b>', back: 'Visibilidade da variável' },
    ],
    vectors_intro: [
      { front: '<b>Índice</b>', back: 'Posição do elemento' },
      { front: '<b>Tamanho</b>', back: 'Quantidade de elementos' },
    ],
  };
  const cards = decks[topic];
  if (!cards) return null;
  return { type: 'flashcards', title: 'Flashcards — revisão rápida', shuffle: true, cards };
}

function glossaryFor(topic) {
  const byTopic = {
    intro: [
      { term: 'Algoritmo', definition: 'Sequência finita de instruções.' },
      { term: 'Pseudocódigo', definition: 'Representação textual estruturada de um algoritmo.' },
    ],
    conditionals_basic: [
      { term: 'Booleano', definition: 'Verdadeiro/Falso, usado em decisões.' },
      { term: 'Operadores lógicos', definition: '&&, ||, !' },
    ],
    vectors_intro: [
      { term: 'Vetor', definition: 'Coleção indexada de itens do mesmo tipo.' },
      { term: 'Índice', definition: 'Posição (geralmente inicia em 0).' },
    ],
  };
  const items = byTopic[topic];
  if (!items) return null;
  return { type: 'glossary', title: 'Glossário', items };
}

function testGeneratorCodeFor(topic) {
  switch (topic) {
    case 'sequentials':
      return `# Gera casos: preco, desconto -> final\nimport random\nfor _ in range(5):\n    p = round(random.uniform(10, 500), 2)\n    d = random.choice([5, 10, 12.5, 20])\n    final = p - (p*d/100.0)\n    print(f"{p} {d} -> {final:.2f}")`;
    case 'conditionals_basic':
      return `# Gera casos: nota -> Aprovado/Reprovado\nimport random\nfor n in [6.9, 7.0, 8.5, 4.0]:\n    print(f"nota={n} -> {'Aprovado' if n>=7 else 'Reprovado'}")`;
    case 'while':
      return `# Gera sequências que terminam em 0 e soma esperada\nimport random\nfor _ in range(3):\n    seq = [random.randint(-5, 10) for __ in range(3)] + [0]\n    s = sum(x for x in seq if x!=0)\n    print(*seq, sep=' ', end=' -> ')\n    print(f"soma={s}")`;
    case 'for':
      return `# Gera n e sequência esperada 1..n\nfor n in [3,5,7]:\n    print(f"n={n} -> ", ' '.join(str(i) for i in range(1, n+1)))`;
    case 'linear_search':
      return `# Gera vetores e alvos\nimport random\narr = [3,5,7]\nfor x in [3,5,10]:\n    idx = next((i for i,v in enumerate(arr) if v==x), -1)\n    print(f"{arr}, x={x} -> {idx}")`;
    case 'vectors_ops':
      return `# Gera vetores e soma/media/extremos\narrs = [[10,20,30], [5,2,9], [-1,-5,0,2]]\nfor a in arrs:\n    s=sum(a); m=s/len(a); mx=max(a); mn=min(a)\n    print(f"{a} -> soma={s}, média={m:.2f}, maior={mx}, menor={mn}")`;
    case 'matrices_ops':
      return `# Gera 2x2 e soma por linha\nmat = [[1,2],[3,4]]\nfor i,row in enumerate(mat, start=1):\n    print(f"L{i}={sum(row)}")`;
    default:
      return `# Adapte para sua atividade: gere entradas aleatórias e imprima a saída esperada.`;
  }
}

function testGeneratorCalloutFor(topic) {
  return {
    type: 'callout',
    variant: 'info',
    title: 'Gerador de casos de teste (Python)',
    content: [{ type: 'code', code: testGeneratorCodeFor(topic), language: 'python' }],
  };
}

function exercisesChecklistFor(topic) {
  const byTopic = {
    intro: [
      'Descreva, em até 10 linhas, um algoritmo do seu dia a dia (EPS).',
      'Compare com um colega e refine etapas ambíguas.',
    ],
    sequentials: [
      'Leia dois valores e aplique dois descontos sucessivos; mostre o resultado formatado.',
      'Calcule salário líquido com descontos e mostre a memória de cálculo.',
    ],
    conditionals_basic: [
      'Classifique aluno (Aprovado/Reprovado) com base em nota mínima.',
      'Aplique uma regra de bônus para médias altas e explique a condição.',
    ],
    for: ['Imprima a sequência 1..n com separador de espaço.', 'Imprima múltiplos de 3 até n.'],
    while: [
      'Some valores lidos até digitar 0.',
      'Conte quantos valores positivos foram inseridos.',
    ],
    vectors_ops: [
      'Leia N inteiros, calcule soma, média, maior e menor.',
      'Imprima somente os valores nos índices pares.',
    ],
    linear_search: [
      'Implemente busca linear que retorna índice de x ou -1.',
      'Conte quantas comparações são feitas para cada busca.',
    ],
    matrices_ops: ['Leia 3x3 e exiba soma de cada linha.', 'Encontre o maior elemento da matriz.'],
    functions_intro: [
      'Crie funções input(), process(), output() para EPS.',
      'Implemente soma(a,b) e teste com 3 pares de valores.',
    ],
  };
  const items = byTopic[topic];
  if (!items) return null;
  return { type: 'checklist', title: 'Exercícios propostos', items };
}

const resourceFixMap = [
  {
    test: (label, url) =>
      /moodle/i.test(label) ||
      /example\./i.test(String(url || '')) ||
      /moodle\.org/i.test(String(url || '')),
    fix: () => ({ url: MOODLE_URL }),
  },
  {
    test: (label, url) =>
      /onlinegdb/i.test(label) || /onlinegdb\.com\/.{0,6}$/i.test(String(url || '')),
    fix: () => ({ url: 'https://onlinegdb.com/online_c_compiler' }),
  },
  {
    test: (label, url) => /replit/i.test(label) || /replit\.com\/.{0,6}$/i.test(String(url || '')),
    fix: () => ({ url: 'https://replit.com/languages/c' }),
  },
  {
    test: (label) => /VS\s*Code|Template\s*C/i.test(label),
    fix: () => ({ url: 'https://code.visualstudio.com/docs/languages/cpp' }),
  },
  {
    test: (label, url) =>
      /planilha/i.test(label) ||
      /docs\.google\.com\/spreadsheets\/d\/1ALGIprepTemplate/i.test(String(url || '')),
    fix: () => ({ url: '/courses/algi/matriz-laboratorio.csv' }),
  },
];

function isProbablyInvalid(url) {
  if (typeof url !== 'string' || !url.trim()) return true;
  if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) return true;
  if (/example\./i.test(url)) return true;
  return false;
}

function fixResources(resources, lessonId) {
  if (!Array.isArray(resources)) return resources;
  let changed = false;
  const fixed = resources.map((r) => {
    const label = String(r?.label || '').trim();
    const url = r?.url;
    let updated = { ...r };
    if (isProbablyInvalid(url)) {
      for (const rule of resourceFixMap) {
        if (rule.test(label, url)) {
          updated.url = rule.fix(label, url).url;
          changed = true;
          REPORT.fixedResources[lessonId] ||= [];
          REPORT.fixedResources[lessonId].push({ from: url || '', to: updated.url, label });
          break;
        }
      }
    } else {
      // Normalize Moodle domain even when already valid but generic
      if (/moodle/i.test(label) || /moodle\.org/i.test(String(url || ''))) {
        if (url !== MOODLE_URL) {
          updated.url = MOODLE_URL;
          changed = true;
          REPORT.fixedResources[lessonId] ||= [];
          REPORT.fixedResources[lessonId].push({ from: url || '', to: updated.url, label });
        }
      }
    }
    return updated;
  });
  // Ensure Moodle AVA exists at least once
  const hasMoodle = fixed.some(
    (r) =>
      /moodle/i.test(String(r?.label || '')) ||
      String(r?.url || '').includes(new URL(MOODLE_URL).hostname)
  );
  if (!hasMoodle) {
    fixed.unshift({ label: 'Moodle — AVA (Unichristus)', type: 'platform', url: MOODLE_URL });
    changed = true;
    REPORT.fixedResources[lessonId] ||= [];
    REPORT.fixedResources[lessonId].push({
      from: '(missing)',
      to: MOODLE_URL,
      label: 'Moodle — AVA (Unichristus)',
    });
  }
  return changed ? fixed : resources;
}

function hasBlock(lesson, predicate) {
  const blocks = Array.isArray(lesson.content) ? lesson.content : [];
  return blocks.some(predicate);
}

function inject(lesson, block, key) {
  lesson.content ||= [];
  lesson.content.push(block);
  REPORT.injectedBlocks[lesson.id] ||= [];
  REPORT.injectedBlocks[lesson.id].push(key);
}

function upgradeContent(lesson) {
  const id = lesson.id;
  const num = Number((id || '').split('-')[1] || 0);
  const topic = getTopic(num);
  const hasType = (t) => hasBlock(lesson, (b) => (b.type || '').toLowerCase() === t.toLowerCase());
  const hasComponent = (name) =>
    hasBlock(lesson, (b) => (b.type || '').toLowerCase() === 'component' && b.component === name);
  const injectUnique = (key, block) => {
    if (!hasBlock(lesson, (b) => JSON.stringify(b) === JSON.stringify(block))) {
      inject(lesson, block, key);
    }
  };
  const injectAtStartUnique = (key, block) => {
    const exists = hasBlock(lesson, (b) => JSON.stringify(b) === JSON.stringify(block));
    if (!exists) {
      lesson.content ||= [];
      lesson.content.unshift(block);
      REPORT.injectedBlocks[lesson.id] ||= [];
      REPORT.injectedBlocks[lesson.id].push(key + ':start');
    }
  };

  // Lesson 05: flowcharts → ResourceGallery
  if (num === 5 && !hasBlock(lesson, (b) => (b.type || '').toLowerCase() === 'resourcegallery')) {
    inject(
      lesson,
      {
        type: 'resourceGallery',
        title: 'Galeria — Fluxogramas (CC)',
        src: 'resources/algorithm-flowchart.json',
      },
      'resourceGallery'
    );
  }

  // Lesson 06: data types → Flashcards and Quiz
  if (num === 6) {
    if (!hasBlock(lesson, (b) => (b.type || '').toLowerCase() === 'flashcards')) {
      inject(
        lesson,
        {
          type: 'flashcards',
          title: 'Tipos primitivos em C',
          shuffle: true,
          cards: [
            { front: '<b>int</b>', back: 'Inteiro (ex.: -2, 0, 42).' },
            { front: '<b>float</b>', back: 'Ponto flutuante (ex.: 3.14).' },
            { front: '<b>char</b>', back: 'Caractere (ex.: \n, A, 0).' },
            { question: 'const?', answer: 'Valor constante; não pode ser modificado.' },
          ],
        },
        'flashcards'
      );
    }
    if (!hasBlock(lesson, (b) => (b.type || '').toLowerCase() === 'quiz')) {
      inject(
        lesson,
        {
          type: 'quiz',
          title: 'Mini-quiz — Tipos e variáveis',
          multiple: true,
          options: [
            { text: 'int armazena números inteiros', correct: true },
            { text: 'float armazena texto', correct: false },
            { text: 'char armazena um único caractere', correct: true },
          ],
        },
        'quiz-types'
      );
    }
  }

  // Lesson 07: operators → Quiz (precedence)
  if (
    num === 7 &&
    !hasBlock(
      lesson,
      (b) =>
        (b.type || '').toLowerCase() === 'quiz' ||
        ((b.type || '').toLowerCase() === 'component' && (b.component || '') === 'QuizBlock')
    )
  ) {
    inject(
      lesson,
      {
        type: 'quiz',
        title: 'Precedência de operadores',
        multiple: false,
        options: [
          { text: '2 + 2 * 2 = 6', correct: true },
          { text: '2 + 2 * 2 = 8', correct: false },
        ],
      },
      'quiz-precedence'
    );
  }

  // Lesson 12: conditionals → Quiz
  if (
    num === 12 &&
    !hasBlock(
      lesson,
      (b) =>
        (b.type || '').toLowerCase() === 'quiz' ||
        ((b.type || '').toLowerCase() === 'component' && (b.component || '') === 'QuizBlock')
    )
  ) {
    inject(
      lesson,
      {
        type: 'quiz',
        title: 'Condições em C (if/else)',
        multiple: false,
        options: [
          { text: 'if (x > 0) executa quando x é positivo', correct: true },
          { text: 'else if só executa junto com o if', correct: false },
        ],
      },
      'quiz-conditionals'
    );
  }

  // Lesson 17: while → Parsons
  if (
    num === 17 &&
    !hasBlock(
      lesson,
      (b) =>
        (b.type || '').toLowerCase() === 'parsons' ||
        (b.type || '').toLowerCase() === 'parsonspuzzle'
    )
  ) {
    inject(
      lesson,
      {
        type: 'parsons',
        title: 'While — somatório até zero',
        instructions: 'Reordene para somar números até digitar 0.',
        lines: [
          'int x = 0;',
          'scanf("%d", &x);',
          'while (x != 0) {',
          '  soma += x;',
          '  scanf("%d", &x);',
          '}',
          'printf("%d", soma);',
        ],
        solution: [
          'int x = 0;',
          'scanf("%d", &x);',
          'while (x != 0) {',
          '  soma += x;',
          '  scanf("%d", &x);',
          '}',
          'printf("%d", soma);',
        ],
      },
      'parsons-while'
    );
  }

  // Lesson 30: arrays → Flashcards
  if (num === 30 && !hasBlock(lesson, (b) => (b.type || '').toLowerCase() === 'flashcards')) {
    inject(
      lesson,
      {
        type: 'flashcards',
        title: 'Vetores — conceitos-chave',
        cards: [
          { front: '<b>Vetor</b>', back: 'Coleção indexada de itens do mesmo tipo.' },
          { front: '<b>Índice</b>', back: 'Posição do elemento (geralmente inicia em 0).' },
          { question: 'Tamanho do vetor?', answer: 'Quantidade fixa de elementos reservados.' },
        ],
      },
      'flashcards-arrays'
    );
  }

  // Core structure: add TabsBlock comparing pseudocódigo x C in early lessons
  if ([1, 2, 3, 4].includes(num) && !hasType('tabs')) {
    injectUnique('tabs-pseudo-c', tabsPseudoCFor(topic));
  }

  // Warm-up no topo
  const hasWarmup = hasBlock(
    lesson,
    (b) =>
      (b.type || '').toLowerCase() === 'callout' &&
      typeof b.title === 'string' &&
      /Warm-up|Check-in/i.test(b.title)
  );
  if (!hasWarmup) {
    injectAtStartUnique('callout-warmup', warmUpCalloutFor(topic));
  }

  // Sequenciais (8-11): Stepper Entrada → Processamento → Saída
  if ([8, 9, 10, 11].includes(num) && !hasType('stepper')) {
    injectUnique('stepper-eps', stepperFor('sequentials'));
  }

  // Operadores: garantir lógica visual
  if (num === 7 && !hasComponent('Md3LogicOperators')) {
    injectUnique('logic-ops', { type: 'component', component: 'Md3LogicOperators' });
  }

  // Condicionais (12-13): pequena tabela da verdade
  if ([12, 13].includes(num) && !hasType('truthTable')) {
    injectUnique('truth-table-basics', truthTableBasic());
  }

  // Pós-NP1 (15): Tabs com erros comuns
  if (num === 15 && !hasType('tabs')) {
    injectUnique('tabs-np1-review', {
      type: 'tabs',
      title: 'Erros comuns × Soluções',
      tabs: [
        {
          label: 'Erros',
          content: '<ul><li>Falta de validação</li><li>Operador incorreto</li></ul>',
        },
        { label: 'Correções', code: '// use >= ao invés de > em ...', language: 'c' },
      ],
    });
  }

  // Laços (18-21): materiais variados
  if (num === 18 && !hasType('stepper')) {
    injectUnique('stepper-for', stepperFor('for'));
  }
  if (num === 19 && !hasType('tabs')) {
    injectUnique('tabs-for-while', {
      type: 'tabs',
      title: 'for × while',
      tabs: [
        { label: 'for', code: 'for (int i=0;i<n;i++){ /* ... */ }', language: 'c' },
        { label: 'while', code: 'int i=0; while (i<n){ /* ... */ i++; }', language: 'c' },
      ],
    });
  }
  if (num === 20 && !hasType('stepper')) {
    injectUnique('stepper-do-while', stepperFor('do_while'));
  }
  if (num === 21 && !hasType('md3Flowchart')) {
    injectUnique('flowchart-nested', {
      type: 'md3Flowchart',
      title: 'Laços aninhados',
      nodes: [
        { id: 'start', label: 'Início', kind: 'start' },
        { id: 'outer', label: 'for i', kind: 'process' },
        { id: 'inner', label: 'for j', kind: 'process' },
        { id: 'end', label: 'Fim', kind: 'end' },
      ],
      connections: [
        { from: 'start', to: 'outer' },
        { from: 'outer', to: 'inner' },
        { from: 'inner', to: 'end' },
      ],
    });
  }

  // Integradores (22-24): pipeline/parsons
  if (num === 22 && !hasType('pipelineCanvas')) {
    injectUnique('pipeline-integrator', {
      type: 'pipelineCanvas',
      title: 'Mini-pipeline do exercício integrador',
      stages: [
        {
          id: 'req',
          title: 'Requisitos',
          activities: [{ id: 'a1', label: 'Ler enunciado' }],
          owners: ['Dupla'],
          checkpoints: ['Esboço'],
        },
        {
          id: 'impl',
          title: 'Implementação',
          activities: [{ id: 'a2', label: 'Codar' }],
          owners: ['Dupla'],
          checkpoints: ['Teste'],
        },
      ],
    });
  }
  if (num === 23 && !hasType('parsons') && !hasType('parsonsPuzzle')) {
    injectUnique('parsons-integrator', {
      type: 'parsons',
      title: 'Reordene o programa',
      lines: ['int main(){', '  /* ... */', '  return 0;', '}', '#include <stdio.h>'],
      solution: ['#include <stdio.h>', 'int main(){', '  /* ... */', '  return 0;', '}'],
    });
  }

  // Funções (25-28)
  if ([25, 26, 27, 28].includes(num) && !hasType('stepper')) {
    injectUnique('stepper-functions', stepperFor('functions_intro'));
  }
  if (num === 27 && !hasType('tabs')) {
    injectUnique('tabs-prototipos', {
      type: 'tabs',
      title: 'Protótipos × Implementação',
      tabs: [
        { label: 'Protótipos', code: 'int soma(int a,int b);', language: 'c' },
        { label: 'Implementação', code: 'int soma(int a,int b){ return a+b; }', language: 'c' },
      ],
    });
  }

  // Vetores/Matrizes (30-34)
  if ([31].includes(num) && !hasType('stepper')) {
    injectUnique('stepper-array-ops', stepperFor('vectors_ops'));
  }
  if (num === 32 && !hasType('tabs')) {
    injectUnique('tabs-busca-linear', tabsPseudoCFor('linear_search'));
  }
  if ([33, 34].includes(num) && !hasType('md3Table')) {
    injectUnique('md3table-demo', {
      type: 'md3Table',
      headers: ['i', 'j', 'v[i][j]'],
      rows: [
        [{ value: '0' }, { value: '0' }, { value: '1' }],
        [{ value: '0' }, { value: '1' }, { value: '2' }],
      ],
    });
  }

  // Structs (35-37)
  if (num === 35 && !hasType('tabs')) {
    injectUnique('tabs-struct-basics', {
      type: 'tabs',
      title: 'Struct — definição × uso',
      tabs: [
        {
          label: 'Definição',
          code: 'typedef struct { char nome[50]; int idade; } Pessoa;',
          language: 'c',
        },
        { label: 'Uso', code: 'Pessoa p; scanf("%s %d", p.nome, &p.idade);', language: 'c' },
      ],
    });
  }
  if (num === 36 && !hasType('stepper')) {
    injectUnique('stepper-struct-array', {
      type: 'stepper',
      title: 'Vetor de structs',
      steps: [
        { title: 'Declaração', description: 'Pessoa turma[50];' },
        { title: 'Preenchimento', description: 'for ... scanf(...)' },
        { title: 'Consulta', description: 'Buscar por matrícula' },
      ],
    });
  }
  if (num === 37 && !hasType('tabs')) {
    injectUnique('tabs-struct-update', {
      type: 'tabs',
      title: 'Atualização de registros',
      tabs: [
        { label: 'Buscar', code: 'int idx = buscaCPF(clientes, n, cpf);', language: 'c' },
        { label: 'Atualizar', code: 'clientes[idx].saldo += valor;', language: 'c' },
      ],
    });
  }

  // Revisão e fechamento (38, 40)
  if (num === 38 && !hasType('resourceGallery')) {
    injectUnique('gallery-review', {
      type: 'resourceGallery',
      title: 'Recursos de revisão (CC)',
      src: 'resources/systems-thinking.json',
    });
  }
  if (num === 40 && !hasType('resourceGallery')) {
    injectUnique('gallery-wrapup', {
      type: 'resourceGallery',
      title: 'Recursos finais (CC)',
      src: 'resources/algorithm-flowchart.json',
    });
  }

  // TED pós-aula: se não houver, insere um callout padronizado por unidade
  const hasTed = hasBlock(
    lesson,
    (b) =>
      (b.type || '').toLowerCase() === 'callout' &&
      typeof b.title === 'string' &&
      /\bTED\b/i.test(b.title)
  );
  if (!hasTed) {
    const unitTask = (() => {
      if ([1, 2, 3, 4].includes(num))
        return [
          'Descrever um problema em passos claros (pseudocódigo).',
          'Comparar com uma versão em C (mínimo 10 linhas).',
        ];
      if (num >= 8 && num <= 11)
        return [
          'Implementar um programa sequencial (entrada, processamento, saída).',
          'Enviar print de execução com caso de teste.',
        ];
      if (num >= 12 && num <= 13)
        return [
          'Criar 3 decisões (if/else) diferentes sobre um mesmo conjunto de dados.',
          'Explicar a escolha dos operadores lógicos.',
        ];
      if (num >= 17 && num <= 21)
        return [
          'Resolver 2 exercícios com laços (um com for e outro com while/do-while).',
          'Anexar comentários sobre complexidade percebida.',
        ];
      if (num >= 25 && num <= 28)
        return [
          'Refatorar exercício em funções (protótipo, parâmetros, retorno).',
          'Descrever efeito da decomposição no entendimento.',
        ];
      if (num >= 30 && num <= 37)
        return [
          'Exercício com vetores/matrizes/structs (leitura, processamento, saída).',
          'Testar com 2 casos distintos.',
        ];
      return ['Exercício breve conforme pauta da aula.', 'Registrar dúvidas no AVA.'];
    })();
    const rubric = [
      'Entrega no prazo indicado (20%).',
      'Atende integralmente ao enunciado (40%).',
      'Evidências/testes apresentados (25%).',
      'Clareza e organização (15%).',
    ];
    injectUnique('ted-callout', {
      type: 'callout',
      variant: 'task',
      title: 'TED pós-aula',
      content: [
        { type: 'paragraph', text: 'Entregar no AVA até 23h59 do dia seguinte.' },
        { type: 'list', items: unitTask },
        { type: 'paragraph', text: 'Rubrica de avaliação' },
        { type: 'list', items: rubric },
      ],
    });
  }

  // Callout acadêmico de leitura recomendada, se não houver bibliografia explícita
  const hasBibliographyBlock = hasType('bibliography') || hasType('bibliographyBlock');
  const hasAcademicCallout = hasBlock(
    lesson,
    (b) =>
      (b.type || '').toLowerCase() === 'callout' &&
      (b.variant === 'academic' || /Leitura recomendada/i.test(String(b.title || '')))
  );
  if (!hasBibliographyBlock && !hasAcademicCallout) {
    injectUnique('callout-academic', academicCalloutFor(topic));
  }

  // Casos de teste sugeridos
  const hasTestsCallout = hasBlock(
    lesson,
    (b) =>
      (b.type || '').toLowerCase() === 'callout' &&
      typeof b.title === 'string' &&
      /Casos de teste sugeridos/i.test(b.title)
  );
  if (!hasTestsCallout) {
    injectUnique('callout-tests', testCasesCalloutFor(topic));
  }

  // Gerador de casos (Python)
  const hasGen = hasBlock(
    lesson,
    (b) =>
      (b.type || '').toLowerCase() === 'callout' &&
      typeof b.title === 'string' &&
      /Gerador de casos/i.test(b.title)
  );
  const allowGen = ![14, 29, 39].includes(num);
  if (!hasGen && allowGen) {
    injectUnique('callout-test-generator', testGeneratorCalloutFor(topic));
  }

  // Boas práticas
  const hasGoodPractice = hasBlock(
    lesson,
    (b) => (b.type || '').toLowerCase() === 'callout' && b.variant === 'good-practice'
  );
  if (!hasGoodPractice) {
    injectUnique('callout-good-practice', goodPracticeCalloutFor(topic));
  }

  // Erros comuns — inject once per lesson
  const hasCommonErrors = hasBlock(
    lesson,
    (b) =>
      (b.type || '').toLowerCase() === 'callout' &&
      b.variant === 'warning' &&
      typeof b.title === 'string' &&
      /Erros comuns/i.test(b.title)
  );
  if (!hasCommonErrors) {
    injectUnique('callout-common-errors', commonErrorsCalloutFor(topic));
  }

  // Solução de referência (inserir em aulas-chave; evitar em avaliações)
  const allowSolution = ![14, 29, 39].includes(num);
  const lessonsForSolution = new Set([8, 9, 12, 18, 26, 31, 32, 34]);
  const hasSolution = hasBlock(
    lesson,
    (b) =>
      (b.type || '').toLowerCase() === 'callout' &&
      typeof b.title === 'string' &&
      /Solução de referência/i.test(b.title)
  );
  if (allowSolution && lessonsForSolution.has(num) && !hasSolution) {
    injectUnique('callout-solution-ref', solutionReferenceCallout(topic));
  }

  // Check-out ao final
  const hasCheckout = hasBlock(
    lesson,
    (b) =>
      (b.type || '').toLowerCase() === 'callout' &&
      typeof b.title === 'string' &&
      /Check-out/i.test(b.title)
  );
  if (!hasCheckout) {
    injectUnique('callout-checkout', checkOutCalloutFor(topic));
  }

  // Flashcards de revisão rápida quando houver deck para o tema
  const fc = flashcardsFor(topic);
  if (fc && !hasType('flashcards')) {
    injectUnique('flashcards-review', fc);
  }

  // Glossário em temas introdutórios
  const gl = glossaryFor(topic);
  if (gl && !hasType('glossary')) {
    injectUnique('glossary-topic', gl);
  }

  // Exercícios propostos (checklist) alinhados ao tema
  const hasChecklist = hasType('checklist');
  const ex = exercisesChecklistFor(topic);
  if (ex && !hasChecklist) {
    injectUnique('exercises-checklist', ex);
  }
}

async function main() {
  const files = (await fs.readdir(LESSONS_DIR)).filter((f) => /lesson-\d+\.json$/.test(f));
  for (const file of files) {
    const p = path.join(LESSONS_DIR, file);
    const raw = await fs.readFile(p, 'utf8');
    let lesson;
    try {
      lesson = JSON.parse(raw);
    } catch (e) {
      console.warn('[upgrade] Ignorando arquivo inválido:', file);
      continue;
    }
    const original = JSON.stringify(lesson);

    // Fix resources
    if (Array.isArray(lesson.resources)) {
      lesson.resources = fixResources(lesson.resources, lesson.id || file.replace(/\.json$/, ''));
    }

    // Inject content
    upgradeContent(lesson);

    // Normalize legacy quiz blocks to component QuizBlock to avoid validation warnings
    if (Array.isArray(lesson.content)) {
      lesson.content = lesson.content.map((block) => {
        if (block && typeof block === 'object') {
          const t = String(block.type || '').toLowerCase();
          if (t === 'quiz' || t === 'multiplechoice') {
            return { type: 'component', component: 'QuizBlock', props: { data: block } };
          }
          if (t === 'checklist') {
            const hasTitle = typeof block.title === 'string' && block.title.trim().length > 0;
            const hasItems = Array.isArray(block.items) && block.items.length > 0;
            if (!hasTitle || !hasItems) {
              const data = block.data || {};
              const title = typeof data.title === 'string' ? data.title : 'Exercícios propostos';
              const items = Array.isArray(data.items) ? data.items : [];
              return { type: 'checklist', title, items };
            }
          }
        }
        return block;
      });
    }

    // Metadata governance: owners and updatedAt
    lesson.metadata ||= {};
    const owners = Array.isArray(lesson.metadata.owners) ? lesson.metadata.owners : [];
    if (!owners.includes('Prof. Tiago Sombra')) {
      lesson.metadata.owners = [...owners, 'Prof. Tiago Sombra'];
    }
    lesson.metadata.updatedAt = new Date().toISOString();

    const updated = JSON.stringify(lesson, null, 2);
    if (updated !== original) {
      await fs.writeFile(p, updated, 'utf8');
      console.log('Atualizado:', file);
    }
  }

  const out = path.join(ROOT, 'reports', 'algi-upgrade.json');
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, JSON.stringify(REPORT, null, 2), 'utf8');
  console.log('Relatório em', path.relative(ROOT, out));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

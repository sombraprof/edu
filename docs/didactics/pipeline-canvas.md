# PipelineCanvas (MD3)

O `PipelineCanvas` organiza jornadas de produção — como o pipeline de desenvolvimento de jogos — em estágios claros, com entregas, riscos e responsáveis documentados no padrão MD3.

## API declarativa

```ts
interface PipelineActivity {
  id: string;
  label: string;
  description?: string;
  role?: string; // responsável principal
}

interface PipelineDeliverable {
  id: string;
  label: string;
  description?: string;
  evidence?: string; // link ou instrução de comprovação
}

interface PipelineRisk {
  id: string;
  label: string;
  severity?: 'low' | 'medium' | 'high';
  mitigation?: string;
}

interface PipelineStage {
  id: string;
  title: string;
  summary?: string;
  status?: 'not-started' | 'in-progress' | 'blocked' | 'done';
  owners?: string[];
  durationHours?: number;
  activities?: PipelineActivity[];
  deliverables?: PipelineDeliverable[];
  risks?: PipelineRisk[];
  checkpoints?: string[]; // micro marcos internos
}

interface PipelineMilestone {
  id: string;
  title: string;
  description?: string;
  due?: string; // ISO date
}

interface PipelineCanvasProps {
  title?: string;
  summary?: string;
  stages: PipelineStage[];
  milestones?: PipelineMilestone[];
}
```

- `status` controla a badge do estágio (Ex.: "Em andamento"), alinhada às cores tonais MD3.
- `owners` lista pessoas responsáveis; quando múltiplas, são apresentados como chips secundários.
- `deliverables` e `activities` aparecem como listas textuais; `evidence` gera uma descrição auxiliar.

## Fundamentos de design

- **Grid responsivo**: estágios são renderizados em `grid` com minmax de 18rem, adaptando-se para uma coluna em telas pequenas. 【F:src/components/lesson/PipelineCanvas.vue†L18-L132】
- **Badges de status**: cores tonais para `blocked` (erro), `in-progress` (primário), `done` (terciário) e `not-started` (outline) reforçam acompanhamento visual. 【F:src/components/lesson/PipelineCanvas.vue†L64-L104】
- **Milestones acessíveis**: listados separadamente com `aria-label` claro, exibindo datas legíveis (`due`). 【F:src/components/lesson/PipelineCanvas.vue†L134-L178】

## Testes

A suíte `PipelineCanvas.test.ts` valida:

1. Renderização dos estágios com atividades e entregáveis completos.
2. Seleção correta da badge de status.
3. Exibição dos marcos com data formatada e descrição opcional. 【F:src/components/lesson/**tests**/PipelineCanvas.test.ts†L1-L82】

## Próximos passos

1. Adicionar suporte a indicadores quantitativos (burn-down, capacidade) e integrar com dashboards de progresso.
2. Produzir presets para TDJD (pipeline de jogo) e DDM (sprints de publicação nas lojas) no Storybook.
3. Avaliar integrações com arrastar-e-soltar para priorização rápida, mantendo fallback textual para acessibilidade.

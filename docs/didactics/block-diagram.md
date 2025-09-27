# Md3BlockDiagram

O novo diagrama de blocos MD3 substitui o componente legado removido da pasta `src/components/didactics`, oferecendo um layout responsivo e centrado em acessibilidade para representar pipelines técnicos, arquiteturas de software e fluxos de dados.

## API declarativa

```ts
interface BlockDescriptor {
  id: string;
  title: string;
  summary?: string;
  layer: number; // coluna lógica usada para agrupar estágios
  row?: number; // opcional para fixar a linha quando necessário
  kind?: 'process' | 'data-store' | 'input-output' | 'external';
  badge?: string; // reforço visual curto
  metrics?: Array<{ id: string; label: string; value: string }>;
}

interface ChannelDescriptor {
  id: string;
  from: string;
  to: string;
  description?: string;
  kind?: 'data' | 'control' | 'feedback';
}

interface LegendItem {
  id: string;
  label: string;
  description?: string;
  kind?: BlockDescriptor['kind'] | ChannelDescriptor['kind'];
}

interface Md3BlockDiagramProps {
  title?: string;
  summary?: string;
  blocks: BlockDescriptor[];
  channels?: ChannelDescriptor[];
  legend?: LegendItem[];
  dense?: boolean;
}
```

- `layer` determina a coluna automática no grid; `row` pode ser usado para agrupar elementos verticalmente (caso omisso, segue a ordem natural).
- `channels` geram uma lista de ligações textuais com rótulos acessíveis (`Fluxo de X para Y`), substituindo as setas absolutas do componente antigo.
- `legend` fornece uma legenda MD3 reutilizável para reforçar os significados dos tipos de bloco e dos canais.

## Fundamentos de design

- **Layout fluido**: `grid-template-columns` usa `repeat(var(--columns), minmax(0, 1fr))`, degradando para `auto-fit` em telas menores para evitar overflow horizontal. Os espaçamentos obedecem aos tokens `--md-sys-spacing-*`.
- **Semântica MD3**: blocos são superfícies elevadas com `box-shadow` MD3; tipos específicos (`data-store`, `input-output`, `external`) recebem contêineres tonais alinhados à paleta dinâmica. 【F:src/components/lesson/Md3BlockDiagram.vue†L89-L132】
- **Acessibilidade**: cada bloco é um `article` com `aria-labelledby`/`aria-describedby`; conexões são listadas como `role="list"`, expondo descrições completas para leitores de tela. 【F:src/components/lesson/Md3BlockDiagram.vue†L12-L78】

## Testes

A suíte `Md3BlockDiagram.test.ts` cobre:

1. Ordenação por coluna/camada e renderização de métricas internas.
2. Geração das labels acessíveis para cada canal e aplicação do `data-kind`.
3. Ativação do modo compacto (`dense`) e renderização da legenda. 【F:src/components/lesson/\_\_tests\_\_/Md3BlockDiagram.test.ts†L1-L56】

## Próximos passos

1. Criar presets por disciplina (ex.: arquitetura de software, pipelines ETL, circuitos embarcados) para popular Storybook.
2. Investigar integração com renderização de setas SVG responsivas para cenários onde os vínculos visuais são indispensáveis.
3. Mapear conteúdos existentes que usavam HTML estático para diagramas e migrar para o novo schema via `blockDiagram` no `blockRegistry`. 【F:src/components/lesson/blockRegistry.ts†L1-L220】

# SystemMapper (MD3)

O `SystemMapper` representa mapas de causalidade e loops de feedback utilizados em Teoria Geral de Sistemas, reutilizando a base visual do `Md3Flowchart` com foco em narrativa textual acessível.

## API declarativa

```ts
interface SystemFactor {
  id: string;
  name: string;
  summary?: string;
  kind?: 'stock' | 'flow' | 'driver' | 'outcome' | 'constraint';
  indicators?: string[]; // métricas observáveis
}

interface SystemLoopStep {
  id: string;
  from: string;
  to: string;
  effect?: 'reinforces' | 'balances';
  description?: string;
}

interface SystemLoop {
  id: string;
  name: string;
  polarity: 'reinforcing' | 'balancing';
  summary?: string;
  steps: SystemLoopStep[];
  insights?: string[];
}

interface SystemInsight {
  id: string;
  label: string;
  description?: string;
}

interface SystemMapperProps {
  title?: string;
  summary?: string;
  factors: SystemFactor[];
  loops: SystemLoop[];
  insights?: SystemInsight[];
}
```

- `factors` descrevem estoques, fluxos e variáveis externas. O componente aplica um selo tonal por tipo (`stock`, `flow`, etc.).
- `loops` registram o sentido da alça (`reinforcing`/`balancing`) e cada ligação textual descreve o efeito esperado (`aumenta`, `reduz`).
- `insights` permitem destacar aprendizados ou ações recomendadas derivadas do mapa sistêmico.

## Fundamentos de design

- **Stacks tonais**: fatores são cartões MD3 com selo `data-kind`, adaptando cor para cada tipo de variável. 【F:src/components/lesson/SystemMapper.vue†L16-L118】
- **Loops narrativos**: cada loop é um `article` com identificador `R` ou `B`, além da lista de passos (`role="list"`). Os efeitos positivos/negativos utilizam `data-effect` para aplicar cores consistentes. 【F:src/components/lesson/SystemMapper.vue†L120-L188】
- **Insights acionáveis**: renderizados como `callout` MD3 com ícone informativo, reforçando próximos passos ou riscos monitorados. 【F:src/components/lesson/SystemMapper.vue†L190-L232】

## Testes

A suíte `SystemMapper.test.ts` contempla:

1. Renderização das variáveis com selo de tipo.
2. Descrição completa dos loops com polaridade e etapas.
3. Exibição opcional dos insights finais. 【F:src/components/lesson/**tests**/SystemMapper.test.ts†L1-L86】

## Próximos passos

1. Investigar integração com simulações simples (slider → efeito) preservando fallback textual.
2. Criar presets para estudos de caso (ex.: cadeia de suprimentos, políticas públicas de saúde).
3. Conectar o componente ao pipeline de validação para apontar loops incompletos automaticamente.

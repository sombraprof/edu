# Md3Flowchart

O componente `Md3Flowchart` inaugura a reconstrução dos materiais didáticos seguindo o Design Material 3. Ele substitui o antigo fluxo baseado na pasta `src/components/didactics`, removida nesta etapa, e estabelece a nova API que será consumida pelos blocos de aula.

## Objetivos de design

- **Acessibilidade nativa**: estrutura semântica com `<section>` e lista ordenada para leitura sequencial por leitores de tela.
- **Layout responsivo**: fluxo vertical com cartões MD3, conectores adaptáveis e variações para múltiplas bifurcações.
- **API declarativa**: nós e conexões descritos por dados serializáveis (`nodes`, `connections`), permitindo hidratação a partir dos conteúdos normalizados.

## Propriedades

| Propriedade   | Tipo               | Obrigatório | Descrição                                                                                                    |
| ------------- | ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `title`       | `string`           | Não         | Título exibido no cabeçalho do fluxograma.                                                                   |
| `summary`     | `string`           | Não         | Texto auxiliar opcional.                                                                                     |
| `nodes`       | `FlowNode[]`       | Sim         | Lista ordenada dos nós, contendo tipo, título, resumo e ramos (quando aplicável).                            |
| `connections` | `FlowConnection[]` | Não         | Define ligações customizadas entre nós; na ausência, o componente cria conexões sequenciais automaticamente. |

### Estrutura de `FlowNode`

```ts
interface FlowBranch {
  id: string;
  label: string;
  target: string;
  description?: string;
}

interface FlowNode {
  id: string;
  type: 'start' | 'process' | 'input' | 'output' | 'decision' | 'end';
  title: string;
  summary?: string;
  branches?: FlowBranch[];
}
```

### Estrutura de `FlowConnection`

```ts
interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  kind?: 'default' | 'loop' | 'fallback';
}
```

- A label padrão é derivada do título do nó alvo, exibindo "Segue para: …".
- O campo `kind` altera o styling dos conectores (ex.: `loop` em laranja terciário, `fallback` em tom secundário).

## Estilização

- Tokens MD3 (`--md-sys-*`) aplicados nos cartões, badges e conectores, com `color-mix` para gerar camadas tonais conforme o modo de cor ativo.
- Estados de foco/hover elevam o cartão com `box-shadow` e bordas tonalizadas, assegurando contraste mínimo AA.
- Bifurcações usam `grid-template-columns` automático para distribuir ramificações sim/não ou múltiplos caminhos.

## Integração

- Atualize os blocos de aula que renderizam fluxogramas para gerar dados compatíveis com `FlowNode`/`FlowConnection`.
- Use `connections` explícitas quando houver loops ou caminhos alternativos; fluxos lineares funcionam apenas com `nodes`.
- Para Storybook ou documentação, inicie com os cenários presentes em `src/components/lesson/__tests__/Md3Flowchart.test.ts`.

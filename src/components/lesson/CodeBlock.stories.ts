import type { Meta, StoryObj } from '@storybook/vue3';
import CodeBlock from './CodeBlock.vue';

const meta: Meta<typeof CodeBlock> = {
  title: 'Lesson/Blocks/CodeBlock',
  component: CodeBlock,
  args: {
    code: `function greet(name) {
  return \`Hello, \${name}\`;
}

console.log(greet('Mundo'));
`,
    language: 'javascript',
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const DefaultSpacing: Story = {
  render: (args) => ({
    components: { CodeBlock },
    setup() {
      return { args };
    },
    template: `
      <div class="lesson-block-story md-stack md-stack-6" style="max-width: 48rem; margin: 0 auto; padding: 2rem;">
        <p class="md-typescale-body-large text-[var(--md-sys-color-on-surface-variant)]">
          O componente usa o espaçamento natural do layout quando inserido em uma pilha Material Design.
        </p>
        <CodeBlock v-bind="args" />
        <p class="md-typescale-body-large text-[var(--md-sys-color-on-surface-variant)]">
          Blocos subsequentes permanecem alinhados pelo <code>gap</code> da pilha, sem margens colapsadas.
        </p>
      </div>
    `,
  }),
};

export const WithCustomSpacing: Story = {
  render: (args) => ({
    components: { CodeBlock },
    setup() {
      return { args };
    },
    template: `
      <div class="lesson-block-story md-stack md-stack-6" style="max-width: 48rem; margin: 0 auto; padding: 2rem;">
        <p class="md-typescale-body-large text-[var(--md-sys-color-on-surface-variant)]">
          Também é possível sobrescrever o token <code>--code-block-spacing</code> quando for preciso mais respiro.
        </p>
        <div style="--code-block-spacing: var(--md-sys-spacing-6);">
          <CodeBlock v-bind="args" />
        </div>
        <p class="md-typescale-body-large text-[var(--md-sys-color-on-surface-variant)]">
          O espaçamento adicional é aplicado apenas a este bloco, mantendo o restante da pilha intacto.
        </p>
      </div>
    `,
  }),
};

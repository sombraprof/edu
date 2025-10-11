import type { Meta, StoryObj } from '@storybook/vue3';
import CodePlayground from './CodePlayground.vue';

const meta: Meta<typeof CodePlayground> = {
  title: 'Lesson/Blocks/CodePlayground',
  component: CodePlayground,
  args: {
    data: {
      title: 'Explorando arrays',
      description:
        'Execute pequenos trechos de código para explicar os métodos básicos de um array.',
      language: 'javascript',
      initialCode: `const frutas = ['maçã', 'banana', 'uva'];
print('Itens:', frutas.join(', '));

frutas.push('kiwi');
print('Após push:', frutas);

const primeira = frutas.shift();
print('Removendo o primeiro item:', primeira);
print('Resultado final:', frutas);
`,
    },
  },
};

export default meta;
type Story = StoryObj<typeof CodePlayground>;

export const JavaScript: Story = {
  render: (args) => ({
    components: { CodePlayground },
    setup() {
      return { args };
    },
    template: `
      <div class="lesson-block-story" style="max-width: 60rem; margin: 0 auto; padding: 2rem;">
        <CodePlayground v-bind="args" />
      </div>
    `,
  }),
};

export const TypeScript: Story = {
  args: {
    data: {
      title: 'Tipando funções',
      description: 'Demonstração de inferência de tipos com interfaces simples.',
      language: 'typescript',
      initialCode: `interface Pessoa {
  nome: string;
  idade: number;
}

function apresentar(pessoa: Pessoa): string {
  return \`Olá, \${pessoa.nome}! Você tem \${pessoa.idade} anos.\`;
}

const convidado: Pessoa = { nome: 'Aline', idade: 27 };
print(apresentar(convidado));
`,
    },
  },
};

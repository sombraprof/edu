import type { Meta, StoryObj } from '@storybook/vue3';
import ApiEndpoints from './ApiEndpoints.vue';

const meta: Meta<typeof ApiEndpoints> = {
  title: 'Lesson/Blocks/ApiEndpoints',
  component: ApiEndpoints,
};

export default meta;
type Story = StoryObj<typeof ApiEndpoints>;

export const Basic: Story = {
  render: () => ({
    components: { ApiEndpoints },
    template: `
      <div style="max-width: 56rem; margin: 0 auto; padding: 2rem;">
        <ApiEndpoints :data="{
          title: 'API — Catálogo',
          baseUrl: 'https://api.example.com',
          endpoints: [
            { method: 'GET', path: '/products', desc: 'Lista produtos', sample: 'curl -s https://api.example.com/products' },
            { method: 'POST', path: '/orders', desc: 'Cria pedido', auth: 'Bearer', sample: 'curl -X POST -H \"Authorization: Bearer ...\" -d @order.json https://api.example.com/orders' }
          ]
        }" />
      </div>
    `,
  }),
};

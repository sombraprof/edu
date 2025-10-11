import type { Meta, StoryObj } from '@storybook/vue3';
import Stepper from './Stepper.vue';

const meta: Meta<typeof Stepper> = {
  title: 'Lesson/Blocks/Stepper',
  component: Stepper,
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Basic: Story = {
  render: () => ({
    components: { Stepper },
    template: `
      <div style="max-width: 56rem; margin: 0 auto; padding: 2rem;">
        <Stepper :data="{
          title: 'Pipeline de implementação',
          summary: 'Siga as etapas na ordem sugerida.',
          steps: [
            { title: 'Planejamento', description: 'Defina escopo e riscos.' },
            { title: 'Desenvolvimento', html: '<p>Implemente as funcionalidades centrais.</p>' },
            { title: 'Teste', code: 'npm test', language: 'bash' }
          ]
        }" />
      </div>
    `,
  }),
};

export const WithMedia: Story = {
  render: () => ({
    components: { Stepper },
    template: `
      <div style="max-width: 56rem; margin: 0 auto; padding: 2rem;">
        <Stepper :data="{
          title: 'Iteração de produto',
          summary: 'Utilize recursos visuais e vídeos para explorar cada etapa.',
          autoPlay: true,
          autoPlayDelay: 6000,
          steps: [
            {
              title: 'Descoberta',
              description: 'Colete feedback com entrevistas rápidas e pesquisas digitais.'
            },
            {
              title: 'Prototipagem',
              media: {
                src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
                alt: 'Protótipo em papel de baixa fidelidade',
                caption: 'Protótipo desenhado em papel para validação rápida.',
              }
            },
            {
              title: 'Testes com usuários',
              media: {
                type: 'video',
                url: 'https://youtu.be/9bZkp7q19f0',
                title: 'Sessão gravada com participantes',
                caption: 'Trecho com os principais aprendizados da rodada.'
              }
            },
            {
              title: 'Iteração',
              embed: '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Protótipo interativo" allowfullscreen loading="lazy"></iframe>',
              caption: 'Demonstração interativa para stakeholders.'
            }
          ]
        }" />
      </div>
    `,
  }),
};

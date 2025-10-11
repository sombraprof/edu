import type { Meta, StoryObj } from '@storybook/vue3';
import DesignEmbed from './DesignEmbed.vue';

const meta: Meta<typeof DesignEmbed> = {
  title: 'Lesson/Blocks/DesignEmbed',
  component: DesignEmbed,
};

export default meta;

type Story = StoryObj<typeof DesignEmbed>;

export const FigmaPrototype: Story = {
  render: () => ({
    components: { DesignEmbed },
    template: `
      <div style="max-width: 70rem; margin: 0 auto; padding: 2rem;">
        <DesignEmbed
          :data="{
            title: 'Fluxo de onboarding',
            description: 'Explore as telas principais e valide a narrativa de boas-vindas.',
            provider: 'figma',
            page: 'embed',
            theme: 'dark',
            url: 'https://www.figma.com/file/xyz123/Onboarding?type=design',
          }"
        />
      </div>
    `,
  }),
};

export const MiroBoard: Story = {
  render: () => ({
    components: { DesignEmbed },
    template: `
      <div style="max-width: 70rem; margin: 0 auto; padding: 2rem;">
        <DesignEmbed
          :data="{
            title: 'Mapa de jornada',
            description: 'Analise as etapas do cliente e registre oportunidades.',
            provider: 'miro',
            page: 'board',
            url: 'https://miro.com/app/board/uXproj?share_link_id=42',
            hints: [
              'Use Ctrl/Cmd + scroll para ajustar o zoom.',
              'Duplo clique nos sticky notes para editar comentários.',
            ],
          }"
        />
      </div>
    `,
  }),
};

export const FramerPresent: Story = {
  render: () => ({
    components: { DesignEmbed },
    template: `
      <div style="max-width: 70rem; margin: 0 auto; padding: 2rem;">
        <DesignEmbed
          :data="{
            title: 'Interações mobile',
            description: 'Revise microinterações navegando em modo apresentação.',
            provider: 'framer',
            page: 'present',
            url: 'https://framer.com/share/MobileFlow-abc123/',
          }"
        />
      </div>
    `,
  }),
};

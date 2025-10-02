import type { Meta, StoryObj } from '@storybook/vue3';
import ResourceGallery from './ResourceGallery.vue';

const meta: Meta<typeof ResourceGallery> = {
  title: 'Lesson/Blocks/ResourceGallery',
  component: ResourceGallery,
};

export default meta;
type Story = StoryObj<typeof ResourceGallery>;

export const WithInlineItems: Story = {
  render: () => ({
    components: { ResourceGallery },
    template: `
      <div style="max-width: 64rem; margin: 0 auto; padding: 2rem;">
        <ResourceGallery
          :data="{
            title: 'Galeria — Fluxogramas',
            description: 'Itens simulados com licenças CC.',
            items: [
              {
                type: 'image',
                title: 'Euclid algorithm flowchart',
                url: 'https://commons.wikimedia.org/wiki/File:Euclid_algorithm_flowchart_diagram_in_Breton.svg',
                thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Euclid_algorithm_flowchart_diagram_in_Breton.svg/640px-Euclid_algorithm_flowchart_diagram_in_Breton.svg.png',
                author: 'Huñvreüs',
                source: 'Wikimedia Commons',
                license: 'CC BY-SA 4.0',
                licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0'
              },
              {
                type: 'image',
                title: 'Flowchart process',
                url: 'https://commons.wikimedia.org/wiki/File:Flowchart_process.png',
                thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Flowchart_process.png',
                author: 'Bob, The Cat',
                source: 'Wikimedia Commons',
                license: 'Public domain'
              }
            ]
          }"
        />
      </div>
    `,
  }),
};

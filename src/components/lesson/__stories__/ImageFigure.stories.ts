import type { Meta, StoryObj } from '@storybook/vue3';
import ImageFigure from '../ImageFigure.vue';

const meta: Meta<typeof ImageFigure> = {
  title: 'Lesson/ImageFigure',
  component: ImageFigure,
  args: {
    src: 'https://picsum.photos/id/237/800/450',
    alt: 'Ilustração de um cão observando a paisagem',
    caption: 'Imagens podem receber <strong>legendas ricas</strong> com formatação básica.',
    credit: 'Foto por <a href="https://picsum.photos" target="_blank" rel="noreferrer">Picsum</a>.',
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof ImageFigure>;

export const SingleImage: Story = {};

export const Gallery: Story = {
  args: {
    src: undefined,
    alt: undefined,
    caption: 'Galerias utilizam o primeiro item para compor a legenda principal.',
    images: [
      {
        src: 'https://picsum.photos/id/1025/800/450',
        alt: 'Cachorro em uma praia ensolarada',
        caption: 'Primeira imagem com destaque para a paisagem costeira.',
        credit: 'Foto por Picsum.',
      },
      {
        src: 'https://picsum.photos/id/1024/800/450',
        alt: 'Cachorro sentado em um campo gramado',
        caption: 'Segundo item da galeria com vegetação e plano de fundo desfocado.',
      },
      {
        src: 'https://picsum.photos/id/1027/800/450',
        alt: 'Detalhe de um cão olhando para a câmera',
        credit: 'Cortesia Picsum.',
      },
    ],
  },
};

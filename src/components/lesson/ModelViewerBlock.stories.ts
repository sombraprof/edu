import type { Meta, StoryObj } from '@storybook/vue3';
import ModelViewerBlock from './ModelViewerBlock.vue';

const meta: Meta<typeof ModelViewerBlock> = {
  title: 'Lesson/ModelViewerBlock',
  component: ModelViewerBlock,
  args: {
    data: {
      type: 'modelViewer',
      title: 'Astronauta em órbita',
      description:
        '<p>Interaja com o traje espacial completo. Use o mouse ou toque para aproximar e inspecionar detalhes.</p>',
      src: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      poster: 'https://modelviewer.dev/assets/poster-astronaut.png',
      alt: 'Astronauta flutuando no espaço com traje completo',
      autoRotate: true,
      autoRotateDelay: 2000,
      cameraOrbit: '45deg 70deg 2.5m',
      zoom: { min: 25, max: 75, initial: 45 },
      loadingLabel: 'Carregando astronauta em 3D…',
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof ModelViewerBlock>;

export const Default: Story = {};

export const WithARSupport: Story = {
  args: {
    data: {
      type: 'modelViewer',
      title: 'Land Rover marciano',
      description:
        '<p>Ative o modo AR para posicionar o veículo em escala real no ambiente ao seu redor.</p>',
      src: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
      iosSrc: 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz',
      poster: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.webp',
      alt: 'Robô expressivo posicionado em um ambiente virtual',
      ar: true,
      arModes: ['webxr', 'scene-viewer', 'quick-look'],
      cameraOrbit: '20deg 75deg 1.8m',
      environmentImage: 'https://modelviewer.dev/shared-assets/environments/footprint_court_2k.hdr',
      loadingLabel: 'Preparando modo de realidade aumentada…',
      footnote:
        '<p>Disponível em navegadores compatíveis com WebXR, Scene Viewer (Android) e Quick Look (iOS).</p>',
    },
  },
};

export const ZoomDisabled: Story = {
  args: {
    data: {
      type: 'modelViewer',
      title: 'Museu — escultura clássica',
      description:
        '<p>Zoom foi bloqueado para preservar a composição da vitrine virtual. Rotacione para observar detalhes.</p>',
      src: 'https://modelviewer.dev/shared-assets/models/ReflectiveBall.glb',
      alt: 'Esfera reflexiva em um pedestal minimalista',
      cameraOrbit: '0deg 65deg 1.5m',
      zoom: { disable: true, initial: '35deg' },
      height: '420px',
      environmentImage: 'https://modelviewer.dev/shared-assets/environments/royal_esplanade_1k.hdr',
      loading: 'lazy',
      errorLabel: 'Não foi possível carregar a escultura virtual.',
    },
  },
};

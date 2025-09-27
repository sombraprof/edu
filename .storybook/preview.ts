import type { Preview } from '@storybook/vue3';
import '../src/assets/styles.css';
import { initMaterialTheme, setMaterialTheme } from '../src/theme/material-theme';

initMaterialTheme();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      name: 'Tema',
      description: 'Alterna entre os modos claro/escuro do Material You',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Claro' },
          { value: 'dark', title: 'Escuro' },
          { value: 'system', title: 'Sistema' },
        ],
      },
    },
  },
  decorators: [
    (story, context) => {
      const mode = context.globals.theme ?? 'light';
      setMaterialTheme(mode);
      return {
        components: { Story: story() },
        template: '<div class="storybook-wrapper"><Story /></div>',
      };
    },
  ],
};

export default preview;

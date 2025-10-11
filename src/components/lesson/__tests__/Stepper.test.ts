import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Stepper from '../Stepper.vue';

describe('Stepper', () => {
  it('renders steps and navigates', async () => {
    const wrapper = mount(Stepper, {
      props: {
        data: {
          title: 'Stepper',
          steps: [
            { title: 'Um', description: 'Primeiro' },
            { title: 'Dois', description: 'Segundo' },
          ],
        },
      },
      global: {
        stubs: {
          ImageFigure: {
            template: '<div data-test="stub-figure" v-bind="$attrs"></div>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('Stepper');
    expect(wrapper.text()).toContain('Um');
    await wrapper.find('button.md-button--filled').trigger('click');
    expect(wrapper.text()).toContain('Dois');
    expect(wrapper.find('[data-test="lesson-stepper-autoplay"]').exists()).toBe(true);
  });

  it('supports mixed media types and fallbacks', async () => {
    const wrapper = mount(Stepper, {
      props: {
        data: {
          title: 'Mídias',
          steps: [
            {
              title: 'Imagem',
              media: {
                src: 'https://example.com/fig.png',
                alt: 'Figura',
                caption: '<strong>Legenda</strong>',
              },
            },
            {
              title: 'Vídeo',
              media: {
                type: 'video',
                url: 'https://youtu.be/abc123',
                title: 'Video demo',
                caption: 'Vídeo explicativo',
              },
            },
            {
              title: 'Embed',
              embed: "<iframe src='https://example.com/embed'></iframe>",
              caption: '<em>Embed caption</em>',
            },
            {
              title: 'Fallback',
              media: { src: '' },
              caption: 'Sem mídia',
            },
          ],
        },
      },
      global: {
        stubs: {
          ImageFigure: {
            template: '<div data-test="stub-figure" v-bind="$attrs"></div>',
          },
        },
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.lesson-stepper__step-title').text()).toContain('Imagem');
    expect(wrapper.find('.lesson-stepper__indicator[data-active="true"]').text()).toContain(
      'Imagem'
    );
    expect(wrapper.find('.lesson-stepper__figure').exists()).toBe(true);

    await wrapper.find('button.md-button--filled').trigger('click');
    const iframe = wrapper.find('[data-test="lesson-stepper-video"]');
    expect(iframe.exists()).toBe(true);
    expect(iframe.attributes('src')).toBe('https://www.youtube.com/embed/abc123');

    await wrapper.find('button.md-button--filled').trigger('click');
    const embed = wrapper.find('[data-test="lesson-stepper-embed"]');
    expect(embed.exists()).toBe(true);
    expect(embed.html()).toContain('iframe');

    await wrapper.find('button.md-button--filled').trigger('click');
    expect(wrapper.find('[data-test="lesson-stepper-media-fallback"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Sem mídia');
  });

  describe('autoplay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('auto-advances when autoplay is enabled', async () => {
      const wrapper = mount(Stepper, {
        props: {
          data: {
            title: 'Stepper',
            autoPlay: true,
            autoPlayDelay: 10,
            steps: [{ title: 'Primeiro' }, { title: 'Segundo' }],
          },
        },
        global: {
          stubs: {
            ImageFigure: {
              template: '<div data-test="stub-figure" v-bind="$attrs"></div>',
            },
          },
        },
      });

      const autoplayButton = wrapper.find('[data-test="lesson-stepper-autoplay"]');
      expect(autoplayButton.exists()).toBe(true);
      expect(autoplayButton.text()).toContain('Pausar');

      await vi.advanceTimersByTimeAsync(12);
      expect(wrapper.text()).toContain('Segundo');
    });
  });
});

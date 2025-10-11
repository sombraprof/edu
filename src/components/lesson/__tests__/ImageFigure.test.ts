import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ImageFigure from '../ImageFigure.vue';

describe('ImageFigure', () => {
  it('renders caption and credit content', () => {
    const wrapper = mount(ImageFigure, {
      props: {
        src: 'https://example.com/image.png',
        alt: 'Descrição da figura',
        caption: '<em>Legenda com ênfase</em>',
        credit: '<a href="https://example.com">Crédito</a>',
      },
    });

    const caption = wrapper.find('figcaption');
    expect(caption.exists()).toBe(true);
    expect(caption.html()).toContain('<em>Legenda com ênfase</em>');

    const credit = wrapper.find('[data-test="image-figure-credit"]');
    expect(credit.exists()).toBe(true);
    expect(credit.text()).toContain('Crédito');
  });

  it('moves focus to the close button when the lightbox opens and restores afterwards', async () => {
    const wrapper = mount(ImageFigure, {
      props: {
        src: 'https://example.com/figure.png',
        alt: 'Figura de teste',
        caption: 'Legenda simples',
      },
      attachTo: document.body,
    });

    const trigger = wrapper.find('[data-test="image-figure-trigger"]');
    expect(trigger.exists()).toBe(true);

    (trigger.element as HTMLElement).focus();
    await trigger.trigger('click');
    await nextTick();

    const closeButton = document.querySelector(
      '[data-test="image-figure-close"]'
    ) as HTMLButtonElement | null;
    expect(closeButton).not.toBeNull();

    await nextTick();
    expect(document.activeElement).toBe(closeButton);

    closeButton?.click();
    await nextTick();
    await nextTick();

    expect(document.activeElement).toBe(trigger.element as HTMLElement);

    wrapper.unmount();
  });
});

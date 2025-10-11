import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DesignEmbed from '../DesignEmbed.vue';

describe('DesignEmbed', () => {
  it('renders figma prototype when URL é suportada', () => {
    const url = 'https://www.figma.com/file/abc123/Prototype?type=design';
    const wrapper = mount(DesignEmbed, {
      props: {
        data: {
          title: 'Protótipo',
          provider: 'figma',
          url,
        },
      },
    });

    const iframe = wrapper.find('iframe');
    expect(iframe.exists()).toBe(true);
    expect(iframe.attributes('src')).toBe(
      'https://www.figma.com/embed?embed_host=edu&url=' + encodeURIComponent(url) + '&theme=light'
    );
    expect(wrapper.text()).toContain('Figma');
  });

  it('exibe aviso quando domínio não está na whitelist', () => {
    const wrapper = mount(DesignEmbed, {
      props: {
        data: {
          title: 'Protótipo',
          url: 'https://example.com/design',
        },
      },
    });

    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.text()).toContain('não está na lista de provedores permitidos');
  });

  it('normaliza url de framer para modo apresentação e mostra dicas padrão', () => {
    const wrapper = mount(DesignEmbed, {
      props: {
        data: {
          title: 'Mobile interactions',
          provider: 'framer',
          page: 'present',
          url: 'https://framer.com/share/MobileFlow-xyz123/?some=param',
        },
      },
    });

    const iframe = wrapper.find('iframe');
    expect(iframe.exists()).toBe(true);
    expect(iframe.attributes('src')).toBe(
      'https://framer.com/present/MobileFlow-xyz123?some=param'
    );
    expect(wrapper.text()).toContain('Pressione “P” para ativar o modo de apresentação');
  });
});

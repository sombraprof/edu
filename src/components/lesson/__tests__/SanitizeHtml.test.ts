import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Callout from '../Callout.vue';
import ContentBlock from '../ContentBlock.vue';

function getHtml(wrapper: ReturnType<typeof mount>): string {
  return wrapper.html();
}

describe('HTML sanitisation', () => {
  it('strips unsafe markup from Callout content', () => {
    const wrapper = mount(Callout, {
      props: {
        content:
          '<p data-state="highlight">Safe</p><script>alert(1)</script><a href="https://example.com" onclick="alert(2)">Example</a>',
        variant: 'info',
      },
    });

    const html = getHtml(wrapper);

    expect(html).toContain('Safe');
    expect(html).toContain('Example');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onclick');
  });

  it('cleans nested lesson content fragments', () => {
    const wrapper = mount(ContentBlock, {
      props: {
        data: {
          title: 'Sample',
          content: [
            {
              type: 'paragraph',
              text: 'Plain paragraph <img src=x onerror="bad()">',
            },
            {
              type: 'subBlock',
              title: 'Nested',
              items: ['<span class="danger" onclick="hack()">Alert</span>'],
            },
          ],
        },
      },
    });

    const html = getHtml(wrapper);

    expect(html).toContain('Plain paragraph');
    expect(html).toContain('Alert');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('onclick');
  });
});

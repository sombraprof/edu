import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UnsupportedBlockEditor from '../UnsupportedBlockEditor.vue';

describe('UnsupportedBlockEditor', () => {
  it('emits update:block when JSON is válido', async () => {
    const wrapper = mount(UnsupportedBlockEditor, {
      props: {
        block: { type: 'customBlock', foo: 'bar' },
      },
    });

    const textarea = wrapper.find('textarea');
    const payload = JSON.stringify({ type: 'customBlock', foo: 'baz' }, null, 2);

    await textarea.setValue(payload);

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    expect(events?.[0]?.[0]).toMatchObject({ foo: 'baz' });
    expect(wrapper.find('.text-error').exists()).toBe(false);
  });

  it('exibe mensagem de erro quando o JSON é inválido', async () => {
    const wrapper = mount(UnsupportedBlockEditor, {
      props: {
        block: { type: 'customBlock', foo: 'bar' },
      },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('{ "type": "customBlock"');

    expect(wrapper.emitted('update:block')).toBeUndefined();
    expect(wrapper.find('.text-error').text()).toContain('JSON inválido');
  });
});

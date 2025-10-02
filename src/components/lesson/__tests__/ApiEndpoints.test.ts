import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApiEndpoints from '../ApiEndpoints.vue';

describe('ApiEndpoints', () => {
  it('renders endpoints list', () => {
    const wrapper = mount(ApiEndpoints, {
      props: {
        data: {
          title: 'API',
          endpoints: [
            { method: 'GET', path: '/a', desc: 'A' },
            { method: 'POST', path: '/b', desc: 'B', auth: true },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('API');
    expect(wrapper.findAll('.api-endpoints__item').length).toBe(2);
  });
});

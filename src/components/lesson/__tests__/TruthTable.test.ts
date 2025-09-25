import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TruthTable from '../TruthTable.vue';

describe('TruthTable', () => {
  it('renders table with title and headers', () => {
    const title = 'Tabela Verdade do AND';
    const headers = ['A', 'B', 'A AND B'];
    const rows = [
      [{ value: 'V' }, { value: 'V' }, { isTrue: true }],
      [{ value: 'V' }, { value: 'F' }, { isFalse: true }],
      [{ value: 'F' }, { value: 'V' }, { isFalse: true }],
      [{ value: 'F' }, { value: 'F' }, { isFalse: true }],
    ];

    const wrapper = mount(TruthTable, {
      props: { title, headers, rows },
    });

    expect(wrapper.find('h5').text()).toBe(title);
    expect(wrapper.findAll('th')).toHaveLength(3);
    expect(wrapper.findAll('tr')).toHaveLength(5); // header + 4 rows
  });

  it('renders true values with check icon', () => {
    const headers = ['Result'];
    const rows = [[{ isTrue: true }]];

    const wrapper = mount(TruthTable, {
      props: { title: 'Test', headers, rows },
    });

    const resultCell = wrapper.find('.result.true');
    expect(resultCell.exists()).toBe(true);
    const svg = resultCell.find('svg');
    expect(svg.exists()).toBe(true);
  });

  it('renders false values with X icon', () => {
    const headers = ['Result'];
    const rows = [[{ isFalse: true }]];

    const wrapper = mount(TruthTable, {
      props: { title: 'Test', headers, rows },
    });

    const resultCell = wrapper.find('.result.false');
    expect(resultCell.exists()).toBe(true);
    const svg = resultCell.find('svg');
    expect(svg.exists()).toBe(true);
  });

  it('renders regular text values', () => {
    const headers = ['Value'];
    const rows = [[{ value: 'Test Value' }]];

    const wrapper = mount(TruthTable, {
      props: { title: 'Test', headers, rows },
    });

    expect(wrapper.text()).toContain('Test Value');
  });

  it('applies MD3 styling classes', () => {
    const headers = ['A', 'B'];
    const rows = [[{ value: 'V' }, { value: 'F' }]];

    const wrapper = mount(TruthTable, {
      props: { title: 'Test', headers, rows },
    });

    expect(wrapper.classes()).toContain('card');
    expect(wrapper.find('thead').classes()).toContain('bg-surface-variant');
    expect(wrapper.find('tbody tr').classes()).toContain('border-b');
    expect(wrapper.find('tbody tr').classes()).toContain('border-outline-variant');
  });

  it('handles empty rows gracefully', () => {
    const headers = ['Empty'];
    const rows: any[] = [];

    const wrapper = mount(TruthTable, {
      props: { title: 'Test', headers, rows },
    });

    expect(wrapper.findAll('tbody tr')).toHaveLength(0);
  });
});

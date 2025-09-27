import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TruthTable from '../TruthTable.vue';

describe('TruthTable', () => {
  const baseHeaders = ['Entrada A', 'Entrada B', 'Saída'];
  const baseRows = [
    [{ value: 'Verdadeiro' }, { value: 'Verdadeiro' }, { state: 'true', display: 'Verdadeiro' }],
    [{ value: 'Verdadeiro' }, { value: 'Falso' }, { state: 'false', display: 'Falso' }],
  ];

  it('renders title, caption and headers with accessible bindings', () => {
    const wrapper = mount(TruthTable, {
      props: {
        title: 'Tabela Verdade',
        description: 'Combinações possíveis para o operador.',
        caption: 'Resultados de um operador lógico exemplo.',
        headers: baseHeaders,
        rows: baseRows,
      },
    });

    const heading = wrapper.get('[data-testid="truth-table-title"]');
    expect(heading.text()).toBe('Tabela Verdade');

    const caption = wrapper.get('caption');
    expect(caption.text()).toContain('Resultados de um operador lógico exemplo.');

    expect(wrapper.findAll('th')).toHaveLength(baseHeaders.length);
    expect(wrapper.findAll('tbody tr')).toHaveLength(baseRows.length);

    const table = wrapper.get('table');
    expect(table.attributes('aria-describedby')).toBeTruthy();
  });

  it('renders icons and state styling for truthy and falsy outputs', () => {
    const wrapper = mount(TruthTable, {
      props: {
        title: 'Estados',
        headers: ['Saída'],
        rows: [[{ state: 'true', display: 'Verdadeiro' }], [{ state: 'false', display: 'Falso' }]],
      },
    });

    const trueCell = wrapper.get('tbody tr:first-child td');
    expect(trueCell.classes()).toContain('is-true');
    expect(trueCell.find('svg').exists()).toBe(true);

    const falseCell = wrapper.get('tbody tr:last-child td');
    expect(falseCell.classes()).toContain('is-false');
    expect(falseCell.find('svg').exists()).toBe(true);
  });

  it('renders legend items with descriptive text', () => {
    const legend = [
      { label: 'Verdadeiro', state: 'true', description: 'Saída igual a 1.' },
      { label: 'Falso', state: 'false', description: 'Saída igual a 0.' },
    ];

    const wrapper = mount(TruthTable, {
      props: {
        title: 'Com legenda',
        headers: ['Valor'],
        rows: [[{ value: 'Exemplo' }]],
        legend,
      },
    });

    const legendItems = wrapper.findAll('.md3-truth-table__legend-item');
    expect(legendItems).toHaveLength(legend.length);
    expect(legendItems[0].text()).toContain('Verdadeiro');
    expect(legendItems[1].text()).toContain('Saída igual a 0.');
  });

  it('supports dense layout and custom screen reader labels', () => {
    const wrapper = mount(TruthTable, {
      props: {
        dense: true,
        headers: ['Estado'],
        rows: [[{ state: 'emphasis', srLabel: 'Valor destacado' }]],
      },
    });

    expect(wrapper.classes()).toContain('md3-truth-table--dense');
    const cell = wrapper.get('tbody td');
    expect(cell.attributes('aria-label')).toBe('Valor destacado');
  });

  it('handles empty rows gracefully', () => {
    const wrapper = mount(TruthTable, {
      props: {
        title: 'Sem dados',
        headers: ['Valor'],
        rows: [],
      },
    });

    expect(wrapper.findAll('tbody tr')).toHaveLength(0);
  });
});

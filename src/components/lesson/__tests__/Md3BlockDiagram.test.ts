import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Md3BlockDiagram from '../Md3BlockDiagram.vue';

describe('Md3BlockDiagram', () => {
  const blocks = [
    {
      id: 'ingest',
      title: 'Ingestão',
      summary: 'Recebe dados brutos.',
      layer: 0,
      kind: 'input-output' as const,
      badge: 'Entrada',
      metrics: [
        { id: 'latency', label: 'Latência', value: '20ms' },
        { id: 'volume', label: 'Volume', value: '5k req/s' },
      ],
    },
    {
      id: 'process',
      title: 'Processamento',
      summary: 'Aplica transformações e validações.',
      layer: 1,
      kind: 'process' as const,
    },
    {
      id: 'warehouse',
      title: 'Armazenamento',
      summary: 'Persiste dados confiáveis.',
      layer: 2,
      kind: 'data-store' as const,
    },
  ];

  const channels = [
    { id: 'flow-1', from: 'ingest', to: 'process', description: 'Normaliza payloads' },
    { id: 'flow-2', from: 'process', to: 'warehouse', kind: 'control' as const },
  ];

  it('renders blocks in the correct column order with metrics', () => {
    const wrapper = mount(Md3BlockDiagram, {
      props: { blocks, channels },
    });

    const renderedBlocks = wrapper.findAll('.block-diagram__block');
    expect(renderedBlocks).toHaveLength(3);
    expect(renderedBlocks[0].text()).toContain('Ingestão');
    expect(renderedBlocks[0].text()).toContain('Latência');
    expect(renderedBlocks[2].attributes()['data-kind']).toBe('data-store');
  });

  it('generates accessible channel labels describing direction', () => {
    const wrapper = mount(Md3BlockDiagram, {
      props: { blocks, channels },
    });

    const channelItems = wrapper.findAll('.block-diagram__channel');
    expect(channelItems).toHaveLength(2);
    expect(channelItems[0].text()).toContain('Ingestão → Processamento');
    expect(channelItems[1].attributes()['data-kind']).toBe('control');
  });

  it('supports optional legend entries and dense mode', () => {
    const wrapper = mount(Md3BlockDiagram, {
      props: {
        blocks,
        legend: [
          { id: 'process', label: 'Processo padrão', kind: 'process' as const },
          {
            id: 'storage',
            label: 'Persistência',
            description: 'Dados confiáveis',
            kind: 'data-store' as const,
          },
        ],
        dense: true,
      },
    });

    const legendItems = wrapper.findAll('.block-diagram__legend-item');
    expect(legendItems).toHaveLength(2);
    expect(wrapper.find('.block-diagram__grid').attributes()['data-dense']).toBe('true');
  });
});

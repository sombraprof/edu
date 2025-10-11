import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ConceptMapper from '@/components/exercise/ConceptMapper.vue';

const presetData = {
  title: 'Mapa de processos',
  nodes: [
    { id: 'input', label: 'Entrada', category: 'Fluxo', position: { x: 120, y: 140 } },
    { id: 'process', label: 'Processar', category: 'Fluxo', position: { x: 320, y: 240 } },
    { id: 'output', label: 'Saída', category: 'Resultados', position: { x: 540, y: 160 } },
  ],
  relationships: [
    { from: 'input', to: 'process', label: 'gera' },
    { from: 'process', to: 'output', label: 'produz' },
  ],
  layout: {
    type: 'preset' as const,
  },
};

describe('ConceptMapper', () => {
  it('gera snapshot com layout predefinido', () => {
    const wrapper = mount(ConceptMapper, {
      props: {
        data: presetData,
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('destaca nós e arestas ao interagir', async () => {
    const wrapper = mount(ConceptMapper, {
      props: {
        data: presetData,
      },
    });

    const processButton = wrapper.get('[data-node-id="process"]');
    await processButton.trigger('mouseenter');
    await nextTick();

    const graphProcess = wrapper.get('[data-graph-node-id="process"]');
    expect(graphProcess.classes()).toContain('concept-mapper__graph-node--active');

    const graphOutput = wrapper.get('[data-graph-node-id="output"]');
    expect(graphOutput.classes()).toContain('concept-mapper__graph-node--related');

    await processButton.trigger('mouseleave');
    await nextTick();
    expect(graphProcess.classes()).not.toContain('concept-mapper__graph-node--active');

    await processButton.trigger('click');
    await nextTick();
    expect(processButton.classes()).toContain('concept-mapper__node--active');

    const highlightedLink = wrapper.get('[data-link-id="process-output"]');
    expect(highlightedLink.classes()).toContain('concept-mapper__graph-link--active');
  });
});

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Md3Flowchart from '../Md3Flowchart.vue';

describe('Md3Flowchart', () => {
  const baseNodes = [
    { id: 'start', type: 'start' as const, title: 'Início', summary: 'Usuário inicia o processo.' },
    {
      id: 'input',
      type: 'input' as const,
      title: 'Entrada de dados',
      summary: 'Solicita o valor de A.',
    },
    {
      id: 'process',
      type: 'process' as const,
      title: 'Processamento',
      summary: 'Calcula o resultado.',
    },
    { id: 'end', type: 'end' as const, title: 'Fim', summary: 'Exibe mensagem final.' },
  ];

  it('renders nodes with implicit sequential connectors', () => {
    const wrapper = mount(Md3Flowchart, {
      props: {
        title: 'Fluxo de exemplo',
        nodes: baseNodes,
      },
    });

    const items = wrapper.findAll('.flowchart__item');
    expect(items).toHaveLength(4);
    expect(wrapper.text()).toContain('Fluxo de exemplo');

    const connectors = wrapper.findAll('.flowchart__connector');
    expect(connectors).toHaveLength(3);
    expect(connectors[0].find('.flowchart__connector-label').text()).toContain('Entrada de dados');
  });

  it('renders decision branches with accessible labels', () => {
    const nodes = [
      baseNodes[0],
      {
        id: 'decision',
        type: 'decision' as const,
        title: 'Valor é maior que 10?',
        summary: 'Verifica se o valor digitado atende ao limite.',
        branches: [
          {
            id: 'branch-yes',
            label: 'Sim',
            target: 'process',
            description: 'Siga para o cálculo.',
          },
          { id: 'branch-no', label: 'Não', target: 'end', description: 'Encerra o fluxo.' },
        ],
      },
      baseNodes[2],
      baseNodes[3],
    ];

    const wrapper = mount(Md3Flowchart, {
      props: { nodes },
    });

    const branches = wrapper.findAll('.flowchart__branch');
    expect(branches).toHaveLength(2);
    expect(branches[0].text()).toContain('Sim');
    expect(branches[1].text()).toContain('Encerra o fluxo.');
  });

  it('uses custom connections when provided', () => {
    const nodes = [baseNodes[0], baseNodes[1], baseNodes[2], baseNodes[3]];
    const connections = [
      { from: 'start', to: 'input', label: 'Captura A', kind: 'default' as const },
      { from: 'input', to: 'process', label: 'Valida', kind: 'loop' as const },
      { from: 'process', to: 'input', label: 'Solicita novamente', kind: 'loop' as const },
      { from: 'process', to: 'end', label: 'Finaliza', kind: 'fallback' as const },
    ];

    const wrapper = mount(Md3Flowchart, {
      props: {
        nodes,
        connections,
      },
    });

    const renderedConnections = wrapper.findAll('.flowchart__connector');
    expect(renderedConnections).toHaveLength(4);
    expect(renderedConnections[1].attributes()['data-kind']).toBe('loop');
    expect(renderedConnections[2].find('.flowchart__connector-label').text()).toBe(
      'Solicita novamente'
    );
  });
});

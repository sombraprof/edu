import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PipelineCanvas from '../PipelineCanvas.vue';

describe('PipelineCanvas', () => {
  const stages = [
    {
      id: 'ideation',
      title: 'Ideação',
      summary: 'Explorar referências e hipóteses de gameplay.',
      status: 'in-progress' as const,
      owners: ['Game Designer', 'Produtor'],
      durationHours: 12,
      activities: [
        { id: 'research', label: 'Pesquisa de referências', role: 'Game Designer' },
        {
          id: 'pitch',
          label: 'Construir pitch de 1 página',
          description: 'Narrativa + loop central',
        },
      ],
      deliverables: [{ id: 'pitch', label: 'Pitch deck', evidence: 'Apresentação no FigJam' }],
      risks: [
        {
          id: 'scope',
          label: 'Escopo muito amplo',
          severity: 'high' as const,
          mitigation: 'Definir critérios de corte',
        },
      ],
      checkpoints: ['Pitch aprovado', 'Personas validadas'],
    },
  ];

  const milestones = [
    {
      id: 'greenlight',
      title: 'Greenlight da produção',
      description: 'Comitê avalia escopo e orçamento.',
      due: '2024-08-15',
    },
  ];

  it('renders stages with activities, deliverables and risks', () => {
    const wrapper = mount(PipelineCanvas, { props: { stages } });

    expect(wrapper.find('.pipeline-canvas__stage-title').text()).toBe('Ideação');
    expect(wrapper.findAll('.pipeline-canvas__item')).toHaveLength(4);
    expect(wrapper.find('.pipeline-canvas__status').text()).toBe('Em andamento');
    expect(wrapper.find('.pipeline-canvas__risk').text()).toContain('Alto');
  });

  it('formats metadata such as owners, duration and checkpoints', () => {
    const wrapper = mount(PipelineCanvas, { props: { stages } });

    expect(wrapper.find('.pipeline-canvas__duration').text()).toContain('12 h');
    const owners = wrapper.findAll('.pipeline-canvas__owner');
    expect(owners).toHaveLength(2);
    expect(wrapper.find('.pipeline-canvas__chip').text()).toBe('Pitch aprovado');
  });

  it('displays milestones with formatted dates', () => {
    const wrapper = mount(PipelineCanvas, { props: { stages, milestones } });

    const milestone = wrapper.find('.pipeline-canvas__milestone');
    expect(milestone.text()).toContain('Greenlight da produção');
    expect(milestone.text()).toMatch(/15.*ago/i);
  });
});

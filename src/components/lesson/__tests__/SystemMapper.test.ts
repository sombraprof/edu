import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SystemMapper from '../SystemMapper.vue';

describe('SystemMapper', () => {
  const factors = [
    {
      id: 'players',
      name: 'Base de jogadores',
      kind: 'stock' as const,
      summary: 'Quantidade ativa semanalmente.',
      indicators: ['MAU', 'Retenção D7'],
    },
    {
      id: 'marketing',
      name: 'Investimento em marketing',
      kind: 'driver' as const,
    },
  ];

  const loops = [
    {
      id: 'growth-loop',
      name: 'Loop de crescimento viral',
      polarity: 'reinforcing' as const,
      summary: 'Quanto mais jogadoras, maior boca a boca e aquisição.',
      steps: [
        { id: 'step-1', from: 'Marketing', to: 'Base de jogadores', effect: 'reinforces' as const },
        {
          id: 'step-2',
          from: 'Base de jogadores',
          to: 'Indicadores sociais',
          effect: 'reinforces' as const,
        },
        {
          id: 'step-3',
          from: 'Indicadores sociais',
          to: 'Base de jogadores',
          description: 'Compartilhamentos ampliam alcance orgânico.',
        },
      ],
      insights: ['Monitorar CAC semanalmente'],
    },
  ];

  const insights = [
    {
      id: 'action-1',
      label: 'Ativar programa de indicações',
      description: 'Aumentar recompensas para convites.',
    },
  ];

  it('renders factors with kind labels and indicators', () => {
    const wrapper = mount(SystemMapper, { props: { factors, loops: [], insights: [] } });

    const factorCards = wrapper.findAll('.system-mapper__factor');
    expect(factorCards).toHaveLength(2);
    expect(factorCards[0].text()).toContain('Estoque');
    expect(wrapper.find('.system-mapper__indicator').text()).toContain('MAU');
  });

  it('describes loops with polarity badges and steps', () => {
    const wrapper = mount(SystemMapper, { props: { factors, loops, insights: [] } });

    const loop = wrapper.find('.system-mapper__loop');
    expect(loop.find('.system-mapper__loop-badge').text()).toBe('R');
    const steps = wrapper.findAll('.system-mapper__step');
    expect(steps).toHaveLength(3);
    expect(steps[0].text()).toContain('Marketing → Base de jogadores');
    expect(steps[0].text()).toContain('Reforça');
  });

  it('shows global insights when provided', () => {
    const wrapper = mount(SystemMapper, { props: { factors, loops, insights } });

    expect(wrapper.find('.system-mapper__insight-title').text()).toContain(
      'Ativar programa de indicações'
    );
    expect(wrapper.find('.system-mapper__insight-description').text()).toContain(
      'Aumentar recompensas'
    );
  });
});

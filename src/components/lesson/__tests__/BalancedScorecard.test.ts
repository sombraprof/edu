import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BalancedScorecard from '../BalancedScorecard.vue';

describe('BalancedScorecard', () => {
  const perspectives = [
    {
      id: 'finance',
      title: 'Financeira',
      summary: 'ROI, funding e eficiência.',
      tone: 'primary' as const,
      badge: 'Financeira',
    },
    {
      id: 'learning',
      title: 'Aprendizado',
      summary: 'Capacitação e cultura.',
      tone: 'success' as const,
      badge: 'Aprendizado',
    },
  ];

  const objectives = [
    {
      id: 'reduce-cost',
      perspectiveId: 'finance',
      title: 'Reduzir custo unitário',
      summary: 'Revisar contratos e ampliar automações.',
      owner: 'Diretoria de TI',
      indicatorIds: ['cost-per-transaction'],
      initiatives: ['Renegociar contratos', 'Escalar automações'],
    },
    {
      id: 'scale-analytics',
      perspectiveId: 'learning',
      title: 'Escalar analytics',
      summary: 'Capacitar squads com trilhas de dados.',
      owner: 'CoE Analytics',
    },
  ];

  const indicators = [
    {
      id: 'cost-per-transaction',
      objectiveId: 'reduce-cost',
      title: 'Custo por transação',
      target: '-10%',
      current: '-4%',
      frequency: 'Mensal',
      owner: 'Controladoria',
      status: 'at-risk' as const,
    },
    {
      id: 'analytics-coverage',
      objectiveId: 'scale-analytics',
      title: 'Squads com analista',
      target: '80%',
      current: '62%',
      frequency: 'Trimestral',
      owner: 'RH Tech',
      status: 'on-track' as const,
    },
    {
      id: 'savings',
      perspectiveId: 'finance',
      title: 'Economia anual recorrente',
      target: 'R$ 4,5 mi',
      current: 'R$ 3,1 mi',
      frequency: 'Trimestral',
      owner: 'Finance Business Partner',
      status: 'on-track' as const,
    },
  ];

  it('groups objectives and renders initiatives under each perspective', () => {
    const wrapper = mount(BalancedScorecard, {
      props: { perspectives, objectives, indicators },
    });

    const perspectiveSections = wrapper.findAll('.balanced-scorecard__perspective');
    expect(perspectiveSections).toHaveLength(2);
    expect(perspectiveSections[0].text()).toContain('Financeira');
    expect(perspectiveSections[0].text()).toContain('Renegociar contratos');
    expect(perspectiveSections[1].text()).toContain('Escalar analytics');
  });

  it('shows indicator metrics with status labels', () => {
    const wrapper = mount(BalancedScorecard, {
      props: { perspectives, objectives, indicators },
    });

    const indicatorCards = wrapper.findAll('.balanced-scorecard__indicator');
    expect(indicatorCards).toHaveLength(3);
    const riskIndicator = indicatorCards.find((card) =>
      card.text().includes('Custo por transação')
    );
    expect(riskIndicator).toBeTruthy();
    expect(riskIndicator?.text()).toContain('Atenção');
    expect(riskIndicator?.text()).toContain('Mensal');
  });

  it('renders perspective-level indicators without objective mapping', () => {
    const wrapper = mount(BalancedScorecard, {
      props: { perspectives, objectives, indicators },
    });

    const standalone = wrapper
      .findAll('.balanced-scorecard__indicator')
      .find((card) => card.text().includes('Economia anual recorrente'));
    expect(standalone).toBeTruthy();
    expect(standalone?.text()).toContain('R$ 3,1 mi');
  });
});

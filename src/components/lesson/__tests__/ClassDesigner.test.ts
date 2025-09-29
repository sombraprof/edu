import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ClassDesigner from '../ClassDesigner.vue';

describe('ClassDesigner', () => {
  const classes = [
    {
      id: 'order-service',
      name: 'OrderService',
      stereotype: 'service',
      type: 'class' as const,
      summary: 'Orquestra validação e envio de pedidos.',
      attributes: [
        { id: 'repo', signature: 'repo: OrderRepository', visibility: 'private' as const },
        { id: 'queue', signature: 'queue: MessageQueue', note: 'Injetada via construtor' },
      ],
      methods: [
        {
          id: 'place',
          signature: '+ place(order: Order): Confirmation',
          note: 'Aplica regras de negócio',
        },
        { id: 'retry', signature: '# retry(orderId: string): void' },
      ],
      responsibilities: ['Validar dados de entrada', 'Publicar eventos para o billing'],
      notes: ['Seguir princípios de idempotência'],
    },
  ];

  const relationships = [
    {
      id: 'repo-association',
      from: 'OrderService',
      to: 'OrderRepository',
      type: 'aggregation' as const,
      description: 'Depende da implementação para persistir pedidos',
      toMultiplicity: '1',
    },
    {
      id: 'service-interface',
      from: 'CheckoutService',
      to: 'OrderService',
      type: 'dependency' as const,
      description: 'Invoca durante o fluxo de checkout',
    },
  ];

  it('renders classes with attributes, methods and responsibilities', () => {
    const wrapper = mount(ClassDesigner, { props: { classes } });

    expect(wrapper.find('.class-designer__class-name').text()).toBe('OrderService');
    const attributes = wrapper.findAll('.class-designer__member');
    expect(attributes[0].text()).toContain('-');
    expect(attributes[0].text()).toContain('repo: OrderRepository');
    expect(wrapper.find('.class-designer__responsibility').text()).toContain(
      'Validar dados de entrada'
    );
  });

  it('converts visibility into UML symbols and renders notes', () => {
    const wrapper = mount(ClassDesigner, { props: { classes } });

    const visibilityBadges = wrapper.findAll('.class-designer__member-visibility');
    expect(visibilityBadges[0].text()).toBe('-');
    expect(visibilityBadges[1].text()).toBe('+');
    expect(wrapper.find('.class-designer__member-note').text()).toContain(
      'Injetada via construtor'
    );
  });

  it('displays relationships with multiplicity and legend entries', () => {
    const legend = [
      {
        id: 'aggregation',
        label: 'Agregação',
        description: 'Ciclo de vida independente',
        kind: 'aggregation' as const,
      },
    ];
    const wrapper = mount(ClassDesigner, {
      props: { classes, relationships, legend },
    });

    const relationshipItems = wrapper.findAll('.class-designer__relationship');
    expect(relationshipItems).toHaveLength(2);
    expect(relationshipItems[0].text()).toContain('OrderRepository [1]');
    expect(relationshipItems[0].text()).toContain('Agregação');
    expect(wrapper.find('.class-designer__legend-item').text()).toContain('Agregação');
  });
});

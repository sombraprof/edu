import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DualAssessment from '../DualAssessment.vue';

const minimalData = {
  title: 'Sprint de revisão',
  summary: 'Revise conceitos rápidos e aplique em um desafio guiado.',
  theory: {
    title: 'Conceitos de arrays',
    prompt: 'Qual operação preserva a imutabilidade do array original?',
    options: [
      { id: 'map', text: 'map' },
      { id: 'push', text: 'push' },
    ],
    explanation: 'map retorna um novo array, preservando o original.',
  },
  practice: {
    title: 'Manipulação de listas',
    prompt: 'Implemente uma função que some apenas números positivos de um array.',
    language: 'TypeScript',
    tips: ['Lembre-se de filtrar valores negativos antes de reduzir.'],
    tests: [
      {
        name: 'Soma somente positivos',
        input: '[3, -2, 5] => 8',
        expectedOutput: '8',
      },
    ],
  },
};

describe('DualAssessment', () => {
  it('renders theory and practice sections with interactive behavior', async () => {
    const wrapper = mount(DualAssessment, {
      props: { data: minimalData },
    });

    const theorySection = wrapper.find('section[aria-labelledby="theory-heading"]');
    const practiceSection = wrapper.find('section[aria-labelledby="practice-heading"]');

    expect(theorySection.exists()).toBe(true);
    expect(practiceSection.exists()).toBe(true);

    const options = theorySection.findAll('input[type="radio"]');
    expect(options).toHaveLength(2);

    await options[0].setValue();

    expect(wrapper.text()).toContain('map retorna um novo array');

    const textarea = practiceSection.find('textarea');
    expect(textarea.exists()).toBe(true);

    await textarea.setValue('return numbers.filter(n => n > 0).reduce((acc, n) => acc + n, 0);');
    expect((textarea.element as HTMLTextAreaElement).value).toContain('filter');

    expect(practiceSection.text()).toContain('Lembre-se de filtrar valores negativos');
    expect(practiceSection.text()).toContain('Soma somente positivos');
  });
});

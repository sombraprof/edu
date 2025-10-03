import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DefinitionCard from '../DefinitionCard.vue';
import ComparativeTable from '../ComparativeTable.vue';
import SystemDiagram from '../SystemDiagram.vue';
import CodeChallenge from '../CodeChallenge.vue';
import MemoryVisualizer from '../MemoryVisualizer.vue';
import CaseStudy from '../CaseStudy.vue';
import StatCard from '../StatCard.vue';
import KnowledgeCheck from '../KnowledgeCheck.vue';
import InteractiveDemo from '../InteractiveDemo.vue';
import PedagogicalNote from '../PedagogicalNote.vue';

beforeEach(() => {
  window.localStorage.clear();
});

describe('New lesson content blocks', () => {
  it('renders DefinitionCard with term and definition', () => {
    const wrapper = mount(DefinitionCard, {
      props: { data: { term: 'Stack', definition: 'Estrutura LIFO', source: 'Cormen' } },
    });

    expect(wrapper.text()).toContain('Stack');
    expect(wrapper.text()).toContain('Estrutura LIFO');
    expect(wrapper.text()).toContain('Cormen');
  });

  it('renders ComparativeTable rows', () => {
    const wrapper = mount(ComparativeTable, {
      props: {
        data: {
          headers: ['For', 'While'],
          rows: [
            { label: 'Controle', values: ['Condicional', 'Condicional'] },
            { label: 'Uso', values: ['Quando iterações conhecidas', 'Quando condição aberta'] },
          ],
        },
      },
    });

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    expect(wrapper.text()).toContain('Controle');
  });

  it('renders SystemDiagram with nodes and connections', () => {
    const wrapper = mount(SystemDiagram, {
      props: {
        data: {
          nodes: [
            { id: 'api', label: 'API' },
            { id: 'db', label: 'Banco' },
          ],
          connections: [{ from: 'api', to: 'db', label: 'Persistência' }],
        },
      },
    });

    expect(wrapper.text()).toContain('API');
    expect(wrapper.text()).toContain('Persistência');
  });

  it('shows CodeChallenge options and explanation after selection', async () => {
    const wrapper = mount(CodeChallenge, {
      props: {
        data: {
          prompt: 'Qual saída?',
          question: 'Resultado de 1 + 1',
          options: [
            { id: 'a', text: '1' },
            { id: 'b', text: '2' },
          ],
          answerExplanation: 'A soma correta é 2.',
        },
      },
    });

    await wrapper.find('input[type="radio"]').setValue();
    expect(wrapper.text()).toContain('A soma correta é 2.');
  });

  it('renders MemoryVisualizer with stack and heap placeholders', () => {
    const wrapper = mount(MemoryVisualizer, {
      props: {
        data: {
          stack: [
            { label: 'main()', value: 'ret addr' },
            { label: 'sum(a, b)', value: 'a=2, b=3' },
          ],
          heap: [{ label: 'buffer', value: '0x01ff' }],
        },
      },
    });

    expect(wrapper.text()).toContain('main()');
    expect(wrapper.text()).toContain('0x01ff');
  });

  it('renders CaseStudy with scenario and questions', () => {
    const wrapper = mount(CaseStudy, {
      props: {
        data: {
          scenario: 'Empresa SaaS com churn alto',
          questions: ['Quais métricas acompanhar?'],
        },
      },
    });

    expect(wrapper.text()).toContain('Empresa SaaS com churn alto');
    expect(wrapper.text()).toContain('Quais métricas acompanhar?');
  });

  it('renders StatCard with trend icon', () => {
    const wrapper = mount(StatCard, {
      props: {
        data: { label: 'NPS', value: '78', trend: 'up', context: '+5pp vs trimestre anterior' },
      },
    });

    expect(wrapper.text()).toContain('NPS');
    expect(wrapper.text()).toContain('78');
  });

  it('renders KnowledgeCheck options', () => {
    const wrapper = mount(KnowledgeCheck, {
      props: {
        data: {
          prompt: 'Selecione conceitos OO',
          options: [
            { id: 'enc', text: 'Encapsulamento' },
            { id: 'db', text: 'Banco de dados' },
          ],
          explanation: 'Encapsulamento, herança e polimorfismo são pilares.',
        },
      },
    });

    expect(wrapper.findAll('input').length).toBe(2);
  });

  it('renders InteractiveDemo iframe when URL is valid', () => {
    const wrapper = mount(InteractiveDemo, {
      props: {
        data: {
          url: 'https://example.com/demo',
          title: 'Protótipo',
        },
      },
    });

    const iframe = wrapper.find('iframe');
    expect(iframe.exists()).toBe(true);
    expect(iframe.attributes('src')).toBe('https://example.com/demo');
  });

  it('renders PedagogicalNote when teacher mode is enabled', () => {
    window.localStorage.setItem('teacherMode', 'true');
    const wrapper = mount(PedagogicalNote, {
      props: {
        data: {
          content: 'Lembrete de alinhamento com a coordenação.',
          title: 'Orientação interna',
        },
      },
    });

    expect(wrapper.text()).toContain('Orientação interna');
    expect(wrapper.text()).toContain('Lembrete de alinhamento');
  });
});

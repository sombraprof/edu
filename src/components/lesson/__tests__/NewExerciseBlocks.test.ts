import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CodeSubmission from '@/components/exercise/CodeSubmission.vue';
import DragAndDrop from '@/components/exercise/DragAndDrop.vue';
import ConceptMapper from '@/components/exercise/ConceptMapper.vue';
import BugFixChallenge from '@/components/exercise/BugFixChallenge.vue';
import DataEntryForm from '@/components/exercise/DataEntryForm.vue';
import ScenarioBuilder from '@/components/exercise/ScenarioBuilder.vue';
import PeerReviewTask from '@/components/exercise/PeerReviewTask.vue';
import TestGenerator from '@/components/exercise/TestGenerator.vue';
import RubricDisplay from '@/components/exercise/RubricDisplay.vue';
import SelfAssessment from '@/components/exercise/SelfAssessment.vue';

describe('New exercise blocks', () => {
  it('renders CodeSubmission with boilerplate', () => {
    const wrapper = mount(CodeSubmission, {
      props: {
        data: {
          prompt: 'Implemente a função soma',
          boilerplate: 'int soma(int a, int b) {\n  return 0;\n}',
          language: 'c',
        },
      },
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.element.value).toContain('int soma');
  });

  it('renders DragAndDrop with sortable items', () => {
    const wrapper = mount(DragAndDrop, {
      props: {
        data: {
          title: 'Ordene o algoritmo',
          steps: [
            { id: '1', label: 'Inicializar' },
            { id: '2', label: 'Processar' },
            { id: '3', label: 'Encerrar' },
          ],
        },
      },
    });

    expect(wrapper.findAll('.drag-drop__item')).toHaveLength(3);
  });

  it('renders ConceptMapper grouping nodes por categoria', () => {
    const wrapper = mount(ConceptMapper, {
      props: {
        data: {
          title: 'Mapeie conceitos',
          nodes: [
            { id: '1', label: 'Entrada', category: 'E-P-S' },
            { id: '2', label: 'Processamento', category: 'E-P-S' },
            { id: '3', label: 'Indicador', category: 'Métricas' },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('E-P-S');
    expect(wrapper.text()).toContain('Indicador');
  });

  it('renders BugFixChallenge with code snippet', () => {
    const wrapper = mount(BugFixChallenge, {
      props: {
        data: {
          code: 'printf("Hello");',
          language: 'c',
          guidance: ['Revise parênteses'],
        },
      },
    });

    expect(wrapper.text()).toContain('Hello');
    expect(wrapper.text()).toContain('Revise parênteses');
  });

  it('validates DataEntryForm required fields', async () => {
    const wrapper = mount(DataEntryForm, {
      props: {
        data: {
          title: 'Cadastro',
          fields: [
            { id: 'nome', label: 'Nome', required: true },
            { id: 'email', label: 'E-mail', type: 'email' },
          ],
        },
      },
    });

    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain('Campo obrigatório');
  });

  it('renders ScenarioBuilder columns', () => {
    const wrapper = mount(ScenarioBuilder, {
      props: {
        data: {
          inputs: ['Dados brutos'],
          processes: ['Limpeza'],
          outputs: ['Dashboard'],
        },
      },
    });

    expect(wrapper.text()).toContain('Dados brutos');
    expect(wrapper.text()).toContain('Dashboard');
  });

  it('renders PeerReviewTask with criteria and steps', () => {
    const wrapper = mount(PeerReviewTask, {
      props: {
        data: {
          criteria: [
            { id: 'clarity', label: 'Clareza' },
            { id: 'depth', label: 'Profundidade' },
          ],
          steps: ['Ler trabalho do colega', 'Enviar feedback'],
        },
      },
    });

    expect(wrapper.text()).toContain('Clareza');
    expect(wrapper.text()).toContain('Enviar feedback');
  });

  it('generates output in TestGenerator', async () => {
    const wrapper = mount(TestGenerator, {
      props: {
        data: {
          tags: ['variaveis', 'loops'],
        },
      },
    });

    await wrapper.find('button').trigger('click');
    expect(wrapper.text()).toContain('Gerar 5 questões');
  });

  it('renders RubricDisplay com níveis', () => {
    const wrapper = mount(RubricDisplay, {
      props: {
        data: {
          criteria: [
            {
              criterion: 'Análise',
              levels: [
                { level: 'Excelente', description: 'Explora causas e efeitos.' },
                { level: 'Suficiente', description: 'Identifica fatores principais.' },
              ],
            },
          ],
        },
      },
    });

    expect(wrapper.text()).toContain('Excelente');
    expect(wrapper.text()).toContain('Explora causas');
  });

  it('renders SelfAssessment prompts', () => {
    const wrapper = mount(SelfAssessment, {
      props: {
        data: {
          prompts: [
            { id: 'p1', label: 'O que aprendi hoje?' },
            { id: 'p2', label: 'Quais dúvidas permanecem?' },
          ],
        },
      },
    });

    expect(wrapper.findAll('textarea')).toHaveLength(2);
    expect(wrapper.text()).toContain('O que aprendi hoje?');
  });
});

import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import QuizBlockEditor from '../QuizBlockEditor.vue';
import ResourceGalleryEditor from '../ResourceGalleryEditor.vue';
import TabsBlockEditor from '../TabsBlockEditor.vue';
import RoadmapEditor from '../RoadmapEditor.vue';
import KnowledgeCheckEditor from '../KnowledgeCheckEditor.vue';

const Md3ButtonStub = {
  template:
    '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot name="leading" /><slot /></button>',
};

const stubs = {
  Md3Button: Md3ButtonStub,
  Plus: { template: '<span />' },
  Trash2: { template: '<span />' },
};

describe('Lesson block dedicated editors', () => {
  it('emits update:block when quiz question is alterada', async () => {
    const wrapper = mount(QuizBlockEditor, {
      props: {
        block: {
          type: 'quiz',
          title: 'Revisão',
          question: 'Pergunta original',
          options: [
            { id: 'a', text: 'Opção A', correct: true },
            { id: 'b', text: 'Opção B', correct: false },
          ],
          allowRetry: true,
          feedback: { correct: '', incorrect: '' },
        },
      },
      global: { stubs },
    });

    const [questionField] = wrapper.findAll('textarea');
    await questionField.setValue('Qual é a capital do Brasil?');

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({ question: 'Qual é a capital do Brasil?' });
    expect(Array.isArray(payload?.options)).toBe(true);
    expect((payload?.options as unknown[]).length).toBe(2);
  });

  it('emits update:block quando a galeria recebe novo título e tipo', async () => {
    const wrapper = mount(ResourceGalleryEditor, {
      props: {
        block: {
          type: 'resourceGallery',
          title: 'Recursos',
          description: '',
          items: [{ id: 'item-1', type: 'article', title: 'Guia', url: 'https://example.com' }],
        },
      },
      global: { stubs },
    });

    const titleInput = wrapper.find('input[type="text"]');
    await titleInput.setValue('Materiais de apoio');

    const typeSelect = wrapper.find('select');
    await typeSelect.setValue('video');

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({ title: 'Materiais de apoio' });
    const items = payload?.items as Array<Record<string, unknown>>;
    expect(items?.[0]?.type).toBe('video');
  });

  it('emits update:block ao editar conteúdo de abas', async () => {
    const wrapper = mount(TabsBlockEditor, {
      props: {
        block: {
          type: 'tabs',
          title: 'Aba original',
          tabs: [{ id: 'tab-1', label: 'Introdução', content: 'Conteúdo inicial' }],
        },
      },
      global: { stubs },
    });

    const textInputs = wrapper.findAll('input[type="text"]');
    await textInputs[1].setValue('Contexto');

    const contentArea = wrapper.find('textarea');
    await contentArea.setValue('Descrição atualizada');

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({ title: 'Aba original' });
    const tabs = payload?.tabs as Array<Record<string, unknown>>;
    expect(tabs?.[0]).toMatchObject({ label: 'Contexto', content: 'Descrição atualizada' });
  });

  it('emits update:block ao ajustar passos do roadmap', async () => {
    const wrapper = mount(RoadmapEditor, {
      props: {
        block: {
          type: 'roadmap',
          steps: [
            { title: 'Explorar', description: 'Analise o problema' },
            { title: 'Construir', description: 'Implemente a solução' },
          ],
        },
      },
      global: { stubs },
    });

    const firstInput = wrapper.find('input[type="text"]');
    await firstInput.setValue('Diagnosticar');

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const steps = payload?.steps as Array<Record<string, unknown>>;
    expect(steps?.[0]).toMatchObject({ title: 'Diagnosticar' });
  });

  it('emits update:block ao configurar checagem de conhecimento', async () => {
    const wrapper = mount(KnowledgeCheckEditor, {
      props: {
        block: {
          type: 'knowledgeCheck',
          prompt: 'Selecione os pilares da OO',
          options: [
            { id: 'op1', text: 'Encapsulamento' },
            { id: 'op2', text: 'Banco de dados' },
          ],
        },
      },
      global: { stubs },
    });

    const explanationField = wrapper.findAll('textarea')[1];
    await explanationField.setValue('Encapsulamento, herança e polimorfismo.');

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({ explanation: 'Encapsulamento, herança e polimorfismo.' });
    const options = payload?.options as Array<Record<string, unknown>>;
    expect(options?.length).toBe(2);
  });
});

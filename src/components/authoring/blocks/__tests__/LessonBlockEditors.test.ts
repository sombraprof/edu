import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import QuizBlockEditor from '../QuizBlockEditor.vue';
import ResourceGalleryEditor from '../ResourceGalleryEditor.vue';
import TabsBlockEditor from '../TabsBlockEditor.vue';
import RoadmapEditor from '../RoadmapEditor.vue';
import KnowledgeCheckEditor from '../KnowledgeCheckEditor.vue';
import ChecklistEditor from '../ChecklistEditor.vue';
import TimelineEditor from '../TimelineEditor.vue';
import StepperEditor from '../StepperEditor.vue';
import GlossaryEditor from '../GlossaryEditor.vue';
import FlashcardsEditor from '../FlashcardsEditor.vue';
import VideosEditor from '../VideosEditor.vue';
import BibliographyEditor from '../BibliographyEditor.vue';
import InteractiveDemoEditor from '../InteractiveDemoEditor.vue';
import CodeSubmissionEditor from '../CodeSubmissionEditor.vue';
import PromptTipEditor from '../PromptTipEditor.vue';
import DesignEmbedEditor from '../DesignEmbedEditor.vue';

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

  it('emits update:block when checklist fields change', async () => {
    const wrapper = mount(ChecklistEditor, {
      props: {
        block: {
          type: 'checklist',
          title: 'Antes da aula',
          description: 'Passos prévios',
          items: ['Revisar slides'],
        },
      },
      global: { stubs },
    });

    const inputs = wrapper.findAll('input[type="text"]');
    await inputs[1].setValue('Preparar ambiente');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const items = payload?.items as string[];
    expect(items?.[0]).toBe('Preparar ambiente');
  });

  it('emits update:block when timeline step is edited', async () => {
    const wrapper = mount(TimelineEditor, {
      props: {
        block: {
          type: 'timeline',
          title: 'Cronograma',
          description: '',
          steps: [{ title: 'Início', content: 'Briefing' }],
        },
      },
      global: { stubs },
    });

    const stepInput = wrapper.findAll('input[type="text"]')[1];
    await stepInput.setValue('Planejamento');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const steps = payload?.steps as Array<Record<string, unknown>>;
    expect(steps?.[0]?.title).toBe('Planejamento');
  });

  it('emits update:block when stepper content is reorganized', async () => {
    const wrapper = mount(StepperEditor, {
      props: {
        block: {
          type: 'stepper',
          title: 'Processo',
          steps: [{ title: 'Passo 1', description: 'Descreva a tarefa' }],
        },
      },
      global: { stubs },
    });

    const descriptionArea = wrapper.find('textarea');
    await descriptionArea.setValue('Nova descrição do passo.');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const steps = payload?.steps as Array<Record<string, unknown>>;
    expect(steps?.[0]?.description).toContain('Nova descrição');
  });

  it('emits update:block when glossary term is ajustado', async () => {
    const wrapper = mount(GlossaryEditor, {
      props: {
        block: {
          type: 'glossary',
          title: 'Termos',
          terms: [{ term: 'API', definition: 'Interface' }],
        },
      },
      global: { stubs },
    });

    const definitionField = wrapper.find('textarea');
    await definitionField.setValue('Interface de programação de aplicações.');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const terms = payload?.terms as Array<Record<string, unknown>>;
    expect(terms?.[0]?.definition).toContain('programação');
  });

  it('emits update:block when flashcard is atualizado', async () => {
    const wrapper = mount(FlashcardsEditor, {
      props: {
        block: {
          type: 'flashcards',
          title: 'Revisão',
          cards: [{ front: 'O que é DOM?', back: 'Representação do documento' }],
        },
      },
      global: { stubs },
    });

    const areas = wrapper.findAll('textarea');
    await areas[1].setValue('Representação do documento em árvore.');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const cards = payload?.cards as Array<Record<string, unknown>>;
    expect(cards?.[0]?.back).toContain('árvore');
  });

  it('emits update:block when vídeo url é atualizado', async () => {
    const wrapper = mount(VideosEditor, {
      props: {
        block: {
          type: 'videos',
          title: 'Apoio',
          videos: [{ title: 'Introdução', url: 'https://example.com/video.mp4' }],
        },
      },
      global: { stubs },
    });

    const urlInput = wrapper.findAll('input[type="url"]')[0];
    await urlInput.setValue('https://video.edu/intro');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const videos = payload?.videos as Array<Record<string, unknown>>;
    expect(videos?.[0]?.url).toBe('https://video.edu/intro');
  });

  it('emits update:block when bibliografia recebe nova referência', async () => {
    const wrapper = mount(BibliographyEditor, {
      props: {
        block: {
          type: 'bibliography',
          title: 'Referências',
          items: ['Sommerville, 2011'],
        },
      },
      global: { stubs },
    });

    const referenceInput = wrapper.findAll('input[type="text"]')[1];
    await referenceInput.setValue('Pressman, Engenharia de Software, 2017');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const items = payload?.items as string[];
    expect(items?.[0]).toContain('Pressman');
  });

  it('emits update:block when demo interativa é configurada', async () => {
    const wrapper = mount(InteractiveDemoEditor, {
      props: {
        block: {
          type: 'interactiveDemo',
          title: 'Simulador',
          url: 'https://demo.local',
          description: 'Experimente o comportamento.',
        },
      },
      global: { stubs },
    });

    const urlInput = wrapper.find('input[type="url"]');
    await urlInput.setValue('https://demo.edu/algoritmo');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    expect(payload?.url).toBe('https://demo.edu/algoritmo');
  });

  it('emits update:block when design embed provider muda', async () => {
    const wrapper = mount(DesignEmbedEditor, {
      props: {
        block: {
          type: 'designEmbed',
          title: 'Fluxo de onboarding',
          provider: 'figma',
          url: 'https://www.figma.com/file/abc123/Projeto?type=design',
        },
      },
      global: { stubs },
    });

    const [providerSelect] = wrapper.findAll('select');
    await providerSelect.setValue('miro');
    const urlInput = wrapper.find('input[type="url"]');
    await urlInput.setValue('https://miro.com/app/board/uXproj?share_link_id=42');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    expect(payload?.provider).toBe('miro');
    expect(payload?.url).toContain('miro.com');
  });

  it('emits update:block when entrega de código recebe novo teste', async () => {
    const wrapper = mount(CodeSubmissionEditor, {
      props: {
        block: {
          type: 'codeSubmission',
          title: 'Somar números',
          description: 'Implemente a função soma.',
          language: 'python',
          starterCode: 'def soma(a, b):\n    return 0',
          tests: ['assert soma(1, 2) == 3'],
        },
      },
      global: { stubs },
    });

    const testInput = wrapper.findAll('input[type="text"]')[2];
    await testInput.setValue('assert soma(-1, 1) == 0');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const tests = payload?.tests as string[];
    expect(tests?.[0]).toContain('soma(-1, 1)');
  });

  it('emits update:block when prompt tip is reajustada', async () => {
    const wrapper = mount(PromptTipEditor, {
      props: {
        block: {
          type: 'promptTip',
          title: 'Prompt inicial',
          description: 'Use contexto e papel.',
          audience: 'Mentores',
          prompt: 'Você é um mentor...',
          tags: ['ia'],
          tips: ['Verifique respostas curtas.'],
        },
      },
      global: { stubs },
    });

    const textInputs = wrapper.findAll('input[type="text"]');
    const tipInput = textInputs.at(-1);
    await tipInput?.setValue('Valide com rubrica.');
    await wrapper.vm.$nextTick();

    const events = wrapper.emitted('update:block');
    expect(events).toBeTruthy();
    const payload = events?.at(-1)?.[0] as Record<string, unknown>;
    const tips = payload?.tips as string[];
    expect(tips?.[0]).toContain('rubrica');
  });
});

import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import VideoAnnotation from '../VideoAnnotation.vue';

function createBlockData() {
  return {
    title: 'Estudo guiado',
    description: '<strong>Contexto inicial</strong>',
    video: {
      provider: 'html5' as const,
      src: 'https://cdn.example.com/video.mp4',
      type: 'video/mp4',
      poster: 'https://cdn.example.com/poster.jpg',
      captions: [
        { src: 'https://cdn.example.com/captions.vtt', label: 'Português', srclang: 'pt' },
      ],
    },
    annotations: [
      {
        id: 'intro',
        label: 'Introdução',
        time: 5,
        type: 'note' as const,
        body: '<p>Bem-vindos à análise orientada.</p>',
      },
      {
        id: 'quiz',
        label: 'Pergunta-chave',
        time: 12,
        type: 'question' as const,
        question: {
          prompt: 'Qual é o retorno da função?',
          explanation: 'A chamada soma corretamente os parâmetros.',
          options: [
            { id: 'opt-a', text: '2', correct: true },
            { id: 'opt-b', text: '3' },
          ],
        },
      },
    ],
    checkpoints: [
      {
        id: 'cp-1',
        label: 'Checkpoint 1',
        time: 8,
        description: '<p>Confirme se a turma compreendeu o fluxo.</p>',
      },
    ],
  };
}

describe('VideoAnnotation', () => {
  it('sincroniza nota e checkpoint conforme o tempo do vídeo avança', async () => {
    const wrapper = mount(VideoAnnotation, { props: { data: createBlockData() } });
    const video = wrapper.get('video').element as HTMLVideoElement & { currentTime: number };

    video.currentTime = 6;
    await wrapper.get('video').trigger('timeupdate');
    await nextTick();

    expect(wrapper.find('.video-annotation__note').text()).toContain(
      'Bem-vindos à análise orientada.'
    );

    video.currentTime = 9;
    await wrapper.get('video').trigger('timeupdate');
    await nextTick();

    const checkpointItem = wrapper.get('[data-test="timeline-checkpoint-cp-1"]');
    expect(checkpointItem.classes()).toContain('timeline-item--completed');
    expect(wrapper.find('.video-annotation__checkpoint').text()).toContain(
      'Confirme se a turma compreendeu o fluxo.'
    );
  });

  it('exibe pergunta interativa e fornece feedback de resposta', async () => {
    const wrapper = mount(VideoAnnotation, { props: { data: createBlockData() } });
    const video = wrapper.get('video').element as HTMLVideoElement & { currentTime: number };

    video.currentTime = 12;
    await wrapper.get('video').trigger('timeupdate');
    await nextTick();

    expect(wrapper.find('.video-annotation__question-prompt').text()).toContain('Qual é o retorno');

    await wrapper.get('input[value="opt-b"]').setValue();
    await nextTick();

    expect(wrapper.find('.video-annotation__feedback').text()).toContain('Tente novamente');

    await wrapper.get('input[value="opt-a"]').setValue();
    await nextTick();

    const feedback = wrapper.find('.video-annotation__feedback');
    expect(feedback.text()).toContain('Resposta correta');
    expect(wrapper.find('.video-annotation__explanation').text()).toContain('soma corretamente');
  });
});

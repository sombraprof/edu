<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type VideoItem = { title?: string; url?: string };

type VideosBlock = {
  type?: string;
  title?: string;
  videos?: VideoItem[];
};

const props = defineProps<{ block: VideosBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: VideosBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'videosBlock' ? 'videosBlock' : (props.block?.type ?? 'videosBlock'),
  title: 'Bloco de vídeos',
  description: 'Agrupe vídeos curtos diretamente associados ao conteúdo principal.',
  fields: [
    { type: 'text', key: 'title', label: 'Título do bloco', placeholder: 'Vídeos da aula' },
    {
      type: 'object-list',
      key: 'videos',
      label: 'Vídeos',
      itemLabel: 'Vídeo',
      addLabel: 'Adicionar vídeo',
      fields: [
        { type: 'text', key: 'title', label: 'Título', placeholder: 'Apresentação' },
        {
          type: 'url',
          key: 'url',
          label: 'URL',
          placeholder: 'https://...',
          help: 'Utilize links públicos com acesso liberado aos estudantes.',
        },
      ],
    },
  ],
}));

function forward(value: VideosBlock) {
  emit('update:block', value);
}
</script>

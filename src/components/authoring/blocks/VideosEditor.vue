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
  type: props.block?.type === 'videos' ? 'videos' : (props.block?.type ?? 'videos'),
  title: 'Playlist de vídeos',
  description: 'Organize vídeos complementares com títulos e URLs validados.',
  fields: [
    { type: 'text', key: 'title', label: 'Título do bloco', placeholder: 'Vídeos recomendados' },
    {
      type: 'object-list',
      key: 'videos',
      label: 'Vídeos',
      itemLabel: 'Vídeo',
      addLabel: 'Adicionar vídeo',
      fields: [
        { type: 'text', key: 'title', label: 'Título', placeholder: 'Introdução à aula' },
        {
          type: 'url',
          key: 'url',
          label: 'URL',
          placeholder: 'https://...',
          help: 'Links do YouTube, Vimeo ou repositórios institucionais.',
        },
      ],
    },
  ],
}));

function forward(value: VideosBlock) {
  emit('update:block', value);
}
</script>

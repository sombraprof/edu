<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type Flashcard = { front?: string; back?: string };

type FlashcardsBlock = {
  type?: string;
  title?: string;
  cards?: Flashcard[];
};

const props = defineProps<{ block: FlashcardsBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: FlashcardsBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: props.block?.type === 'flashcards' ? 'flashcards' : (props.block?.type ?? 'flashcards'),
  title: 'Flashcards',
  description: 'Crie cartões frente e verso para revisão rápida ou quizzes relâmpago.',
  fields: [
    { type: 'text', key: 'title', label: 'Título do bloco', placeholder: 'Flashcards de revisão' },
    {
      type: 'object-list',
      key: 'cards',
      label: 'Cartões',
      itemLabel: 'Cartão',
      addLabel: 'Adicionar cartão',
      fields: [
        {
          type: 'textarea',
          key: 'front',
          label: 'Frente',
          rows: 2,
          placeholder: 'Pergunta ou gatilho',
        },
        {
          type: 'textarea',
          key: 'back',
          label: 'Verso',
          rows: 2,
          placeholder: 'Resposta ou explicação',
        },
      ],
    },
  ],
}));

function forward(value: FlashcardsBlock) {
  emit('update:block', value);
}
</script>

<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type CodeSubmissionBlock = {
  type?: string;
  title?: string;
  description?: string;
  language?: string;
  starterCode?: string;
  tests?: string[];
};

const props = defineProps<{ block: CodeSubmissionBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: CodeSubmissionBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type:
    props.block?.type === 'codeSubmission'
      ? 'codeSubmission'
      : (props.block?.type ?? 'codeSubmission'),
  title: 'Entrega de código',
  description: 'Configure enunciado, linguagem e testes automáticos para avaliar o envio.',
  fields: [
    { type: 'text', key: 'title', label: 'Título', placeholder: 'Implementação da função soma' },
    {
      type: 'textarea',
      key: 'description',
      label: 'Descrição',
      rows: 4,
      placeholder: 'Explique o contexto da tarefa e critérios de avaliação.',
    },
    {
      type: 'text',
      key: 'language',
      label: 'Linguagem',
      placeholder: 'python | javascript | c++',
      help: 'Use nomes reconhecidos pelo executor de testes.',
    },
    {
      type: 'code',
      key: 'starterCode',
      label: 'Código inicial',
      rows: 8,
      placeholder: '// Esqueleto opcional para acelerar o aluno',
    },
    {
      type: 'string-list',
      key: 'tests',
      label: 'Casos de teste',
      itemLabel: 'Teste',
      addLabel: 'Adicionar teste',
      help: 'Expressões ou comandos executados pelo avaliador. Um por linha.',
    },
  ],
}));

function forward(value: CodeSubmissionBlock) {
  emit('update:block', value);
}
</script>

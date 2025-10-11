<template>
  <StructuredBlockEditor :block="block" :schema="schema" @update:block="forward" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StructuredBlockEditor, { type BlockSchema } from './StructuredBlockEditor.vue';

type CodePlaygroundBlock = {
  type?: string;
  title?: string;
  description?: string;
  language?: string;
  initialCode?: string;
  runLabel?: string;
  resetLabel?: string;
};

const { block } = defineProps<{ block: CodePlaygroundBlock }>();
const emit = defineEmits<{ (event: 'update:block', value: CodePlaygroundBlock): void }>();

const schema = computed<BlockSchema>(() => ({
  type: 'codePlayground',
  title: 'Laboratório de código',
  description:
    'Adicione um editor interativo para demonstrar conceitos de programação em JavaScript ou TypeScript.',
  fields: [
    {
      type: 'text',
      key: 'title',
      label: 'Título',
      placeholder: 'Explorando condicionais',
    },
    {
      type: 'textarea',
      key: 'description',
      label: 'Descrição',
      rows: 3,
      placeholder: 'Contextualize a atividade ou explique o objetivo da experiência.',
    },
    {
      type: 'select',
      key: 'language',
      label: 'Linguagem padrão',
      placeholder: 'Selecione a linguagem inicial',
      options: [
        { label: 'JavaScript', value: 'javascript' },
        { label: 'TypeScript', value: 'typescript' },
      ],
    },
    {
      type: 'code',
      key: 'initialCode',
      label: 'Código inicial',
      rows: 10,
      placeholder: "const mensagem = 'Olá, playground!';\nprint(mensagem);",
      help: 'Utilize print(...) para enviar dados ao painel de saída.',
    },
    {
      type: 'text',
      key: 'runLabel',
      label: 'Texto do botão de execução',
      placeholder: 'Executar',
      help: 'Deixe em branco para manter o rótulo padrão "Executar".',
    },
    {
      type: 'text',
      key: 'resetLabel',
      label: 'Texto do botão de reset',
      placeholder: 'Restaurar código',
      help: 'Deixe em branco para manter o rótulo padrão "Restaurar código".',
    },
  ],
}));

function forward(value: CodePlaygroundBlock) {
  emit('update:block', value);
}
</script>

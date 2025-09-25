<script lang="ts">
export const meta = {
  id: 'ux-audit',
  title: 'Auditoria de UX mobile',
  summary: 'Mapeie fluxos de um aplicativo existente e proponha melhorias alinhadas às guidelines.',
  available: false,
};
export default {};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

const content = computed(
  () => `<section>
  <h2>Exercício — Auditoria de UX mobile</h2>
  <p>Analise um aplicativo real (Android ou iOS) identificando boas práticas e pontos de melhoria.</p>
  <ol>
    <li>Mapeie o fluxo principal, telas e componentes utilizados.</li>
    <li>Compare o aplicativo com as guidelines Material Design 3 ou Human Interface Guidelines.</li>
    <li>Monte um quadro com problemas, impacto e sugestão de correção.</li>
    <li>Entregue um protótipo de tela revisada em Figma ou ferramenta similar.</li>
  </ol>
</section>`
);
</script>

<template>
  <LegacyHtml :html="content" />
</template>

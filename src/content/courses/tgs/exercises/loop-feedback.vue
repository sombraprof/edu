<script lang="ts">
export const meta = {
  id: 'loop-feedback',
  title: 'Análise de feedback loops',
  summary: 'Construa diagramas causais destacando ciclos de reforço e balanço.',
  available: false,
};
export default {};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

const content = computed(
  () => `<section>
  <h2>Exercício — Análise de feedback loops</h2>
  <p>Identifique ciclos de reforço e de balanço em um sistema definido pelo grupo.</p>
  <ol>
    <li>Mapeie no mínimo dois ciclos reforçadores e dois balanceadores.</li>
    <li>Marque atrasos que dificultam a percepção de causa e efeito.</li>
    <li>Proponha indicadores para monitorar cada ciclo.</li>
  </ol>
  <p>Compartilhe o diagrama e um texto curto explicando possíveis intervenções.</p>
</section>`
);
</script>

<template>
  <LegacyHtml :html="content" />
</template>

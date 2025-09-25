<script lang="ts">
export const meta = {
  id: 'mapa-sistema',
  title: 'Mapa de sistema',
  summary: 'Modele as fronteiras, entradas e saídas de um sistema real escolhido pelo grupo.',
  available: false,
};
export default {};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

const content = computed(
  () => `<section>
  <h2>Exercício — Mapa de sistema</h2>
  <p>Escolha um sistema da área de tecnologia (por exemplo, plataforma de streaming) e represente-o visualmente.</p>
  <ul>
    <li>Liste atores, recursos, processos e indicadores críticos.</li>
    <li>Defina fronteiras e elementos externos que interferem no desempenho.</li>
    <li>Documente riscos sistêmicos e possíveis pontos de falha.</li>
  </ul>
  <p>Apresente o mapa em até 5 minutos, destacando aprendizados coletivos.</p>
</section>`
);
</script>

<template>
  <LegacyHtml :html="content" />
</template>

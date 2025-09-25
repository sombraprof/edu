<script lang="ts">
export const meta = {
  id: 'refatoracao',
  title: 'Refatoração orientada a objetos',
  summary: 'Aplique princípios SOLID para melhorar um código legado simples.',
  available: false,
};
export default {};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

const content = computed(
  () => `<section>
  <h2>Exercício — Refatoração orientada a objetos</h2>
  <p>Partindo de um código legado em Java ou C#, aplique refatorações guiadas pelos princípios SOLID.</p>
  <ul>
    <li>Identifique <em>code smells</em> (classes gigantes, métodos monolíticos, dependências fortes).</li>
    <li>Proponha classes auxiliares, interfaces ou padrões simples (Strategy, Factory).</li>
    <li>Implemente testes unitários básicos para garantir o comportamento antes e depois da refatoração.</li>
  </ul>
  <p>Documente as mudanças em um arquivo <code>REFATORACAO.md</code> com o antes/depois.</p>
</section>`
);
</script>

<template>
  <LegacyHtml :html="content" />
</template>

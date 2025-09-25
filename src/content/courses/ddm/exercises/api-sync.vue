<script lang="ts">
export const meta = {
  id: 'api-sync',
  title: 'Sincronização com API',
  summary: 'Implemente cache local e sincronização incremental para uma lista de itens.',
  available: false,
};
export default {};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

const content = computed(
  () => `<section>
  <h2>Exercício — Sincronização com API</h2>
  <p>Crie um aplicativo simples com listagem de itens e suporte a modo offline.</p>
  <ul>
    <li>Consuma dados de uma API pública (ou mock) utilizando HTTP client.</li>
    <li>Armazene o resultado localmente (SQLite/Room/Core Data/IndexedDB).</li>
    <li>Atualize o cache ao voltar para o modo online, exibindo feedback para o usuário.</li>
    <li>Teste interrupções de rede e conflitos de dados, registrando as decisões tomadas.</li>
  </ul>
</section>`
);
</script>

<template>
  <LegacyHtml :html="content" />
</template>

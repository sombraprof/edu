<script lang="ts">
export const meta = {
  id: 'modelagem-uml',
  title: 'Modelagem UML de caso real',
  summary: 'Crie diagrama de classes com relacionamentos, atributos e multiplicidades.',
  available: false,
};
export default {};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

const content = computed(
  () => `<section>
  <h2>Exercício — Modelagem UML</h2>
  <p>Modele um sistema de biblioteca digital focado em empréstimo de livros e reservas.</p>
  <ol>
    <li>Identifique classes principais (Livro, Usuário, Empréstimo, Reserva, Notificação).</li>
    <li>Defina atributos e relacionamentos com multiplicidade.</li>
    <li>Destaque métodos essenciais e indicações de herança ou composição.</li>
    <li>Entregue o diagrama em PDF ou imagem, acompanhado de um resumo textual.</li>
  </ol>
</section>`
);
</script>

<template>
  <LegacyHtml :html="content" />
</template>

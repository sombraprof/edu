<script lang="ts">
export const meta = {
  id: 'protótipo-papel',
  title: 'Protótipo de papel',
  summary:
    'Estruture o gameplay loop em um protótipo físico com regras claras e feedback imediato.',
  available: true,
};
export default {};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

const content = computed(
  () => `<section>
  <h2>Exercício — Protótipo de papel</h2>
  <p>Em equipes, desenvolvam um protótipo analógico que represente o loop principal do jogo escolhido.</p>
  <ol>
    <li>Definam objetivo, regras base e condições de vitória/derrota.</li>
    <li>Construa cartas, tabuleiro ou peças necessárias (papel, tokens, dados, etc.).</li>
    <li>Valide o loop com pelo menos dois playtests, anotando ajustes sugeridos.</li>
    <li>Gravem um vídeo curto (1-2 minutos) explicando as decisões de design.</li>
  </ol>
  <p>Entrega: fotos do protótipo, vídeo e relatório com aprendizados.</p>
</section>`
);
</script>

<template>
  <LegacyHtml :html="content" />
</template>

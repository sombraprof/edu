<script lang="ts">
export const meta = {
  id: 'vertical-slice',
  title: 'Vertical slice digital',
  summary: 'Implemente uma cena jogável com HUD básico, controles responsivos e build WebGL.',
  available: false,
};
export default {};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

const content = computed(
  () => `<section>
  <h2>Exercício — Vertical slice digital</h2>
  <p>Monte um recorte vertical do jogo contendo os principais sistemas funcionais.</p>
  <ul>
    <li>Menu inicial com opção de iniciar e reiniciar a cena.</li>
    <li>Personagem controlável, colisões e feedback audiovisual básico.</li>
    <li>Interface minimalista exibindo objetivos e pontuação.</li>
    <li>Registro de bugs e melhorias prioritárias em um quadro Kanban.</li>
  </ul>
  <p>Entrega: build WebGL publicado, link para o repositório e checklist de QA.</p>
</section>`
);
</script>

<template>
  <LegacyHtml :html="content" />
</template>

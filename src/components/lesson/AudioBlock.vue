<template>
  <div class="my-8 bg-white p-6 rounded-lg shadow-md">
    <h3 class="font-bold text-xl text-slate-800 mb-4">
      {{ title }}
    </h3>
    <audio controls class="w-full">
      <source :src="src" type="audio/mpeg" />
      O seu navegador não suporta o elemento de áudio.
    </audio>
  </div>
</template>

<script setup lang="ts">
interface AudioBlockProps {
  title: string;
  src: string;
}

const { title, src } = defineProps<AudioBlockProps>();
</script>

<template>
  <footer class="border-t border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container)]/88 backdrop-blur">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:justify-between">
      <div class="space-y-2">
        <p class="text-label-medium uppercase tracking-[0.2em] text-[var(--md-sys-color-on-surface-variant)]">EDU · Prof. Tiago Sombra</p>
        <p class="supporting-text max-w-xl">
          Conteúdos acadêmicos e listas de exercícios para as disciplinas do professor Tiago Sombra.
        </p>
      </div>
      <nav class="flex flex-wrap items-center gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">
        <a class="nav-link" href="https://sombraprof.github.io" target="_blank" rel="noreferrer">
          <Globe class="h-4 w-4" />
          Portfólio
        </a>
        <a class="nav-link" href="https://github.com/sombraprof/edu" target="_blank" rel="noreferrer">
          <Github class="h-4 w-4" />
          GitHub
        </a>
        <a class="nav-link" href="mailto:tiago.sombra@unichristus.edu.br">
          <Mail class="h-4 w-4" />
          Contato
        </a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Minimal footer component using Material 3 tokens
import { Globe, Github, Mail } from 'lucide-vue-next';
</script>

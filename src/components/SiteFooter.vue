<template>
  <footer class="app-footer">
    <div class="app-footer__content">
      <div class="md-stack md-stack-2">
        <p class="brand-subtitle">Prof. Tiago Sombra</p>
        <p class="supporting-text max-w-xl">
          Conteúdos acadêmicos e listas de exercícios para as disciplinas do professor Tiago Sombra.
        </p>
      </div>
      <nav class="app-footer__links">
        <a class="nav-link" href="https://sombraprof.github.io" target="_blank" rel="noreferrer">
          <Globe class="md-icon md-icon--sm" />
          Portfólio
        </a>
        <a
          class="nav-link"
          href="https://github.com/sombraprof/edu"
          target="_blank"
          rel="noreferrer"
        >
          <Github class="md-icon md-icon--sm" />
          GitHub
        </a>
        <a class="nav-link" href="mailto:tiago.sombra@unichristus.edu.br">
          <Mail class="md-icon md-icon--sm" />
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

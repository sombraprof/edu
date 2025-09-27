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
      <div class="app-footer__teacher">
        <button
          class="nav-link app-footer__teacher-link"
          type="button"
          @click="handleTeacherAccess"
        >
          <component
            :is="teacherMode ? LogOut : UserCog"
            class="md-icon md-icon--sm"
            aria-hidden="true"
          />
          <span>{{ teacherMode ? 'Sair do modo professor' : 'Área do professor' }}</span>
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Minimal footer component using Material 3 tokens
import { computed } from 'vue';
import { Globe, Github, Mail, UserCog, LogOut } from 'lucide-vue-next';
import { useTeacherMode } from '../composables/useTeacherMode';

const { teacherMode, enableTeacherMode, disableTeacherMode } = useTeacherMode();

const teacherPin = computed(() => import.meta.env.VITE_TEACHER_PIN ?? 'TS-2024');

function handleTeacherAccess() {
  if (teacherMode.value) {
    const confirmExit = window.confirm('Deseja sair do modo professor?');
    if (confirmExit) {
      disableTeacherMode();
    }
    return;
  }

  const provided = window.prompt('Digite o código do professor para acessar os relatórios:');
  if (provided === null) {
    return;
  }

  if (provided.trim() === teacherPin.value) {
    enableTeacherMode();
    window.alert('Modo professor ativado. Relatórios liberados.');
  } else {
    window.alert('Código inválido. Tente novamente.');
  }
}
</script>

<style scoped>
.app-footer__teacher {
  display: flex;
  justify-content: flex-end;
}

.app-footer__teacher-link {
  color: var(--md-sys-color-primary);
}
</style>

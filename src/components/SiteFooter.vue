<template>
  <footer class="app-footer">
    <div class="app-footer__content">
      <div class="md-stack md-stack-2">
        <p class="brand-subtitle">Prof. Tiago Sombra</p>
        <p class="supporting-text max-w-xl">
          Conteúdos acadêmicos e listas de exercícios para as disciplinas do professor Tiago Sombra.
        </p>
      </div>
      <nav class="app-footer__links" aria-label="Links institucionais">
        <Md3Button
          as="a"
          variant="text"
          class="app-footer__link"
          href="https://sombraprof.github.io"
          target="_blank"
          rel="noreferrer"
        >
          <template #leading>
            <Globe class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          Portfólio
        </Md3Button>
        <Md3Button
          as="a"
          variant="text"
          class="app-footer__link"
          href="https://github.com/sombraprof/edu"
          target="_blank"
          rel="noreferrer"
        >
          <template #leading>
            <Github class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          GitHub
        </Md3Button>
        <Md3Button
          as="a"
          variant="text"
          class="app-footer__link"
          href="mailto:tiago.sombra@unichristus.edu.br"
        >
          <template #leading>
            <Mail class="md-icon md-icon--sm" aria-hidden="true" />
          </template>
          Contato
        </Md3Button>
        <Md3Button
          variant="text"
          class="app-footer__teacher-button"
          type="button"
          :aria-pressed="teacherMode ? 'true' : 'false'"
          @click="handleTeacherAccess"
        >
          <template #leading>
            <component
              :is="teacherMode ? LogOut : UserCog"
              class="md-icon md-icon--sm"
              aria-hidden="true"
            />
          </template>
          {{ teacherActionLabel }}
        </Md3Button>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Minimal footer component using Material 3 tokens
import { computed } from 'vue';
import { Globe, Github, Mail, UserCog, LogOut } from 'lucide-vue-next';
import { useTeacherMode } from '../composables/useTeacherMode';
import Md3Button from './Md3Button.vue';

const { teacherMode, enableTeacherMode, disableTeacherMode } = useTeacherMode();

const teacherPin = computed(() => import.meta.env.VITE_TEACHER_PIN ?? 'TS-2024');
const teacherActionLabel = computed(() => (teacherMode.value ? 'Professor' : 'Professor'));

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

.app-footer__teacher-button {
  width: fit-content;
}
</style>

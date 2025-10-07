<template>
  <div class="teacher-mode-gate">
    <slot v-if="isGateOpen" />
    <template v-else>
      <slot name="locked">
        <section class="card grid gap-4 p-6 md:p-8">
          <header class="space-y-2">
            <h2 class="md-typescale-title-large font-semibold text-on-surface">
              {{ title }}
            </h2>
            <p class="supporting-text text-on-surface-variant">
              {{ description }}
            </p>
          </header>
          <template v-if="showCallToAction">
            <p class="md-typescale-body-medium text-on-surface-variant">
              Execute <code>npm run dev:teacher</code> para iniciar o serviço de autoria local e
              habilitar o painel do modo professor. Caso utilize um backend remoto, configure a
              variável <code>VITE_TEACHER_API_URL</code> com a URL do serviço disponível.
            </p>
          </template>
        </section>
      </slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTeacherMode } from '../composables/useTeacherMode';

withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: 'Ative o modo professor para continuar',
    description:
      'Utilize o modo professor para acessar ferramentas restritas e conteúdos de governança.',
  }
);

const { isTeacherModeReady, isAuthoringEnabled, isAuthoringForced } = useTeacherMode();

const isGateOpen = computed(() => isTeacherModeReady.value && isAuthoringEnabled.value);
const showCallToAction = computed(() => !isAuthoringForced.value);
</script>

<style scoped>
.teacher-mode-gate {
  display: contents;
}
</style>

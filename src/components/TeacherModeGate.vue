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
          <button class="btn btn-filled w-full md:w-auto" type="button" @click="enableTeacherMode">
            {{ ctaLabel }}
          </button>
          <p class="md-typescale-body-small text-on-surface-variant">
            Também é possível ativar adicionando <code>?teacher=1</code> à URL ou pelo atalho
            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>P</kbd>.
          </p>
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
    ctaLabel?: string;
  }>(),
  {
    title: 'Ative o modo professor para continuar',
    description:
      'Utilize o modo professor para acessar ferramentas restritas e conteúdos de governança.',
    ctaLabel: 'Ativar modo professor',
  }
);

const { teacherMode, isTeacherModeReady, enableTeacherMode } = useTeacherMode();

const isGateOpen = computed(() => isTeacherModeReady.value && teacherMode.value);
</script>

<style scoped>
.teacher-mode-gate {
  display: contents;
}
</style>

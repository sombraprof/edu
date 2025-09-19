<template>
  <router-link
    :to="`/lesson/${lesson.id}`"
    :class="[
      'relative z-0 block card cursor-pointer',
      lesson.ativo
        ? 'card--interactive'
        : 'card--disabled cursor-not-allowed pointer-events-none',
    ]"
    :aria-disabled="!lesson.ativo ? 'true' : 'false'"
    :tabindex="lesson.ativo ? 0 : -1"
    :aria-label="lesson.title + (lesson.ativo ? '' : ' indisponível')"
  >
    <div class="flex flex-col items-start gap-2">
      <span
        class="badge self-end"
        :class="
          lesson.status === 'available' ? 'badge--success' : 'badge--warning'
        "
      >
        <i
          :class="[
            'flex-shrink-0',
            lesson.status === 'available'
              ? 'fa-solid fa-circle'
              : 'fa-regular fa-clock',
          ]"
        />
        <span class="leading-none">{{
          lesson.status === "available" ? "Disponível" : "Em breve"
        }}</span>
      </span>
      <h3
        class="font-bold text-title-large mb-2"
        :class="
          lesson.ativo
            ? 'text-primary-800 dark:text-primary-200'
            : 'text-neutral-700 dark:text-neutral-300'
        "
      >
        {{ lesson.title }}
      </h3>
    </div>
    <p
      class="text-body-medium"
      :class="
        lesson.ativo ? 'text-neutral-700 dark:text-neutral-300' : 'text-disabled'
      "
    >
      {{ lesson.description }}
    </p>
  </router-link>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "LessonCard",
  props: {
    lesson: {
      type: Object,
      required: true,
    },
  },
  setup() {
    // Composition API setup - no additional logic needed for this component
    return {};
  },
});
</script>

<style scoped></style>

<template>
  <section class="lesson-plan">
    <header class="lesson-plan__header">
      <h3 class="lesson-plan__title">{{ data.title }}</h3>
    </header>

    <article v-if="unit" class="lesson-plan__unit">
      <h4 class="lesson-plan__unit-title">{{ unit.title }}</h4>
      <p class="lesson-plan__unit-content" v-html="unit.content"></p>
    </article>

    <div v-if="cards.length" class="lesson-plan__grid">
      <article v-for="(card, index) in cards" :key="index" class="lesson-plan__card">
        <component :is="card.iconComponent" class="lesson-plan__icon" aria-hidden="true" />
        <h4 class="lesson-plan__card-title">{{ card.title }}</h4>
        <p class="lesson-plan__card-content" v-html="card.content"></p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import {
  Target,
  Settings,
  Monitor,
  CheckCircle,
  Users,
  BookOpen,
  Code,
  Database,
  Cpu,
  CalendarDays,
  Clock,
  ListChecks,
} from 'lucide-vue-next';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface LessonPlanCard {
  icon?: string;
  title?: string;
  content?: string;
  text?: string;
}

interface LessonPlanUnit {
  title: string;
  content: string;
}

interface LessonPlanData {
  title: string;
  unit?: LessonPlanUnit;
  cards?: LessonPlanCard[];
  content?: LessonPlanCard[];
}

const props = defineProps<{
  data: LessonPlanData;
}>();

const unit = computed(() => {
  if (!props.data.unit) {
    return null;
  }

  return {
    title: props.data.unit.title,
    content: sanitizeHtml(props.data.unit.content),
  };
});

const cards = computed(() => {
  const source =
    Array.isArray(props.data.cards) && props.data.cards.length
      ? props.data.cards
      : Array.isArray(props.data.content)
        ? props.data.content
        : [];

  return source
    .map((item) => {
      const title = item?.title?.trim() ?? '';
      const content = sanitizeHtml(item?.content ?? item?.text ?? '');

      if (!title && !content) {
        return null;
      }

      return {
        title,
        content,
        iconComponent: getIconComponent(item?.icon),
      };
    })
    .filter((card): card is { title: string; content: string; iconComponent: Component } =>
      Boolean(card)
    );
});

const iconRegistry: Record<string, Component> = {
  bullseye: Target,
  target: Target,
  gears: Settings,
  settings: Settings,
  desktop: Monitor,
  monitor: Monitor,
  'check-circle': CheckCircle,
  checkcircle: CheckCircle,
  users: Users,
  'book-open': BookOpen,
  bookopen: BookOpen,
  code: Code,
  database: Database,
  cpu: Cpu,
  'calendar-days': CalendarDays,
  calendardays: CalendarDays,
  clock: Clock,
  tasks: ListChecks,
  'list-checks': ListChecks,
};

function getIconComponent(iconName?: string): Component {
  if (!iconName) {
    return Target;
  }

  for (const variation of createNameVariations(iconName)) {
    const component = iconRegistry[variation];
    if (component) {
      return component;
    }
  }

  return Target;
}

function createNameVariations(original: string): string[] {
  const trimmed = original.trim();
  const withCamelSeparators = trimmed.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
  const base = withCamelSeparators.replace(/[\s_]+/g, '-');
  const lower = base.toLowerCase();

  return Array.from(
    new Set([trimmed, base, lower, lower.replace(/-/g, ''), trimmed.toLowerCase()])
  );
}
</script>

<style scoped>
.lesson-plan {
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-5);
  box-shadow: var(--shadow-elevation-1);
}

.lesson-plan__title {
  font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-plan__unit {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--md-sys-spacing-2);
  box-shadow: var(--shadow-elevation-1);
}

.lesson-plan__unit-title {
  font-size: var(--md-sys-typescale-title-large-size, 1.25rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-plan__unit-content {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-size, 1rem);
  line-height: 1.6;
}

.lesson-plan__grid {
  display: grid;
  gap: var(--md-sys-spacing-4);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.lesson-plan__card {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-border-radius-large);
  padding: var(--md-sys-spacing-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--md-sys-spacing-3);
  box-shadow: var(--shadow-elevation-1);
}

.lesson-plan__icon {
  width: 3rem;
  height: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--md-sys-border-radius-full);
  background: color-mix(in srgb, var(--md-sys-color-primary) 16%, transparent);
  color: var(--md-sys-color-primary);
}

.lesson-plan__icon :deep(svg) {
  width: 1.5rem;
  height: 1.5rem;
}

.lesson-plan__card-title {
  font-size: var(--md-sys-typescale-title-medium-size, 1.15rem);
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.lesson-plan__card-content {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size, 0.95rem);
}

.lesson-plan :deep(a) {
  color: var(--md-sys-color-primary);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .lesson-plan {
    padding: var(--md-sys-spacing-5);
  }
}
</style>

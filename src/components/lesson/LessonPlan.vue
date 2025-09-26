<template>
  <div class="card p-6 my-8">
    <h3 class="md-typescale-headline-small font-semibold text-on-surface mb-4">
      {{ data.title }}
    </h3>

    <div v-if="data.unit" class="card md-surface-container p-6 mb-6">
      <h4 class="md-typescale-title-large font-semibold text-on-surface mb-2">
        {{ data.unit.title }}
      </h4>
      <p class="md-typescale-body-large text-on-surface-variant" v-html="data.unit.content"></p>
    </div>

    <div v-if="cards.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="card p-6 flex flex-col items-center text-center"
      >
        <component
          :is="getIconComponent(card.icon)"
          class="md-icon md-icon--lg mb-4 text-[var(--md-sys-color-primary)]"
        />
        <h4 class="md-typescale-title-large font-semibold text-on-surface mb-2">
          {{ card.title }}
        </h4>
        <p class="md-typescale-body-medium text-on-surface-variant" v-html="card.content"></p>
      </div>
    </div>
  </div>
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

const cards = computed(() => {
  const source =
    Array.isArray(props.data.cards) && props.data.cards.length
      ? props.data.cards
      : Array.isArray(props.data.content)
        ? props.data.content
        : [];

  return source
    .map((item) => ({
      icon: item?.icon,
      title: item?.title ?? '',
      content: item?.content ?? item?.text ?? '',
    }))
    .filter((card) => card.title || card.content);
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

const getIconComponent = (iconName?: string) => {
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
};

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

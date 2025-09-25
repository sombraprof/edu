<template>
  <section
    v-if="data && data.content && data.content.length"
    :style="{ display: 'flex', flexDirection: 'column', gap: 'var(--md-sys-spacing-6)' }"
  >
    <template v-for="(block, index) in data.content" :key="index">
      <LegacyHtml v-if="block.type === 'html'" :html="toString(block.html)" />

      <CodeBlock
        v-else-if="block.type === 'code'"
        :code="toString(block.code)"
        :language="block.language"
        :plainText="shouldUsePlainText(block.language)"
      />

      <LessonPlan v-else-if="block.type === 'lessonPlan'" :data="block" />
      <ContentBlock v-else-if="block.type === 'contentBlock'" :data="block" />
      <VideosBlock v-else-if="block.type === 'videos'" :data="block" />
      <ChecklistBlock v-else-if="block.type === 'checklist'" :data="block" />
      <BibliographyBlock v-else-if="block.type === 'bibliography'" :data="block" />
      <CardGrid v-else-if="block.type === 'cardGrid'" :data="block" />
      <Callout
        v-else-if="block.type === 'callout'"
        :variant="toString(block.variant)"
        :title="toString(block.title)"
        :content="toString(block.content)"
      />
      <Timeline v-else-if="block.type === 'timeline'" :data="block" />
      <FlightPlan v-else-if="block.type === 'flightPlan'" :data="block" />
      <Accordion v-else-if="block.type === 'accordion'" :data="block" />
      <Representations v-else-if="block.type === 'representations'" :data="block" />
      <TruthTable
        v-else-if="block.type === 'truthTable'"
        :title="toString(block.title)"
        :headers="toStringArray(block.headers)"
        :rows="toMatrix(block.rows)"
      />
      <AudioBlock
        v-else-if="block.type === 'audio'"
        :title="toString(block.title)"
        :src="toString(block.src)"
      />
      <component
        v-else-if="block.type === 'component' && typeof block.component === 'string'"
        :is="getComponent(block.component)"
        v-bind="toRecord(block.props)"
      />
      <LegacySection
        v-else-if="block.type === 'legacySection'"
        :id="toString(block.id)"
        :title="toString(block.title)"
        :html="toString(block.html)"
      />

      <div v-else class="prose max-w-none text-[var(--md-sys-color-on-surface-variant)]">
        <p>
          Bloco com tipo desconhecido: <code>{{ block.type }}</code>
        </p>
      </div>
    </template>
  </section>
  <p v-else class="prose max-w-none text-[var(--md-sys-color-on-surface-variant)]">
    Nenhum conteúdo disponível para esta aula.
  </p>
</template>

<script setup lang="ts">
import Callout from '@/components/lesson/Callout.vue';
import Timeline from '@/components/lesson/Timeline.vue';
import FlightPlan from '@/components/lesson/FlightPlan.vue';
import Accordion from '@/components/lesson/Accordion.vue';
import Representations from '@/components/lesson/Representations.vue';
import CodeBlock from '@/components/lesson/CodeBlock.vue';
import LessonPlan from '@/components/lesson/LessonPlan.vue';
import ContentBlock from '@/components/lesson/ContentBlock.vue';
import VideosBlock from '@/components/lesson/VideosBlock.vue';
import ChecklistBlock from '@/components/lesson/ChecklistBlock.vue';
import BibliographyBlock from '@/components/lesson/BibliographyBlock.vue';
import TruthTable from '@/components/lesson/TruthTable.vue';
import Md3Table from '@/components/lesson/Md3Table.vue';
import Md3LogicOperators from '@/components/lesson/Md3LogicOperators.vue';
import MemoryDiagram from '@/components/lesson/MemoryDiagram.vue';
import OrderedList from '@/components/lesson/OrderedList.vue';
import CardGrid from '@/components/lesson/CardGrid.vue';
import AudioBlock from '@/components/lesson/AudioBlock.vue';
import LegacySection from '@/components/lesson/LegacySection.vue';
import LegacyHtml from '@/components/lesson/LegacyHtml.vue';

type LessonBlock = Record<string, unknown> & {
  type: string;
  language?: string;
  component?: string;
  props?: Record<string, unknown>;
};

interface LessonContent {
  id: string;
  title: string;
  objective?: string;
  content: LessonBlock[];
}

defineProps<{ data: LessonContent }>();

function getComponent(componentName: string | undefined) {
  const components: Record<string, any> = {
    Md3Table,
    Md3LogicOperators,
    MemoryDiagram,
    OrderedList,
    CardGrid,
  };
  return componentName ? components[componentName] || null : null;
}

function shouldUsePlainText(language?: string): boolean {
  return !language || language === 'plaintext' || language === 'pseudocode' || language === 'text';
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  return [];
}

function toMatrix(value: unknown): string[][] {
  if (Array.isArray(value)) {
    return value.map((row) => (Array.isArray(row) ? row.map((cell) => String(cell)) : []));
  }
  return [];
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}
</script>

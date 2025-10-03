<template>
  <article class="test-generator card md-stack md-stack-4">
    <header class="md-stack md-stack-2">
      <h3 v-if="data.title" class="text-title-large font-semibold text-on-surface">
        {{ data.title }}
      </h3>
      <p v-if="data.description" class="text-body-medium text-on-surface-variant">
        {{ data.description }}
      </p>
    </header>

    <section class="md-stack md-stack-2" aria-label="Seleção de tópicos">
      <h4 class="text-title-small font-semibold text-on-surface">Tags desejadas</h4>
      <div class="test-generator__tags">
        <label v-for="tag in data.tags" :key="tag" class="test-generator__chip">
          <input type="checkbox" :value="tag" v-model="selectedTags" />
          <span>#{{ tag }}</span>
        </label>
      </div>
    </section>

    <section class="md-stack md-stack-2" aria-label="Dificuldade">
      <h4 class="text-title-small font-semibold text-on-surface">Dificuldade</h4>
      <div class="test-generator__difficulty">
        <label v-for="level in difficultyOptions" :key="level" class="test-generator__option">
          <input
            type="radio"
            :name="difficultyGroupId"
            :value="level"
            v-model="selectedDifficulty"
          />
          <span>{{ difficultyLabels[level] }}</span>
        </label>
      </div>
    </section>

    <Md3Button variant="filled" @click="generate">Gerar roteiro de estudo</Md3Button>

    <section v-if="output" class="test-generator__result" aria-live="polite">
      <h4 class="text-title-small font-semibold text-on-surface">Sugestão gerada</h4>
      <p class="text-body-medium text-on-surface">{{ output }}</p>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Md3Button from '@/components/Md3Button.vue';

export type TestGeneratorDifficulty = 'easy' | 'medium' | 'hard';

export interface TestGeneratorBlockData {
  title?: string;
  description?: string;
  tags: string[];
  difficulties?: TestGeneratorDifficulty[];
}

const props = defineProps<{ data: TestGeneratorBlockData }>();

const selectedTags = ref<string[]>([]);
const selectedDifficulty = ref<TestGeneratorDifficulty>('medium');
const output = ref('');
const difficultyGroupId = `difficulty-${Math.random().toString(36).slice(2, 8)}`;

const difficultyOptions = computed<TestGeneratorDifficulty[]>(
  () => props.data.difficulties ?? ['easy', 'medium', 'hard']
);

const difficultyLabels: Record<TestGeneratorDifficulty, string> = {
  easy: 'Básico',
  medium: 'Intermediário',
  hard: 'Avançado',
};

function generate() {
  const tags = selectedTags.value.length ? selectedTags.value.join(', ') : 'todas as tags';
  const difficulty = difficultyLabels[selectedDifficulty.value];
  output.value = `Gerar 5 questões nível ${difficulty.toLowerCase()} cobrindo ${tags}. Inclua pelo menos uma questão discursiva.`;
}
</script>

<style scoped>
.test-generator {
  border-radius: 1.5rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 1.5rem;
  background: var(--md-sys-color-surface);
}

.test-generator__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.test-generator__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
}

.test-generator__difficulty {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.test-generator__option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
}

.test-generator__result {
  border-top: 1px solid var(--md-sys-color-outline-variant);
  padding-top: 1rem;
}
</style>

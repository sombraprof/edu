<template>
  <div>
    <!-- Lessons Section -->
    <SectionBlock
      v-if="currentFilter !== 'exercises'"
      id="home"
      title="Aulas"
      :animate="true"
      :divider="true"
    >
      <div
        id="cards-container"
        class="space-y-8"
      >
        <GlobalLoader
          v-if="loading"
          title="Carregando aulas..."
          subtitle="Preparando o material de estudo."
        />
        <GlobalAlert
          v-else-if="
            Object.keys(groupedLessonsView).length === 0 &&
              (currentFilter === 'all' || currentFilter === 'lessons')
          "
          text="Nenhuma aula encontrada."
          variant="info"
          class="text-center"
        />
        <div
          v-for="(group, groupName) in groupedLessonsView"
          v-else
          :key="groupName"
          class="space-y-4"
        >
          <h3 class="group-title section__subtitle">
            {{ groupName }}
          </h3>
          <div class="group-grid relative z-0 grid-cards anim-cards">
            <LessonCard
              v-for="lesson in group"
              :key="lesson.id"
              :lesson="lesson"
            />
          </div>
        </div>
      </div>
    </SectionBlock>

    <!-- Exercise Lists Section -->
    <SectionBlock
      v-if="currentFilter !== 'lessons'"
      id="exercises"
      title="Lista de Exercícios"
      :tight="true"
      :animate="true"
      :divider="true"
    >
      <div
        id="exercises-container"
        class="grid-cards anim-cards"
      >
        <GlobalLoader
          v-if="loading"
          title="Carregando listas..."
          subtitle="Buscando os desafios."
        />
        <GlobalAlert
          v-else-if="
            exercisesView.length === 0 &&
              (currentFilter === 'all' || currentFilter === 'exercises')
          "
          text="Nenhuma lista encontrada."
          variant="info"
          class="col-span-full text-center"
        />
        <ListaCard
          v-for="exercise in exercisesView"
          :key="exercise.id"
          :lista="exercise"
        />
      </div>
    </SectionBlock>
  </div>
</template>

<script>
import { computed, onMounted, watch } from "vue";
import { useBranding } from "../js/core/branding.js";
import { useFiltersStore } from "../stores/filters.js";
import { storeToRefs } from "pinia";
import { useDataStore } from "../stores/data.js";
import { useAnimations } from "../composables/useAnimations.js";
import LessonCard from "../components/LessonCard.vue";
import ListaCard from "../components/ListaCard.vue";
import GlobalAlert from "../components/GlobalAlert.vue";
import SectionBlock from "../components/SectionBlock.vue";
import GlobalLoader from "../components/GlobalLoader.vue";

export default {
  name: "HomeView",
  components: {
    LessonCard,
    ListaCard,
    SectionBlock,
    GlobalAlert,
    GlobalLoader,
  },
  setup() {
    const { branding } = useBranding();
    const filtersStore = useFiltersStore();
    const { currentFilter, currentViewMode } = storeToRefs(filtersStore);
    const dataStore = useDataStore();
    const { loading } = storeToRefs(dataStore);
    const { animateContainer } = useAnimations();

    const applyStagger = async () => {
      await animateContainer(".group-grid, #exercises-container", {
        groupDelay: 120,
        itemDelay: 40
      });
    };

    const applyViewMode = () => {
      const containers = document.querySelectorAll(
        ".group-grid, #exercises-container",
      );
      containers.forEach((container) => {
        container.classList.add("layout-fade");
        const isList = currentViewMode.value === "list";
        if (isList) {
          container.classList.remove("grid-cards");
          container.classList.add("grid", "grid-cols-1", "gap-6");
        } else {
          container.classList.remove("grid", "grid-cols-1", "gap-6");
          container.classList.add("grid-cards");
        }
        setTimeout(() => container.classList.remove("layout-fade"), 200);
      });
      applyStagger();
    };

    onMounted(async () => {
      dataStore.loadData();
      applyViewMode();
      await applyStagger();
    });

    // Reagir ao modo de exibição
    watch(currentViewMode, () => {
      applyViewMode();
    });

    // Animação suave ao mudar filtros (Tudo/Aulas/Exercícios)
    watch(currentFilter, async () => {
      // desativa overrides legacy quando em exercises
      const root = document.documentElement;
      if (currentFilter.value === "exercises") root.classList.remove("legacy-md2");
      const containers = document.querySelectorAll(
        ".group-grid, #exercises-container",
      );
      containers.forEach((container) => {
        container.classList.add("layout-fade");
        setTimeout(() => container.classList.remove("layout-fade"), 200);
      });
      await applyStagger();
    });

    // Dados derivados (filtro aplicado no nível da view)
    const groupedLessonsView = computed(() => {
      if (currentFilter.value === "exercises") return {};
      const groups = {};
      dataStore.lessons.forEach((lesson) => {
        const unit = lesson.unit || "Lessons";
        if (!groups[unit]) groups[unit] = [];
        groups[unit].push(lesson);
      });
      return groups;
    });

    const exercisesView = computed(() => {
      if (currentFilter.value === "lessons") return [];
      return dataStore.exercises;
    });

    return {
      branding,
      loading,
      groupedLessonsView,
      exercisesView,
      currentFilter,
    };
  },
};
</script>

<style scoped>
/* Removed header-button and dropdown-item styles */
</style>

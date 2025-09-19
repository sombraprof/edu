import { defineStore } from "pinia";
import { ref, computed } from "vue";

const processLessons = (lessonsData) => {
  window.__LESSONS_META = lessonsData;

  const groups = {};
  lessonsData.forEach((lesson) => {
    const unit = lesson.unidade || "Lessons";
    if (!groups[unit]) groups[unit] = [];
    groups[unit].push(lesson);
  });

  const flatLessons = [];
  Object.keys(groups)
    .sort((a, b) => a.localeCompare(b, "pt"))
    .forEach((unit) => {
      groups[unit].forEach((lesson) => {
        const id = (lesson.arquivo || "").replace(/\.html$/i, "");
        flatLessons.push({
          id,
          title: lesson.titulo,
          description: lesson.descricao,
          status: lesson.ativo ? "available" : "soon",
          unit: unit,
          ativo: lesson.ativo,
        });
      });
    });
  return flatLessons;
};

const processExercises = (exercisesData) => {
  window.__EXERCISES_META = exercisesData;
  return exercisesData.map((exercise) => {
    const id = (exercise.arquivo || "").replace(/\.json$/i, "");
    return {
      id,
      title: exercise.titulo,
      description: exercise.descricao,
      progress: 0,
      progressText: "Loading progress...",
    };
  });
};

export const useDataStore = defineStore("data", () => {
  const loading = ref(true);
  const error = ref(null);
  const lessons = ref([]);
  const exercises = ref([]);

  const filteredLessons = ref([]);
  const filteredExercises = ref([]);

  const groupedFilteredLessons = computed(() => {
    const groups = {};
    filteredLessons.value.forEach((lesson) => {
      const unit = lesson.unit || "Lessons";
      if (!groups[unit]) groups[unit] = [];
      groups[unit].push(lesson);
    });
    return groups;
  });

  const applyFilters = (currentFilter) => {
    if (currentFilter === "all") {
      filteredLessons.value = [...lessons.value];
      filteredExercises.value = [...exercises.value];
    } else if (currentFilter === "lessons") {
      filteredLessons.value = [...lessons.value];
      filteredExercises.value = [];
    } else if (currentFilter === "exercises") {
      filteredLessons.value = [];
      filteredExercises.value = [...exercises.value];
    }
  };

  const loadData = async () => {
    if (lessons.value.length > 0 && exercises.value.length > 0) {
      loading.value = false;
      return;
    }

    try {
      loading.value = true;
      error.value = null;

      const [lessonsResponse, exercisesResponse] = await Promise.all([
        fetch("lessons/lessons.json"),
        fetch("exercises/exercises.json"),
      ]);

      if (!lessonsResponse.ok) throw new Error("Failed to load lessons.");
      if (!exercisesResponse.ok) throw new Error("Failed to load exercises.");

      const lessonsData = await lessonsResponse.json();
      const exercisesData = await exercisesResponse.json();

      lessons.value = processLessons(lessonsData);
      exercises.value = processExercises(exercisesData);

      filteredLessons.value = [...lessons.value];
      filteredExercises.value = [...exercises.value];
    } catch (err) {
      console.error("Failed to load data store:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    lessons,
    exercises,
    filteredLessons,
    filteredExercises,
    groupedFilteredLessons,
    applyFilters,
    loadData,
  };
});

<template>
  <div>
    <!-- Page Header (will be global from App.vue) -->
    <!-- <PageHeader :pageTitle="aulaTitle" /> -->

    <GlobalLoader
      v-if="loading"
      title="Carregando aula"
      subtitle="Preparando o conteúdo..."
    />
    <GlobalAlert
      v-else-if="error"
      :text="error"
      variant="error"
      icon="fa-solid fa-triangle-exclamation"
    />
    <div v-else>
      <div
        ref="lessonContainer"
        class="md3-content pt-6"
        v-html="lessonContent"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from "vue";
import { useHead } from "@vueuse/head";
import DOMPurify from "dompurify";
import GlobalAlert from "../components/GlobalAlert.vue";
import GlobalLoader from "../components/GlobalLoader.vue";
import { rehighlightSafe } from "../js/web/hljs-utils.js";
import { enhanceAulaContent } from "../js/web/aula-enhance.js";
// import PageHeader from '../components/PageHeader.vue'; // Will be removed

/**
 * Logger utility for structured logging
 */
const logger = {
  error: (message, context = {}) => {
    console.error(`[LessonView] ${message}`, {
      timestamp: new Date().toISOString(),
      ...context
    });
  },
  info: (message, context = {}) => {
    console.info(`[LessonView] ${message}`, {
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

export default {
  name: "LessonView",
  components: { GlobalAlert, GlobalLoader },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const loading = ref(true);
    const error = ref(null);
    const lessonContent = ref("");
    const lessonTitle = ref("Lesson");
    const lessonContainer = ref(null);
    const baseUrl = import.meta.env.BASE_URL || "/";
    const lessonsBaseUrl = `${baseUrl.replace(/\/$/, "")}/lessons/`;

    /**
     * Loads lesson content with improved error handling and performance
     * @param {string} lessonId - The ID of the lesson to load
     * @returns {Promise<void>}
     */
    const loadLesson = async (lessonId) => {
      try {
        loading.value = true;
        error.value = null;

        logger.info("Starting lesson load", { lessonId });

        // Validate lesson ID
        if (!lessonId || typeof lessonId !== 'string') {
          throw new Error("Invalid lesson ID provided");
        }

        // First, fetch the metadata file with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
          const metaResponse = await fetch(
            `${import.meta.env.BASE_URL}lessons/lessons.json`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          if (!metaResponse.ok) {
            throw new Error(`Failed to load lessons metadata: ${metaResponse.status} ${metaResponse.statusText}`);
          }

          const lessonsMeta = await metaResponse.json();
          const metaList = Array.isArray(window.__LESSONS_META)
            ? window.__LESSONS_META
            : lessonsMeta;

          const lesson = metaList.find((l) => l.id === lessonId);

          if (!lesson) {
            throw new Error(`Lesson with ID "${lessonId}" not found in metadata`);
          }

          if (!lesson.ativo) {
            throw new Error("This lesson is not available yet");
          }

          lessonTitle.value = lesson.titulo || `Lesson ${lessonId}`;

          // Fetch the HTML content of the lesson file
          const fileName = lesson.arquivo || `${lessonId}.html`;
          const lessonUrl = `${lessonsBaseUrl}${fileName}`;

          const lessonResponse = await fetch(lessonUrl);

          if (!lessonResponse.ok) {
            throw new Error(`Lesson file not found in build: ${fileName}`);
          }

          const rawHtml = await lessonResponse.text();
          lessonContent.value = DOMPurify.sanitize(rawHtml, {
            ADD_TAGS: [
              "md3-video",
              "md3-callout",
              "md3-checkbox",
              "md3-external",
              "iframe",
            ],
            ADD_ATTR: [
              "title", "src", "allow", "variant", "label", "checked",
              "href", "icon", "target", "rel", "allowfullscreen",
              "frameborder", "loading", "referrerpolicy",
            ],
          });

          // Mark as visited with error handling
          try {
            if (window.localStorage) {
              const visited = JSON.parse(
                localStorage.getItem("visited_lesson") || "[]",
              );
              if (!visited.includes(lessonId)) {
                visited.push(lessonId);
                localStorage.setItem("visited_lesson", JSON.stringify(visited));
              }
            }
          } catch (storageError) {
            logger.error("Failed to save lesson visit to localStorage", {
              lessonId,
              error: storageError.message
            });
          }

          // Enhance content after DOM update using nextTick
          await nextTick();
          try {
            const root = lessonContainer.value;

            if (root) {
              enhanceAulaContent(root);
              // Normalize external links: open in new tab with noopener
              root.querySelectorAll('a[href^="http"]').forEach((a) => {
                try {
                  a.setAttribute("target", "_blank");
                } catch (linkError) {
                  logger.error("Failed to set link attributes", {
                    href: a.href,
                    error: linkError.message
                  });
                }
                try {
                  a.setAttribute("rel", "noopener noreferrer");
                } catch (relError) {
                  logger.error("Failed to set link rel", {
                    href: a.href,
                    error: relError.message
                  });
                }
              });
            }
            rehighlightSafe();
          } catch (enhanceError) {
            logger.error("Failed to enhance lesson content", {
              lessonId,
              error: enhanceError.message
            });
          }

          logger.info("Lesson loaded successfully", { lessonId, title: lessonTitle.value });

          // Update page metadata for SEO
          useHead({
            title: `${lessonTitle.value} - ALGI`,
            meta: [
              {
                name: 'description',
                content: lesson.descricao || `Aprenda ${lessonTitle.value} no curso de Algoritmos e Lógica de Programação`
              },
              {
                property: 'og:title',
                content: `${lessonTitle.value} - ALGI`
              },
              {
                property: 'og:description',
                content: lesson.descricao || `Aprenda ${lessonTitle.value} no curso de Algoritmos e Lógica de Programação`
              },
              {
                property: 'og:type',
                content: 'article'
              }
            ]
          });

        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error("Request timeout - please check your internet connection");
          }
          throw fetchError;
        }

      } catch (err) {
        const errorMessage = err.message || "An unexpected error occurred while loading the lesson";
        error.value = errorMessage;

        logger.error("Failed to load lesson", {
          lessonId,
          error: errorMessage,
          stack: err.stack
        });

        // Could send to error monitoring service here
        // errorMonitoring.captureException(err, { lessonId });
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadLesson(props.id);
    });

    // Watch for route changes to reload content
    watch(
      () => props.id,
      (newId) => {
        if (newId) {
          loadLesson(newId);
        }
      },
    );

    watch(
      lessonContent,
      async () => {
        await nextTick();
        try {
          const root = lessonContainer.value;
          if (root) {
            enhanceAulaContent(root);
            rehighlightSafe();
          }
        } catch (err) {
          logger.error("Failed to re-enhance lesson content after update", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      },
      { flush: "post" },
    );

    return {
      loading,
      error,
      lessonContent,
      lessonTitle,
      lessonContainer,
    };
  },
};
</script>

<style scoped>
/* Scoped styles for LessonView */
</style>

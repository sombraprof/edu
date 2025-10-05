<template>
  <section class="teacher-authoring-workspace">
    <header class="teacher-authoring-workspace__header">
      <div class="teacher-authoring-workspace__headline">
        <slot name="header">
          <h2 class="teacher-authoring-workspace__title">Área de autoria</h2>
        </slot>
      </div>
    </header>

    <div
      class="teacher-authoring-workspace__layout"
      :class="{ 'teacher-authoring-workspace__layout--with-sidebar': hasSidebar }"
    >
      <aside v-if="hasSidebar" class="teacher-authoring-workspace__sidebar">
        <slot name="sidebar" />
      </aside>

      <div class="teacher-authoring-workspace__canvas">
        <div
          v-if="showViewSelector"
          class="teacher-authoring-workspace__tabs"
          role="tablist"
          aria-label="Alternar entre editor e prévia"
        >
          <button
            type="button"
            class="teacher-authoring-workspace__tab"
            :class="{ 'teacher-authoring-workspace__tab--active': currentView === 'editor' }"
            :aria-pressed="currentView === 'editor'"
            data-testid="teacher-workspace-tab-editor"
            @click="setView('editor')"
          >
            <span class="teacher-authoring-workspace__tab-label">Editor</span>
          </button>
          <button
            type="button"
            class="teacher-authoring-workspace__tab"
            :class="{ 'teacher-authoring-workspace__tab--active': currentView === 'preview' }"
            :aria-pressed="currentView === 'preview'"
            data-testid="teacher-workspace-tab-preview"
            @click="setView('preview')"
          >
            <span class="teacher-authoring-workspace__tab-label">Prévia</span>
          </button>
        </div>

        <div class="teacher-authoring-workspace__body">
          <div
            v-if="currentView === 'editor' && editorEnabled"
            key="editor"
            class="teacher-authoring-workspace__pane teacher-authoring-workspace__pane--editor"
          >
            <slot name="editor" />
          </div>
          <div
            v-else-if="currentView === 'preview' && previewEnabled"
            key="preview"
            class="teacher-authoring-workspace__pane teacher-authoring-workspace__pane--preview"
          >
            <slot name="preview" />
          </div>
          <div v-else class="teacher-authoring-workspace__empty" role="status">
            <slot name="empty">Nenhum conteúdo disponível para esta visão.</slot>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, useSlots } from 'vue';

type WorkspaceView = 'editor' | 'preview';

interface TeacherAuthoringWorkspaceProps {
  view?: WorkspaceView;
  defaultView?: WorkspaceView;
  editorEnabled?: boolean;
  previewEnabled?: boolean;
}

const props = withDefaults(defineProps<TeacherAuthoringWorkspaceProps>(), {
  defaultView: 'editor',
  editorEnabled: true,
  previewEnabled: true,
});

const emit = defineEmits<{
  'update:view': [WorkspaceView];
  change: [WorkspaceView];
}>();

const internalView = ref<WorkspaceView>(
  props.view ?? (props.editorEnabled ? props.defaultView : 'preview')
);

const currentView = computed(() => props.view ?? internalView.value);

const editorEnabled = computed(() => props.editorEnabled);
const previewEnabled = computed(() => props.previewEnabled);

const showViewSelector = computed(() => editorEnabled.value && previewEnabled.value);
const slots = useSlots();
const hasSidebar = computed(() => Boolean(slots.sidebar));

watch(
  () => props.view,
  (next) => {
    if (!next) {
      return;
    }
    internalView.value = next;
  }
);

watch([editorEnabled, previewEnabled], ([editorAvailable, previewAvailable]) => {
  if (!editorAvailable && currentView.value === 'editor' && previewAvailable) {
    setView('preview');
  }
  if (!previewAvailable && currentView.value === 'preview' && editorAvailable) {
    setView('editor');
  }
});

function setView(view: WorkspaceView) {
  if (view === currentView.value) {
    return;
  }

  if (view === 'editor' && !editorEnabled.value) {
    return;
  }

  if (view === 'preview' && !previewEnabled.value) {
    return;
  }

  if (props.view === undefined) {
    internalView.value = view;
  }

  emit('update:view', view);
  emit('change', view);
}
</script>

<style scoped>
.teacher-authoring-workspace {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.teacher-authoring-workspace__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.teacher-authoring-workspace__headline {
  flex: 1;
  min-width: 12rem;
}

.teacher-authoring-workspace__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #1d1b20);
}

.teacher-authoring-workspace__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.teacher-authoring-workspace__layout--with-sidebar {
  gap: 2rem;
}

.teacher-authoring-workspace__sidebar {
  position: relative;
}

.teacher-authoring-workspace__canvas {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

.teacher-authoring-workspace__body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.teacher-authoring-workspace__tabs {
  display: inline-flex;
  background: var(--md-sys-color-surface-container-high, #f3edf7);
  border-radius: 9999px;
  padding: 0.25rem;
  gap: 0.25rem;
}

.teacher-authoring-workspace__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  border: none;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.teacher-authoring-workspace__tab:focus-visible {
  outline: 2px solid var(--md-sys-color-primary, #6750a4);
  outline-offset: 2px;
}

.teacher-authoring-workspace__tab--active {
  background: var(--md-sys-color-primary, #6750a4);
  color: var(--md-sys-color-on-primary, #ffffff);
}

.teacher-authoring-workspace__tab-label {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.teacher-authoring-workspace__pane {
  width: 100%;
}

.teacher-authoring-workspace__empty {
  padding: 2rem;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  background: var(--md-sys-color-surface-container, #ece6f0);
  border-radius: 1rem;
}

@media (min-width: 1024px) {
  .teacher-authoring-workspace__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .teacher-authoring-workspace__layout--with-sidebar {
    grid-template-columns: 20rem minmax(0, 1fr);
    align-items: flex-start;
  }

  .teacher-authoring-workspace__sidebar {
    position: sticky;
    top: 5.5rem;
    max-height: calc(100vh - 6rem);
    overflow: auto;
  }

  .teacher-authoring-workspace__canvas {
    min-height: 0;
  }
}
</style>

import { computed, readonly, ref } from 'vue';

const authoringForced = import.meta.env.DEV && Boolean(import.meta.env.VITE_TEACHER_API_URL);

const teacherMode = ref(authoringForced);
const ready = ref(authoringForced);
let initialized = false;

function persist(value: boolean) {
  if (authoringForced || typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem('teacherMode', value ? 'true' : 'false');
  } catch (error) {
    console.warn('[useTeacherMode] Failed to persist teacher mode', error);
  }
}

function setTeacherMode(value: boolean) {
  if (authoringForced) {
    teacherMode.value = true;
    ready.value = true;
    return;
  }

  teacherMode.value = value;
  persist(value);
}

function syncFromQueryString() {
  if (authoringForced || typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (!params.has('teacher')) {
    return false;
  }

  const flag = params.get('teacher');
  const shouldEnable = flag !== null && flag !== '0' && flag.toLowerCase() !== 'false';
  setTeacherMode(shouldEnable);
  ready.value = true;

  params.delete('teacher');
  const newSearch = params.toString();
  const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
  window.history.replaceState(window.history.state, '', newUrl);
  return true;
}

function syncFromStorage() {
  if (authoringForced || typeof window === 'undefined') {
    ready.value = true;
    return;
  }
  try {
    const stored = window.localStorage.getItem('teacherMode');
    teacherMode.value = stored === 'true';
  } catch (error) {
    console.warn('[useTeacherMode] Failed to read teacher mode from storage', error);
  } finally {
    ready.value = true;
  }
}

export function useTeacherMode() {
  if (!initialized) {
    initialized = true;
    if (!authoringForced) {
      const handledByQuery = syncFromQueryString();
      if (!handledByQuery) {
        syncFromStorage();
      }
    } else {
      teacherMode.value = true;
      ready.value = true;
    }
  }

  const isAuthoringForced = computed(() => authoringForced);
  const isAuthoringEnabled = computed(() => authoringForced || teacherMode.value);

  return {
    teacherMode: readonly(teacherMode),
    isTeacherModeReady: readonly(ready),
    enableTeacherMode: () => setTeacherMode(true),
    disableTeacherMode: () => setTeacherMode(false),
    toggleTeacherMode: () => setTeacherMode(!teacherMode.value),
    isAuthoringEnabled,
    isAuthoringForced,
  } as const;
}

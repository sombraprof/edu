import { readonly, ref } from 'vue';

const teacherMode = ref(false);
const ready = ref(false);
let initialized = false;

function persist(value: boolean) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem('teacherMode', value ? 'true' : 'false');
  } catch (error) {
    console.warn('[useTeacherMode] Failed to persist teacher mode', error);
  }
}

function setTeacherMode(value: boolean) {
  teacherMode.value = value;
  persist(value);
}

function syncFromQueryString() {
  if (typeof window === 'undefined') {
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
  if (typeof window === 'undefined') {
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
    const handledByQuery = syncFromQueryString();
    if (!handledByQuery) {
      syncFromStorage();
    }
  }

  return {
    teacherMode: readonly(teacherMode),
    isTeacherModeReady: readonly(ready),
    enableTeacherMode: () => setTeacherMode(true),
    disableTeacherMode: () => setTeacherMode(false),
    toggleTeacherMode: () => setTeacherMode(!teacherMode.value),
  } as const;
}

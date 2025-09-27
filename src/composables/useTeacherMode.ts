import { readonly, ref } from 'vue';

const teacherMode = ref(false);
const ready = ref(false);
let initialized = false;

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

export function useTeacherMode() {
  if (!initialized) {
    initialized = true;
    syncFromStorage();
  }

  return {
    teacherMode: readonly(teacherMode),
    isTeacherModeReady: readonly(ready),
    enableTeacherMode: () => setTeacherMode(true),
    disableTeacherMode: () => setTeacherMode(false),
    toggleTeacherMode: () => setTeacherMode(!teacherMode.value),
  } as const;
}

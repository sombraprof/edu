import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref } from 'vue';

type LessonEditorModel = {
  title?: string;
  blocks?: unknown[];
};

async function importEditorModule() {
  return await import('../useTeacherContentEditor');
}

describe('useTeacherContentEditor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('detects pending changes and triggers autosave on model edits', async () => {
    vi.stubEnv('VITE_TEACHER_API_URL', 'https://automation.local');

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          path: 'courses/demo/lessons/example.json',
          content: { title: 'Original title', blocks: [] },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          path: 'courses/demo/lessons/example.json',
          content: {
            title: 'New title',
            blocks: [{ type: 'contentBlock', id: 1 }],
          },
          savedAt: new Date().toISOString(),
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const { useTeacherContentEditor } = await importEditorModule();

    const path = ref('courses/demo/lessons/example.json');
    const lessonModel = ref<LessonEditorModel | null>(null);
    const setLessonModel = vi.fn((value: LessonEditorModel | null) => {
      lessonModel.value = value ? JSON.parse(JSON.stringify(value)) : null;
    });

    const editor = useTeacherContentEditor<LessonEditorModel, LessonEditorModel>({
      path: computed(() => path.value),
      model: lessonModel,
      setModel: setLessonModel,
      fromRaw: (raw) => JSON.parse(JSON.stringify(raw)) as LessonEditorModel,
      toRaw: (model) => JSON.parse(JSON.stringify(model)) as LessonEditorModel,
      debounceMs: 10,
    });

    await nextTick();
    await Promise.resolve();
    await nextTick();
    expect(lessonModel.value).toEqual({ title: 'Original title', blocks: [] });

    await nextTick();
    lessonModel.value!.title = 'New title';
    lessonModel.value!.blocks = [{ type: 'contentBlock', id: 1 }];

    await nextTick();
    await nextTick();
    expect(editor.hasPendingChanges.value).toBe(true);

    await vi.advanceTimersByTimeAsync(10);
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://automation.local/api/teacher/content',
      expect.objectContaining({
        method: 'PUT',
      })
    );

    await nextTick();
    expect(editor.hasPendingChanges.value).toBe(false);
  });
});

import {
  computed,
  defineAsyncComponent,
  ref,
  type Component,
  type Ref,
  type WritableComputedRef,
} from 'vue';
import type { LessonBlock } from '@/components/lesson/blockRegistry';

export type LessonArrayField =
  | 'objectives'
  | 'competencies'
  | 'skills'
  | 'outcomes'
  | 'prerequisites';

export interface LessonEditorModel extends Record<string, unknown> {
  title?: string;
  summary?: string;
  objective?: string;
  modality?: string;
  duration?: number | null;
  tags?: string[];
  objectives?: string[];
  competencies?: string[];
  skills?: string[];
  outcomes?: string[];
  prerequisites?: string[];
  blocks?: LessonBlock[];
}

const MetadataListEditor = defineAsyncComponent(
  () => import('@/components/authoring/MetadataListEditor.vue')
);
const LessonPlanEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/LessonPlanEditor.vue')
);
const CalloutEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/CalloutEditor.vue')
);
const CardGridEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/CardGridEditor.vue')
);
const ContentBlockEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/ContentBlockEditor.vue')
);
const QuizBlockEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/QuizBlockEditor.vue')
);
const ResourceGalleryEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/ResourceGalleryEditor.vue')
);
const TabsBlockEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/TabsBlockEditor.vue')
);
const RoadmapEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/RoadmapEditor.vue')
);
const KnowledgeCheckEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/KnowledgeCheckEditor.vue')
);
const ChecklistEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/ChecklistEditor.vue')
);
const TimelineEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/TimelineEditor.vue')
);
const StepperEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/StepperEditor.vue')
);
const GlossaryEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/GlossaryEditor.vue')
);
const FlashcardsEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/FlashcardsEditor.vue')
);
const VideosEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/VideosEditor.vue')
);
const VideosBlockEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/VideosBlockEditor.vue')
);
const BibliographyEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/BibliographyEditor.vue')
);
const BibliographyBlockEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/BibliographyBlockEditor.vue')
);
const InteractiveDemoEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/InteractiveDemoEditor.vue')
);
const DesignEmbedEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/DesignEmbedEditor.vue')
);
const CodeSubmissionEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/CodeSubmissionEditor.vue')
);
const CodePlaygroundEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/CodePlaygroundEditor.vue')
);
const PromptTipEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/PromptTipEditor.vue')
);
const FlightPlanEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/FlightPlanEditor.vue')
);
const AccordionEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/AccordionEditor.vue')
);
const RepresentationsEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/RepresentationsEditor.vue')
);
const ParsonsEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/ParsonsEditor.vue')
);
const ParsonsPuzzleEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/ParsonsPuzzleEditor.vue')
);
const GenericJsonBlockEditor = defineAsyncComponent(
  () => import('@/components/authoring/blocks/UnsupportedBlockEditor.vue')
);

const blockEditorRegistry = Object.freeze({
  lessonPlan: LessonPlanEditor,
  callout: CalloutEditor,
  cardGrid: CardGridEditor,
  contentBlock: ContentBlockEditor,
  quiz: QuizBlockEditor,
  resourceGallery: ResourceGalleryEditor,
  tabs: TabsBlockEditor,
  roadmap: RoadmapEditor,
  knowledgeCheck: KnowledgeCheckEditor,
  multipleChoice: QuizBlockEditor,
  checklist: ChecklistEditor,
  timeline: TimelineEditor,
  stepper: StepperEditor,
  glossary: GlossaryEditor,
  flashcards: FlashcardsEditor,
  videos: VideosEditor,
  videosBlock: VideosBlockEditor,
  bibliography: BibliographyEditor,
  bibliographyBlock: BibliographyBlockEditor,
  interactiveDemo: InteractiveDemoEditor,
  designEmbed: DesignEmbedEditor,
  codePlayground: CodePlaygroundEditor,
  codeSubmission: CodeSubmissionEditor,
  promptTip: PromptTipEditor,
  flightPlan: FlightPlanEditor,
  accordion: AccordionEditor,
  representations: RepresentationsEditor,
  parsons: ParsonsEditor,
  parsonsPuzzle: ParsonsPuzzleEditor,
});

type BlockEditorRegistry = typeof blockEditorRegistry;

function cloneModel(model: LessonEditorModel): LessonEditorModel {
  if (typeof structuredClone === 'function') {
    return structuredClone(model);
  }
  return JSON.parse(JSON.stringify(model)) as LessonEditorModel;
}

export interface LessonEditorContext {
  lessonModel: Ref<LessonEditorModel | null>;
  setLessonModel: (value: LessonEditorModel | null) => void;
  tagsField: WritableComputedRef<string>;
  useArrayField: (field: LessonArrayField) => WritableComputedRef<string>;
}

export function useLessonEditorModel(
  initialValue: LessonEditorModel | null = null
): LessonEditorContext {
  const lessonModel = ref<LessonEditorModel | null>(initialValue ? cloneModel(initialValue) : null);

  function setLessonModel(value: LessonEditorModel | null) {
    lessonModel.value = value ? cloneModel(value) : null;
  }

  const tagsField = computed({
    get() {
      if (!lessonModel.value?.tags) return '';
      return lessonModel.value.tags.join('\n');
    },
    set(value: string) {
      if (!lessonModel.value) return;
      const tags = value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      lessonModel.value.tags = tags;
    },
  });

  function useArrayField(field: LessonArrayField) {
    return computed({
      get() {
        const list = lessonModel.value?.[field];
        if (!Array.isArray(list)) return '';
        return list.join('\n');
      },
      set(value: string) {
        if (!lessonModel.value) return;
        const items = value
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        lessonModel.value[field] = items;
      },
    });
  }

  return {
    lessonModel,
    setLessonModel,
    tagsField,
    useArrayField,
  };
}

export function resolveLessonBlockEditor(block: LessonBlock | null | undefined): Component {
  if (!block || typeof block !== 'object') {
    return GenericJsonBlockEditor;
  }

  const type = block.type;
  if (type && type in blockEditorRegistry) {
    return blockEditorRegistry[type as keyof BlockEditorRegistry];
  }

  return GenericJsonBlockEditor;
}

export {
  MetadataListEditor,
  LessonPlanEditor,
  CalloutEditor,
  CardGridEditor,
  ContentBlockEditor,
  GenericJsonBlockEditor as UnsupportedBlockEditor,
};
export type { LessonBlock };

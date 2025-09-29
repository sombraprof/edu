export const LESSON_FORMAT_VERSION = 'md3.lesson.v1' as const;

export type LessonFormatVersion = typeof LESSON_FORMAT_VERSION;

export type LessonModality = 'in-person' | 'remote' | 'hybrid' | 'async';

export interface LessonResourceLink {
  label: string;
  url?: string;
  type?: string;
  [key: string]: unknown;
}

export interface LessonAssessment {
  type?: string;
  description?: string;
  rubric?: string;
  [key: string]: unknown;
}

export interface LessonMetadata {
  status?: 'draft' | 'in-review' | 'published' | string;
  updatedAt?: string;
  owners?: string[];
  sources?: string[];
  [key: string]: unknown;
}

export interface LessonBlock {
  type: string;
  [key: string]: unknown;
}

export interface NormalizedLesson {
  formatVersion?: LessonFormatVersion | string;
  id: string;
  slug?: string;
  title: string;
  summary?: string;
  objective?: string;
  objectives?: string[];
  competencies?: string[];
  skills?: string[];
  outcomes?: string[];
  prerequisites?: string[];
  tags?: string[];
  duration?: number;
  modality?: LessonModality | string;
  resources?: LessonResourceLink[];
  bibliography?: string[];
  assessment?: LessonAssessment;
  content: LessonBlock[];
  metadata?: LessonMetadata;
  [key: string]: unknown;
}

export interface LessonsIndexEntry {
  id: string;
  title: string;
  file: string;
  available: boolean;
  description?: string;
  summary?: string;
  duration?: number;
  tags?: string[];
  formatVersion?: LessonFormatVersion;
}

export interface GenerationMetadata {
  generatedBy: string;
  model: string;
  timestamp: string;
}

export interface ExerciseIndexEntry {
  id: string;
  title: string;
  description: string;
  type?: string;
  link?: string;
  file?: string;
  available?: boolean;
  metadata: GenerationMetadata;
  [key: string]: unknown;
}

export type SupplementType = 'reading' | 'lab' | 'project' | 'slide' | 'video' | 'reference';

export interface SupplementIndexEntry {
  id: string;
  title: string;
  description?: string;
  type: SupplementType;
  link?: string;
  file?: string;
  available?: boolean;
  metadata: GenerationMetadata;
  [key: string]: unknown;
}

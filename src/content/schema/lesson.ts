import type { EmbedProviderId, EmbedTheme, EmbedViewMode } from '@/utils/embedWhitelist';

export type DesignEmbedProviderId = 'figma' | 'miro' | 'framer';

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

export interface DefinitionCardBlock extends LessonBlock {
  type: 'definitionCard';
  term: string;
  definition: string;
  source?: string;
  sourceUrl?: string;
}

export interface ComparativeTableRow {
  label: string;
  values: string[];
}

export interface ComparativeTableBlock extends LessonBlock {
  type: 'comparativeTable';
  headers: string[];
  rows: ComparativeTableRow[];
  title?: string;
  description?: string;
  caption?: string;
  leadingColumnLabel?: string;
}

export interface SystemDiagramNode {
  id: string;
  label: string;
  description?: string;
}

export interface SystemDiagramConnection {
  from: string;
  to: string;
  label?: string;
}

export interface SystemDiagramBlock extends LessonBlock {
  type: 'systemDiagram';
  nodes: SystemDiagramNode[];
  connections?: SystemDiagramConnection[];
  title?: string;
  summary?: string;
  legend?: string[];
}

export interface CodeChallengeOption {
  id: string;
  text: string;
}

export interface CodeChallengeBlock extends LessonBlock {
  type: 'codeChallenge';
  prompt: string;
  code?: string;
  language?: string;
  question?: string;
  options?: CodeChallengeOption[];
  answerExplanation?: string;
}

export interface MemoryVisualizerEntry {
  label: string;
  value: string;
}

export interface MemoryVisualizerBlock extends LessonBlock {
  type: 'memoryVisualizer';
  stack?: MemoryVisualizerEntry[];
  heap?: MemoryVisualizerEntry[];
  title?: string;
  summary?: string;
  notes?: string;
}

export interface CaseStudyDataPoint {
  label: string;
  value: string;
}

export interface CaseStudyBlock extends LessonBlock {
  type: 'caseStudy';
  scenario: string;
  title?: string;
  background?: string;
  dataPoints?: CaseStudyDataPoint[];
  questions?: string[];
  tasks?: string[];
}

export type StatTrend = 'up' | 'down' | 'neutral';

export interface StatCardBlock extends LessonBlock {
  type: 'statCard';
  label: string;
  value: string;
  context?: string;
  source?: string;
  trend?: StatTrend;
}

export interface KnowledgeCheckOption {
  id: string;
  text: string;
}

export interface KnowledgeCheckBlock extends LessonBlock {
  type: 'knowledgeCheck';
  prompt: string;
  options: KnowledgeCheckOption[];
  title?: string;
  explanation?: string;
  allowMultiple?: boolean;
}

export interface InteractiveDemoBlock extends LessonBlock {
  type: 'interactiveDemo';
  url: string;
  title?: string;
  description?: string;
  height?: number;
  provider?: EmbedProviderId;
  page?: EmbedViewMode;
  theme?: EmbedTheme;
}

export interface DesignEmbedBlock extends LessonBlock {
  type: 'designEmbed';
  url: string;
  title?: string;
  description?: string;
  provider?: DesignEmbedProviderId;
  page?: EmbedViewMode;
  theme?: EmbedTheme;
  height?: number;
  hints?: string[];
}

export type PedagogicalNoteAudience = 'teacher' | 'student' | 'team';

export interface PedagogicalNoteBlock extends LessonBlock {
  type: 'pedagogicalNote';
  content: string;
  title?: string;
  audience?: PedagogicalNoteAudience;
}

export interface PromptTipBlock extends LessonBlock {
  type: 'promptTip';
  prompt: string;
  title?: string;
  description?: string;
  tips?: string[];
  tags?: string[];
  audience?: string;
}

export interface CodeSubmissionTestCase {
  name: string;
  input?: string;
  expectedOutput?: string;
}

export interface CodeSubmissionBlock extends LessonBlock {
  type: 'codeSubmission';
  prompt: string;
  title?: string;
  language?: string;
  boilerplate?: string;
  tests?: CodeSubmissionTestCase[];
  tips?: string[];
}

export interface DualAssessmentBlock extends LessonBlock {
  type: 'dualAssessment';
  title?: string;
  summary?: string;
  theory: Omit<KnowledgeCheckBlock, keyof LessonBlock> & {
    type?: 'knowledgeCheck';
  };
  practice: Omit<CodeSubmissionBlock, keyof LessonBlock> & {
    type?: 'codeSubmission';
  };
}

export interface DragAndDropStep {
  id: string;
  label: string;
  description?: string;
}

export interface DragAndDropBlock extends LessonBlock {
  type: 'dragAndDrop';
  steps: DragAndDropStep[];
  title?: string;
  instructions?: string;
}

export interface ConceptMapperNode {
  id: string;
  label: string;
  category?: string;
  details?: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface ConceptMapperRelationship {
  from: string;
  to: string;
  label?: string;
}

export interface ConceptMapperLayoutOptions {
  type?: 'auto' | 'preset';
  force?: {
    linkDistance?: number;
    chargeStrength?: number;
    collisionRadius?: number;
  };
}

export interface ConceptMapperBlock extends LessonBlock {
  type: 'conceptMapper';
  nodes: ConceptMapperNode[];
  description?: string;
  title?: string;
  relationships?: ConceptMapperRelationship[];
  layout?: ConceptMapperLayoutOptions;
}

export interface BugFixChallengeBlock extends LessonBlock {
  type: 'bugFixChallenge';
  code: string;
  title?: string;
  description?: string;
  language?: string;
  hints?: number[];
  guidance?: string[];
}

export type DataEntryFieldType = 'text' | 'number' | 'email' | 'date' | 'select';

export interface DataEntryField {
  id: string;
  label: string;
  type?: DataEntryFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface DataEntryFormBlock extends LessonBlock {
  type: 'dataEntryForm';
  fields: DataEntryField[];
  title?: string;
  description?: string;
  submitLabel?: string;
}

export interface ScenarioBuilderBlock extends LessonBlock {
  type: 'scenarioBuilder';
  inputs: string[];
  processes: string[];
  outputs: string[];
  title?: string;
  description?: string;
  guidingQuestions?: string[];
}

export interface PeerReviewCriterion {
  id: string;
  label: string;
  description?: string;
}

export interface PeerReviewTaskBlock extends LessonBlock {
  type: 'peerReviewTask';
  criteria: PeerReviewCriterion[];
  title?: string;
  description?: string;
  steps?: string[];
  dueDate?: string;
}

export type TestGeneratorDifficulty = 'easy' | 'medium' | 'hard';

export interface TestGeneratorBlock extends LessonBlock {
  type: 'testGenerator';
  tags: string[];
  title?: string;
  description?: string;
  difficulties?: TestGeneratorDifficulty[];
}

export interface RubricLevelDescriptor {
  level: string;
  description: string;
}

export interface RubricCriterion {
  criterion: string;
  levels: RubricLevelDescriptor[];
}

export interface RubricAggregatedScore {
  criterion?: string;
  value: number;
}

export interface RubricLevelDistributionRow {
  level: string;
  values: number[];
}

export interface RubricAggregatedData {
  chart?: 'auto' | 'radar' | 'heatmap';
  scores: Array<number | RubricAggregatedScore>;
  weights?: number[];
  levelDistribution?: RubricLevelDistributionRow[];
}

export interface RubricDisplayBlock extends LessonBlock {
  type: 'rubricDisplay';
  criteria: RubricCriterion[];
  title?: string;
  description?: string;
  aggregated?: RubricAggregatedData;
}

export interface SelfAssessmentPrompt {
  id: string;
  label: string;
  placeholder?: string;
}

export interface SelfAssessmentBlock extends LessonBlock {
  type: 'selfAssessment';
  prompts: SelfAssessmentPrompt[];
  title?: string;
  description?: string;
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

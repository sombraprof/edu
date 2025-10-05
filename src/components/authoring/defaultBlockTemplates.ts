import type { LessonBlock } from '@/components/lesson/blockRegistry';

function paragraph(text = ' ') {
  return { type: 'paragraph', text };
}

export const defaultBlockTemplates: Readonly<Record<string, LessonBlock>> = Object.freeze({
  contentBlock: {
    type: 'contentBlock',
    title: '',
    content: [paragraph()],
  },
  lessonPlan: {
    type: 'lessonPlan',
    title: '',
    unit: { title: '', content: '' },
    cards: [{ title: '', content: ' ' }],
  },
  callout: {
    type: 'callout',
    variant: 'info',
    title: '',
    content: '',
  },
  cardGrid: {
    type: 'cardGrid',
    title: '',
    description: '',
    cards: [
      {
        title: '',
        subtitle: '',
        body: '',
        items: [],
        actions: [],
      },
    ],
  },
  html: { type: 'html', html: '' },
  code: { type: 'code', language: 'plaintext', code: '' },
  videosBlock: {
    type: 'videosBlock',
    title: '',
    videos: [{ title: '', url: '' }],
  },
  videos: {
    type: 'videos',
    title: '',
    videos: [{ title: '', url: '' }],
  },
  checklist: {
    type: 'checklist',
    title: '',
    description: '',
    items: [''],
  },
  bibliography: {
    type: 'bibliography',
    title: '',
    items: [''],
  },
  bibliographyBlock: {
    type: 'bibliographyBlock',
    title: '',
    items: [''],
  },
  roadmap: {
    type: 'roadmap',
    steps: [{ title: '', description: '' }],
  },
  timeline: {
    type: 'timeline',
    title: '',
    description: '',
    steps: [{ title: '', content: '' }],
  },
  flightPlan: {
    type: 'flightPlan',
    title: '',
    items: [''],
  },
  accordion: {
    type: 'accordion',
    items: [{ title: '', content: '' }],
  },
  representations: {
    type: 'representations',
    title: '',
    description: '',
    items: [{ title: '', content: '' }],
  },
  quiz: {
    type: 'quiz',
    title: '',
    question: '',
    options: [
      { id: 'option-1', text: ' ', correct: true },
      { id: 'option-2', text: ' ', correct: false },
    ],
    allowRetry: true,
    feedback: { correct: '', incorrect: '' },
  },
  multipleChoice: {
    type: 'multipleChoice',
    title: '',
    question: '',
    multiple: true,
    options: [
      { id: 'option-1', text: ' ', correct: true },
      { id: 'option-2', text: ' ', correct: false },
    ],
    allowRetry: true,
    feedback: { correct: '', incorrect: '' },
  },
  flashcards: {
    type: 'flashcards',
    title: '',
    cards: [{ front: '', back: '' }],
  },
  resourceGallery: {
    type: 'resourceGallery',
    title: '',
    description: '',
    items: [
      {
        id: 'resource-1',
        type: 'article',
        title: '',
        url: '',
      },
    ],
  },
  stepper: {
    type: 'stepper',
    title: '',
    steps: [{ title: '', description: '' }],
  },
  tabs: {
    type: 'tabs',
    title: '',
    tabs: [{ id: 'tab-1', label: 'Nova aba', content: '' }],
  },
  glossary: {
    type: 'glossary',
    title: '',
    terms: [{ term: '', definition: '' }],
  },
  parsons: {
    type: 'parsons',
    title: '',
    prompt: '',
    lines: [''],
  },
  parsonsPuzzle: {
    type: 'parsonsPuzzle',
    title: '',
    prompt: '',
    lines: [''],
  },
  knowledgeCheck: {
    type: 'knowledgeCheck',
    prompt: '',
    options: [
      { id: 'option-1', text: ' ', correct: true },
      { id: 'option-2', text: ' ', correct: false },
    ],
    explanation: '',
  },
  codeChallenge: {
    type: 'codeChallenge',
    prompt: '',
    question: '',
    options: [
      { id: 'option-1', text: '', correct: true },
      { id: 'option-2', text: '', correct: false },
    ],
    answerExplanation: '',
  },
  interactiveDemo: {
    type: 'interactiveDemo',
    title: '',
    url: '',
    description: '',
  },
  pedagogicalNote: {
    type: 'pedagogicalNote',
    title: '',
    content: '',
  },
  promptTip: {
    type: 'promptTip',
    title: '',
    description: '',
    audience: '',
    prompt: '',
    tags: [''],
    tips: [''],
  },
  codeSubmission: {
    type: 'codeSubmission',
    title: '',
    description: '',
    language: 'plaintext',
    starterCode: '',
    tests: [''],
  },
  dragAndDrop: {
    type: 'dragAndDrop',
    title: '',
    prompt: '',
    items: [{ id: 'item-1', label: '', target: 'target-1' }],
    targets: [{ id: 'target-1', label: '' }],
  },
  conceptMapper: {
    type: 'conceptMapper',
    title: '',
    concepts: [{ id: 'concept-1', label: '' }],
    relationships: [{ from: 'concept-1', to: 'concept-1', label: '' }],
  },
  bugFixChallenge: {
    type: 'bugFixChallenge',
    title: '',
    description: '',
    buggyCode: '',
    tests: [''],
  },
  dataEntryForm: {
    type: 'dataEntryForm',
    title: '',
    description: '',
    fields: [{ id: 'field-1', label: '', type: 'text', required: false }],
  },
  scenarioBuilder: {
    type: 'scenarioBuilder',
    title: '',
    description: '',
    personas: [{ id: 'persona-1', name: '', description: '' }],
    steps: [{ id: 'step-1', title: '', description: '' }],
  },
  peerReviewTask: {
    type: 'peerReviewTask',
    title: '',
    description: '',
    rubric: {
      criteria: [
        {
          id: 'criterion-1',
          description: '',
          scale: [''],
        },
      ],
    },
  },
  testGenerator: {
    type: 'testGenerator',
    title: '',
    description: '',
    inputs: [''],
  },
  rubricDisplay: {
    type: 'rubricDisplay',
    title: '',
    criteria: [
      {
        id: 'criterion-1',
        description: '',
        levels: [{ id: 'level-1', label: '', description: '' }],
      },
    ],
  },
  selfAssessment: {
    type: 'selfAssessment',
    title: '',
    description: '',
    questions: [{ id: 'question-1', prompt: '', scale: [''] }],
  },
  component: {
    type: 'component',
    component: 'Md3Table',
    props: {
      headers: ['', ''],
      rows: [['', '']],
    },
  },
});

export type DefaultBlockType = keyof typeof defaultBlockTemplates;

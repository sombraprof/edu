#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createRequire } from 'node:module';
import { MANIFEST_VERSION, getManifestEntries, readManifest } from './utils/manifest.mjs';

const require = createRequire(import.meta.url);
const lessonSchema = require('../schemas/lesson.schema.json');
const lessonsIndexSchema = require('../schemas/lessons-index.schema.json');
const exercisesIndexSchema = require('../schemas/exercises-index.schema.json');
const supplementsIndexSchema = require('../schemas/supplements-index.schema.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const contentRoot = path.join(repoRoot, 'src', 'content', 'courses');
const DEFAULT_REPORT_PATH = path.join('reports', 'content-validation-report.json');

const args = process.argv.slice(2);
const reportPath = resolveReportPath(args);

const LESSON_ID_PATTERN = '^lesson-[0-9]{2,}$';
const SUPPLEMENT_TYPES = ['reading', 'lab', 'project', 'slide', 'video', 'reference'];

const SUPPORTED_BLOCK_TYPES = [
  'html',
  'code',
  'lessonPlan',
  'contentBlock',
  'videos',
  'videosBlock',
  'checklist',
  'bibliography',
  'bibliographyBlock',
  'cardGrid',
  'callout',
  'timeline',
  'flightPlan',
  'accordion',
  'representations',
  'comparativeTable',
  'truthTable',
  'roadmap',
  'audio',
  'audioBlock',
  'md3Table',
  'md3Flowchart',
  'classDesigner',
  'pipelineCanvas',
  'systemMapper',
  'balancedScorecard',
  'component',
  'legacySection',
  'bugFixChallenge',
  'codeChallenge',
  // New MD3 blocks
  'resourceGallery',
  'quiz',
  'multipleChoice',
  'flashcards',
  'imageFigure',
  'stepper',
  'tabs',
  'glossary',
  'parsons',
  'parsonsPuzzle',
  'scenarioMatrix',
  'spriteSheet',
  'crcCards',
  'apiEndpoints',
  'promptTip',
  'whiteboard',
  'interactiveDemo',
];

const LEGACY_BLOCK_TYPES = ['dragAndDrop', 'fileTree', 'quiz'];

const SUPPORTED_CUSTOM_COMPONENTS = [
  'Md3Table',
  'Md3LogicOperators',
  'Md3BlockDiagram',
  'Md3Flowchart',
  'Md3CodeSample',
  'MemoryDiagram',
  'OrderedList',
  'Md3Checklist',
  'Md3Callout',
  'CardGrid',
  'ClassDesigner',
  'PipelineCanvas',
  'SystemMapper',
  'BalancedScorecard',
  // New components
  'QuizBlock',
  'Flashcards',
  'ResourceGallery',
  'Stepper',
  'TabsBlock',
  'Glossary',
  'ParsonsPuzzle',
  'ScenarioMatrix',
  'SpriteSheetViewer',
  'CRCCards',
  'ApiEndpoints',
  'PromptTip',
  'WhiteboardBlock',
  'SelfAssessment',
  'CodeSubmission',
];

const ALLOWED_CALLOUT_VARIANTS = new Set([
  'info',
  'good-practice',
  'academic',
  'warning',
  'task',
  'error',
]);

const ALLOWED_CARD_GRID_TONES = new Set([
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'danger',
  'neutral',
]);

const ALLOWED_CARD_GRID_VARIANTS = new Set([
  ...ALLOWED_CALLOUT_VARIANTS,
  ...ALLOWED_CARD_GRID_TONES,
  'best-practice',
]);

const ALLOWED_LESSON_PLAN_ICONS = new Set([
  'bullseye',
  'target',
  'gears',
  'settings',
  'desktop',
  'monitor',
  'check-circle',
  'users',
  'book-open',
  'code',
  'database',
  'cpu',
  'calendar-days',
  'clock',
  'graduation-cap',
  'tasks',
]);

const ALLOWED_INSTITUTIONS = new Set(['Unichristus', 'Unifametro']);
const MIN_META_DESCRIPTION_LENGTH = 60;
const MIN_META_TITLE_LENGTH = 8;

const ALLOWED_EMBED_PROVIDERS = new Set([
  'figma',
  'miro',
  'canva',
  'google-slides',
  'powerpoint-online',
]);

const ALLOWED_EMBED_PAGES = new Set(['embed', 'present', 'preview', 'view', 'board']);
const ALLOWED_EMBED_THEMES = new Set(['light', 'dark', 'auto']);

const blockValidators = {
  html: requireStringField('html', 'Bloco "html" requer o campo "html" com conteúdo.'),
  code: (block, context) => {
    if (
      requireStringField('code', 'Bloco "code" requer o campo "code" com conteúdo.')(block, context)
    ) {
      const language = block.language;
      if (language !== undefined && typeof language !== 'string') {
        pushBlockProblem(context, 'Campo "language" deve ser uma string quando presente.');
      }
    }
  },
  bugFixChallenge(block, context) {
    requireStringField('title', 'Bloco "bugFixChallenge" requer o campo "title".')(block, context);
    requireStringField(
      'description',
      'Bloco "bugFixChallenge" requer o campo "description" com conteúdo.'
    )(block, context);
    requireStringField('code', 'Bloco "bugFixChallenge" requer o campo "code" com conteúdo.')(
      block,
      context
    );

    if (!isNonEmptyString(block.language)) {
      pushBlockProblem(
        context,
        'Campo "language" do bloco "bugFixChallenge" deve ser uma string não vazia.'
      );
    }

    const hints = block.hints;
    if (!Array.isArray(hints) || hints.length === 0) {
      pushBlockProblem(
        context,
        'Bloco "bugFixChallenge" requer "hints" como array com os números de linha problemáticos.'
      );
    } else {
      hints.forEach((hint, index) => {
        if (typeof hint !== 'number' || !Number.isFinite(hint)) {
          pushBlockProblem(
            context,
            `Valor em "hints[${index}]" deve ser um número indicando a linha com erro.`
          );
        }
      });
    }

    const guidance = block.guidance;
    if (!Array.isArray(guidance) || guidance.length === 0) {
      pushBlockProblem(
        context,
        'Bloco "bugFixChallenge" requer "guidance" com pelo menos uma estratégia de diagnóstico.'
      );
    } else {
      guidance.forEach((item, index) => {
        if (!isNonEmptyString(item)) {
          pushBlockProblem(
            context,
            `Entrada em "guidance[${index}]" deve ser uma string não vazia descrevendo uma estratégia.`
          );
        }
      });
    }
  },
  codeChallenge(block, context) {
    requireStringField('prompt', 'Bloco "codeChallenge" requer o campo "prompt" com enunciado.')(
      block,
      context
    );

    if (block.title !== undefined && typeof block.title !== 'string') {
      pushBlockProblem(
        context,
        'Campo "title" do bloco "codeChallenge" deve ser uma string quando presente.'
      );
    }

    if (block.code !== undefined && !isNonEmptyString(block.code)) {
      pushBlockProblem(
        context,
        'Campo "code" do bloco "codeChallenge" deve ser uma string não vazia quando presente.'
      );
    }

    if (block.language !== undefined && typeof block.language !== 'string') {
      pushBlockProblem(
        context,
        'Campo "language" do bloco "codeChallenge" deve ser uma string quando presente.'
      );
    }

    if (block.question !== undefined && !isNonEmptyString(block.question)) {
      pushBlockProblem(
        context,
        'Campo "question" do bloco "codeChallenge" deve ser uma string não vazia quando presente.'
      );
    }

    const options = normalizeArray(block.options);
    if (options.length > 0) {
      if (!isNonEmptyString(block.question)) {
        pushBlockProblem(
          context,
          'Bloco "codeChallenge" com alternativas deve informar o campo "question" com texto.'
        );
      }
      if (options.length < 2) {
        pushBlockProblem(
          context,
          'Bloco "codeChallenge" requer pelo menos duas opções quando "options" é informado.'
        );
      }
    }

    options.forEach((option, optionIndex) => {
      if (!isPlainObject(option)) {
        pushBlockProblem(
          context,
          `Entrada options[${optionIndex}] do bloco "codeChallenge" deve ser um objeto com "id" e "text".`
        );
        return;
      }
      if (!isNonEmptyString(option.id)) {
        pushBlockProblem(
          context,
          `Campo "options[${optionIndex}].id" deve ser uma string não vazia.`
        );
      }
      if (!isNonEmptyString(option.text)) {
        pushBlockProblem(
          context,
          `Campo "options[${optionIndex}].text" deve ser uma string não vazia.`
        );
      }
    });

    if (block.answerExplanation !== undefined && !isNonEmptyString(block.answerExplanation)) {
      pushBlockProblem(
        context,
        'Campo "answerExplanation" do bloco "codeChallenge" deve ser uma string não vazia quando presente.'
      );
    }
  },
  lessonPlan(block, context) {
    const hasTitle = requireStringField('title', 'Bloco "lessonPlan" requer o campo "title".')(
      block,
      context
    );
    const unit = block.unit;
    if (unit !== undefined) {
      if (!isPlainObject(unit)) {
        pushBlockProblem(context, 'Campo "unit" deve ser um objeto com "title" e "content".');
      } else {
        if (!isNonEmptyString(unit.title)) {
          pushBlockProblem(context, 'Campo "unit.title" deve ser uma string não vazia.');
        }
        if (!isNonEmptyString(unit.content)) {
          pushBlockProblem(context, 'Campo "unit.content" deve ser uma string não vazia.');
        }
      }
    }

    const cards = normalizeArray(block.cards);
    const content = normalizeArray(block.content);

    if (!unit && cards.length === 0 && content.length === 0 && hasTitle) {
      pushBlockProblem(
        context,
        'Bloco "lessonPlan" deve informar "unit", "cards" ou "content" com pelo menos um item.'
      );
    }

    validateLessonPlanIcons(cards, 'cards', context);
    validateLessonPlanIcons(content, 'content', context);
  },
  contentBlock(block, context) {
    requireStringField('title', 'Bloco "contentBlock" requer o campo "title".')(block, context);
    const content = normalizeArray(block.content);
    if (content.length === 0) {
      pushBlockProblem(
        context,
        'Bloco "contentBlock" requer o array "content" com ao menos um item.'
      );
    }
  },
  imageFigure(block, context) {
    validateImageFigureBlock(block, context);
  },
  videos: validateVideoBlock,
  videosBlock: validateVideoBlock,
  checklist(block, context) {
    requireStringField('title', 'Bloco "checklist" requer o campo "title".')(block, context);
    const items = normalizeArray(block.items);
    if (items.length === 0) {
      pushBlockProblem(context, 'Bloco "checklist" requer o array "items" com itens de checklist.');
    }
  },
  bibliography(block, context) {
    validateBibliographyBlock(block, context);
  },
  bibliographyBlock(block, context) {
    validateBibliographyBlock(block, context);
  },
  cardGrid(block, context) {
    validateCardGridBlock(block, context);
  },
  callout(block, context) {
    if (!hasRenderableContent(block.content)) {
      pushBlockProblem(
        context,
        'Bloco "callout" requer o campo "content" com texto ou conteúdo estruturado.'
      );
    }
    if (block.title !== undefined && typeof block.title !== 'string') {
      pushBlockProblem(
        context,
        'Campo "title" do bloco "callout" deve ser string quando presente.'
      );
    }
    if (block.variant !== undefined && typeof block.variant !== 'string') {
      pushBlockProblem(
        context,
        'Campo "variant" do bloco "callout" deve ser string quando presente.'
      );
    } else if (typeof block.variant === 'string') {
      const normalized = block.variant.trim().toLowerCase();
      if (!ALLOWED_CALLOUT_VARIANTS.has(normalized)) {
        pushBlockProblem(
          context,
          `Valor de "variant" inválido ("${block.variant}"). Use um dos valores: ${[
            ...ALLOWED_CALLOUT_VARIANTS,
          ]
            .map((value) => `"${value}"`)
            .join(', ')}.`
        );
      } else if (normalized !== block.variant) {
        pushBlockProblem(
          context,
          `Valor de "variant" deve usar o formato canônico "${normalized}" para manter a nomenclatura consistente.`
        );
      }
    }
  },
  timeline(block, context) {
    requireStringField('title', 'Bloco "timeline" requer o campo "title".')(block, context);
    const steps = normalizeArray(block.steps);
    if (steps.length === 0) {
      pushBlockProblem(
        context,
        'Bloco "timeline" requer o array "steps" com pelo menos uma etapa.'
      );
      return;
    }
    steps.forEach((step, stepIndex) => {
      if (!isPlainObject(step)) {
        pushBlockProblem(
          context,
          `Etapa steps[${stepIndex}] do bloco "timeline" deve ser um objeto com "title" e "content".`
        );
        return;
      }
      if (!isNonEmptyString(step.title)) {
        pushBlockProblem(
          context,
          `Etapa steps[${stepIndex}] do bloco "timeline" requer o campo "title" não vazio.`
        );
      }
      if (!isNonEmptyString(step.content)) {
        pushBlockProblem(
          context,
          `Etapa steps[${stepIndex}] do bloco "timeline" requer o campo "content" não vazio.`
        );
      }
    });
  },
  flightPlan(block, context) {
    requireStringField('title', 'Bloco "flightPlan" requer o campo "title".')(block, context);
    const items = normalizeArray(block.items);
    if (items.length === 0) {
      pushBlockProblem(context, 'Bloco "flightPlan" requer o array "items" com ao menos um item.');
    }
  },
  accordion(block, context) {
    const items = normalizeArray(block.items);
    if (items.length === 0) {
      pushBlockProblem(context, 'Bloco "accordion" requer o array "items" com pelo menos um item.');
      return;
    }
    items.forEach((item, itemIndex) => {
      if (!isPlainObject(item)) {
        pushBlockProblem(
          context,
          `Item items[${itemIndex}] do bloco "accordion" deve ser um objeto com "title" e "content".`
        );
        return;
      }
      if (!isNonEmptyString(item.title)) {
        pushBlockProblem(
          context,
          `Item items[${itemIndex}] do bloco "accordion" requer o campo "title" não vazio.`
        );
      }
      if (!hasRenderableContent(item.content)) {
        pushBlockProblem(
          context,
          `Item items[${itemIndex}] do bloco "accordion" requer o campo "content" com texto ou conteúdo estruturado.`
        );
      }
    });
  },
  representations(block, context) {
    requireStringField('title', 'Bloco "representations" requer o campo "title".')(block, context);
    const items = normalizeArray(block.items);
    if (items.length === 0) {
      pushBlockProblem(
        context,
        'Bloco "representations" requer o array "items" com pelo menos um elemento.'
      );
      return;
    }
    items.forEach((item, itemIndex) => {
      if (!isPlainObject(item)) {
        pushBlockProblem(
          context,
          `Item items[${itemIndex}] do bloco "representations" deve ser um objeto com "title" e "content".`
        );
        return;
      }
      if (!isNonEmptyString(item.title)) {
        pushBlockProblem(
          context,
          `Item items[${itemIndex}] do bloco "representations" requer o campo "title" não vazio.`
        );
      }
      if (!isNonEmptyString(item.content)) {
        pushBlockProblem(
          context,
          `Item items[${itemIndex}] do bloco "representations" requer o campo "content" não vazio.`
        );
      }
    });
  },
  truthTable(block, context) {
    requireStringField('title', 'Bloco "truthTable" requer o campo "title".')(block, context);
    const headers = normalizeArray(block.headers);
    if (headers.length === 0) {
      pushBlockProblem(
        context,
        'Bloco "truthTable" requer o array "headers" com pelo menos um item.'
      );
    }
    const rows = normalizeArray(block.rows);
    if (rows.length === 0) {
      pushBlockProblem(
        context,
        'Bloco "truthTable" requer o array "rows" com pelo menos uma linha.'
      );
      return;
    }
    rows.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        pushBlockProblem(
          context,
          `Linha rows[${rowIndex}] do bloco "truthTable" deve ser um array com valores ou objetos de célula.`
        );
        return;
      }
      if (headers.length > 0 && row.length !== headers.length) {
        pushBlockProblem(
          context,
          `Linha rows[${rowIndex}] do bloco "truthTable" deve ter ${headers.length} colunas para alinhar com os cabeçalhos.`
        );
      }
    });
  },
  audio(block, context) {
    validateAudioBlock(block, context);
  },
  audioBlock(block, context) {
    validateAudioBlock(block, context);
  },
  md3Table(block, context) {
    const headers = normalizeArray(block.headers);
    if (headers.length === 0) {
      pushBlockProblem(
        context,
        'Bloco "md3Table" requer o array "headers" com pelo menos um item.'
      );
    }
    const rows = normalizeArray(block.rows);
    if (rows.length === 0) {
      pushBlockProblem(context, 'Bloco "md3Table" requer o array "rows" com pelo menos uma linha.');
    }
  },
  legacySection(block, context) {
    requireStringField('html', 'Bloco "legacySection" requer o campo "html" com conteúdo.')(
      block,
      context
    );
  },
  promptTip(block, context) {
    requireStringField('prompt', 'Bloco "promptTip" requer o campo "prompt" com texto.')(
      block,
      context
    );

    if (block.title !== undefined && typeof block.title !== 'string') {
      pushBlockProblem(
        context,
        'Campo "title" do bloco "promptTip" deve ser string quando presente.'
      );
    }

    if (block.description !== undefined && typeof block.description !== 'string') {
      pushBlockProblem(
        context,
        'Campo "description" do bloco "promptTip" deve ser string quando presente.'
      );
    }

    if (block.audience !== undefined && typeof block.audience !== 'string') {
      pushBlockProblem(
        context,
        'Campo "audience" do bloco "promptTip" deve ser string quando presente.'
      );
    }

    if (block.tags !== undefined) {
      if (!Array.isArray(block.tags)) {
        pushBlockProblem(
          context,
          'Campo "tags" do bloco "promptTip" deve ser um array de strings.'
        );
      } else {
        block.tags.forEach((tag, index) => {
          if (!isNonEmptyString(tag)) {
            pushBlockProblem(
              context,
              `tags[${index}]: valores do bloco "promptTip" devem ser strings não vazias.`
            );
          }
        });
      }
    }

    if (block.tips !== undefined) {
      if (!Array.isArray(block.tips)) {
        pushBlockProblem(
          context,
          'Campo "tips" do bloco "promptTip" deve ser um array de strings.'
        );
      } else {
        block.tips.forEach((tip, index) => {
          if (!isNonEmptyString(tip)) {
            pushBlockProblem(
              context,
              `tips[${index}]: valores do bloco "promptTip" devem ser strings não vazias.`
            );
          }
        });
      }
    }
  },
  interactiveDemo(block, context) {
    const hasUrl = requireStringField('url', 'Bloco "interactiveDemo" requer o campo "url".')(
      block,
      context
    );

    if (hasUrl && typeof block.url === 'string') {
      try {
        new URL(block.url);
      } catch {
        pushBlockProblem(context, 'Campo "url" deve ser uma URL válida.');
      }
    }

    if (block.height !== undefined && typeof block.height !== 'number') {
      pushBlockProblem(context, 'Campo "height" deve ser numérico quando presente.');
    }

    if (block.provider !== undefined) {
      if (typeof block.provider !== 'string') {
        pushBlockProblem(context, 'Campo "provider" deve ser uma string quando presente.');
      } else if (!ALLOWED_EMBED_PROVIDERS.has(block.provider)) {
        pushBlockProblem(
          context,
          `Valor de "provider" inválido ("${block.provider}"). Utilize um dos valores: ${[
            ...ALLOWED_EMBED_PROVIDERS,
          ]
            .map((value) => `"${value}"`)
            .join(', ')}.`
        );
      }
    }

    if (block.page !== undefined) {
      if (typeof block.page !== 'string') {
        pushBlockProblem(context, 'Campo "page" deve ser uma string quando presente.');
      } else if (!ALLOWED_EMBED_PAGES.has(block.page)) {
        pushBlockProblem(
          context,
          `Valor de "page" inválido ("${block.page}"). Utilize um dos valores: ${[
            ...ALLOWED_EMBED_PAGES,
          ]
            .map((value) => `"${value}"`)
            .join(', ')}.`
        );
      }
    }

    if (block.theme !== undefined) {
      if (typeof block.theme !== 'string') {
        pushBlockProblem(context, 'Campo "theme" deve ser uma string quando presente.');
      } else if (!ALLOWED_EMBED_THEMES.has(block.theme)) {
        pushBlockProblem(
          context,
          `Valor de "theme" inválido ("${block.theme}"). Utilize um dos valores: ${[
            ...ALLOWED_EMBED_THEMES,
          ]
            .map((value) => `"${value}"`)
            .join(', ')}.`
        );
      }
    }
  },
};

function validateVideoBlock(block, context) {
  requireStringField('title', 'Bloco de vídeos requer o campo "title".')(block, context);
  const videos = normalizeArray(block.videos);
  if (videos.length === 0) {
    pushBlockProblem(context, 'Bloco de vídeos requer o array "videos" com pelo menos um item.');
    return;
  }
  videos.forEach((video, videoIndex) => {
    if (!isPlainObject(video)) {
      pushBlockProblem(
        context,
        `Item videos[${videoIndex}] deve ser um objeto com "src", "url" ou "youtubeId".`
      );
      return;
    }
    const hasSrc = isNonEmptyString(video.src);
    const hasUrl = isNonEmptyString(video.url);
    const hasYoutubeId = isNonEmptyString(video.youtubeId);
    if (!hasSrc && !hasUrl && !hasYoutubeId) {
      pushBlockProblem(
        context,
        `Item videos[${videoIndex}] precisa informar "src", "url" ou "youtubeId" com um identificador válido.`
      );
    }
  });
}

function validateBibliographyBlock(block, context) {
  requireStringField('title', 'Bloco "bibliography" requer o campo "title".')(block, context);
  const items = normalizeArray(block.items);
  const content = normalizeArray(block.content);
  const references = normalizeArray(block.references);
  if (items.length === 0 && content.length === 0 && references.length === 0) {
    pushBlockProblem(
      context,
      'Bloco "bibliography" requer o array "items", "content" ou "references" com pelo menos uma referência.'
    );
    return;
  }

  validateBibliographyEntries(items, 'items', context);
  validateBibliographyEntries(content, 'content', context);
  validateBibliographyEntries(references, 'references', context);
}

function validateAudioBlock(block, context) {
  requireStringField('title', 'Bloco "audio" requer o campo "title".')(block, context);
  requireStringField('src', 'Bloco "audio" requer o campo "src" com a URL do áudio.')(
    block,
    context
  );
}

function validateImageFigureBlock(block, context) {
  const hasSrc = isNonEmptyString(block.src);
  const images = normalizeArray(block.images);

  if (!hasSrc && images.length === 0) {
    pushBlockProblem(
      context,
      'Bloco "imageFigure" requer o campo "src" ou pelo menos um item em "images".'
    );
  }

  if (block.alt !== undefined && typeof block.alt !== 'string') {
    pushBlockProblem(
      context,
      'Campo "alt" do bloco "imageFigure" deve ser uma string quando presente.'
    );
  }

  if (block.caption !== undefined && typeof block.caption !== 'string') {
    pushBlockProblem(
      context,
      'Campo "caption" do bloco "imageFigure" deve ser uma string quando presente.'
    );
  }

  if (block.credit !== undefined && typeof block.credit !== 'string') {
    pushBlockProblem(
      context,
      'Campo "credit" do bloco "imageFigure" deve ser uma string quando presente.'
    );
  }

  if (block.srcset !== undefined && !isNonEmptyString(block.srcset)) {
    pushBlockProblem(
      context,
      'Campo "srcset" do bloco "imageFigure" deve ser uma string não vazia.'
    );
  }

  if (block.sizes !== undefined && typeof block.sizes !== 'string') {
    pushBlockProblem(
      context,
      'Campo "sizes" do bloco "imageFigure" deve ser uma string quando presente.'
    );
  }

  if (block.lightbox !== undefined && typeof block.lightbox !== 'boolean') {
    pushBlockProblem(
      context,
      'Campo "lightbox" do bloco "imageFigure" deve ser booleano quando presente.'
    );
  }

  validateImageSources(block.sources, 'sources', context);

  images.forEach((entry, index) => {
    if (!isPlainObject(entry)) {
      pushBlockProblem(
        context,
        `Entrada images[${index}] do bloco "imageFigure" deve ser um objeto com "src" ou "srcset".`
      );
      return;
    }

    const entryHasSrc = isNonEmptyString(entry.src);
    const entryHasSrcset = isNonEmptyString(entry.srcset);
    const entrySources = normalizeArray(entry.sources);

    if (!entryHasSrc && !entryHasSrcset && entrySources.length === 0) {
      pushBlockProblem(
        context,
        `Entrada images[${index}] requer "src", "srcset" ou "sources" com pelo menos uma fonte.`
      );
    }

    if (entry.alt !== undefined && typeof entry.alt !== 'string') {
      pushBlockProblem(
        context,
        `Campo "images[${index}].alt" deve ser uma string quando presente.`
      );
    }

    if (entry.caption !== undefined && typeof entry.caption !== 'string') {
      pushBlockProblem(
        context,
        `Campo "images[${index}].caption" deve ser uma string quando presente.`
      );
    }

    if (entry.credit !== undefined && typeof entry.credit !== 'string') {
      pushBlockProblem(
        context,
        `Campo "images[${index}].credit" deve ser uma string quando presente.`
      );
    }

    if (entry.lightbox !== undefined && typeof entry.lightbox !== 'boolean') {
      pushBlockProblem(
        context,
        `Campo "images[${index}].lightbox" deve ser booleano quando presente.`
      );
    }

    if (entry.sizes !== undefined && typeof entry.sizes !== 'string') {
      pushBlockProblem(
        context,
        `Campo "images[${index}].sizes" deve ser uma string quando presente.`
      );
    }

    validateImageSources(entrySources, `images[${index}].sources`, context);
  });
}

function validateImageSources(value, pathLabel, context) {
  const sources = normalizeArray(value);
  sources.forEach((source, index) => {
    if (!isPlainObject(source)) {
      pushBlockProblem(
        context,
        `Entrada ${pathLabel}[${index}] deve ser um objeto com "src" ou "srcset".`
      );
      return;
    }

    const hasSrc = isNonEmptyString(source.src);
    const hasSrcset = isNonEmptyString(source.srcset);

    if (!hasSrc && !hasSrcset) {
      pushBlockProblem(
        context,
        `Entrada ${pathLabel}[${index}] requer o campo "src" ou "srcset" com conteúdo.`
      );
    }

    if (source.type !== undefined && typeof source.type !== 'string') {
      pushBlockProblem(
        context,
        `Campo "${pathLabel}[${index}].type" deve ser uma string quando presente.`
      );
    }

    if (source.media !== undefined && typeof source.media !== 'string') {
      pushBlockProblem(
        context,
        `Campo "${pathLabel}[${index}].media" deve ser uma string quando presente.`
      );
    }

    if (source.sizes !== undefined && typeof source.sizes !== 'string') {
      pushBlockProblem(
        context,
        `Campo "${pathLabel}[${index}].sizes" deve ser uma string quando presente.`
      );
    }

    if (source.descriptor !== undefined && typeof source.descriptor !== 'string') {
      pushBlockProblem(
        context,
        `Campo "${pathLabel}[${index}].descriptor" deve ser uma string quando presente.`
      );
    }

    if (source.width !== undefined) {
      if (typeof source.width !== 'number' || !Number.isFinite(source.width) || source.width <= 0) {
        pushBlockProblem(
          context,
          `Campo "${pathLabel}[${index}].width" deve ser um número maior que zero quando presente.`
        );
      }
    }

    if (source.density !== undefined) {
      if (
        typeof source.density !== 'number' ||
        !Number.isFinite(source.density) ||
        source.density <= 0
      ) {
        pushBlockProblem(
          context,
          `Campo "${pathLabel}[${index}].density" deve ser um número maior que zero quando presente.`
        );
      }
    }
  });
}

function requireStringField(fieldName, errorMessage) {
  return (block, context) => {
    const value = block[fieldName];
    if (!isNonEmptyString(value)) {
      pushBlockProblem(context, errorMessage);
      return false;
    }
    return true;
  };
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasRenderableContent(value) {
  if (isNonEmptyString(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (isPlainObject(value)) {
    return Object.keys(value).length > 0;
  }
  return false;
}

function validateLessonPlanIcons(items, source, context) {
  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    if (item.icon === undefined) {
      return;
    }

    if (typeof item.icon !== 'string') {
      pushBlockProblem(
        context,
        `Campo "${source}[${index}].icon" deve ser uma string usando os nomes canônicos de ícones.`
      );
      return;
    }

    const trimmed = item.icon.trim();
    const normalized = normalizeIconName(trimmed);

    if (!ALLOWED_LESSON_PLAN_ICONS.has(normalized)) {
      pushBlockProblem(
        context,
        `Ícone "${item.icon}" em "${source}[${index}]" não é suportado. Use um dos valores: ${[
          ...ALLOWED_LESSON_PLAN_ICONS,
        ]
          .map((value) => `"${value}"`)
          .join(', ')}.`
      );
      return;
    }

    if (normalized !== trimmed) {
      pushBlockProblem(
        context,
        `Ícone em "${source}[${index}]" deve usar o formato canônico "${normalized}".`
      );
    }
  });
}

function normalizeIconName(name) {
  const withCamelSeparators = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
  return withCamelSeparators.replace(/[\s_]+/g, '-').toLowerCase();
}

function validateCardGridBlock(block, context) {
  const cards = normalizeArray(block.cards);
  const legacyItems = normalizeArray(block.items);

  if (typeof block.columns !== 'undefined') {
    if (typeof block.columns !== 'number' || !Number.isFinite(block.columns)) {
      pushBlockProblem(
        context,
        'Campo "columns" do bloco "cardGrid" deve ser um número inteiro entre 1 e 4 quando presente.'
      );
    } else {
      const rounded = Math.round(block.columns);
      if (rounded !== block.columns || rounded < 1 || rounded > 4) {
        pushBlockProblem(
          context,
          'Campo "columns" do bloco "cardGrid" deve ser um número inteiro entre 1 e 4.'
        );
      }
    }
  }

  if (cards.length === 0 && legacyItems.length === 0) {
    pushBlockProblem(context, 'Bloco "cardGrid" requer "cards" ou "items" com pelo menos um card.');
    return;
  }

  cards.forEach((card, index) => {
    validateCardGridEntry(card, index, context, 'cards', {
      allowVariants: false,
    });
  });

  legacyItems.forEach((item, index) => {
    validateCardGridEntry(item, index, context, 'items', {
      allowVariants: true,
    });
  });
}

function validateCardGridEntry(entry, index, context, source, options = {}) {
  if (!isPlainObject(entry)) {
    pushBlockProblem(
      context,
      `${source}[${index}]: cada card deve ser um objeto com título e conteúdo.`
    );
    return;
  }

  if (!isNonEmptyString(entry.title)) {
    pushBlockProblem(context, `${source}[${index}]: campo "title" deve ser uma string não vazia.`);
  }

  if (entry.subtitle !== undefined && !isNonEmptyString(entry.subtitle)) {
    pushBlockProblem(
      context,
      `${source}[${index}]: campo "subtitle" deve ser uma string não vazia quando informado.`
    );
  }

  if (entry.badge !== undefined && !isNonEmptyString(entry.badge)) {
    pushBlockProblem(
      context,
      `${source}[${index}]: campo "badge" deve ser uma string não vazia quando informado.`
    );
  }

  if (entry.icon !== undefined && !isNonEmptyString(entry.icon)) {
    pushBlockProblem(
      context,
      `${source}[${index}]: campo "icon" deve ser uma string não vazia quando informado.`
    );
  }

  if (entry.tone !== undefined) {
    validateCardTone(entry.tone, context, source, index);
  }

  if (options.allowVariants && entry.variant !== undefined) {
    validateCardVariant(entry.variant, context, source, index);
  } else if (!options.allowVariants && entry.variant !== undefined) {
    pushBlockProblem(
      context,
      `${source}[${index}]: use apenas "tone" nos cards modernos. O campo legacy "variant" deve ser removido.`
    );
  }

  if (entry.actions !== undefined) {
    validateCardActions(entry.actions, context, source, index);
  }

  if (entry.items !== undefined) {
    if (!Array.isArray(entry.items) || entry.items.length === 0) {
      pushBlockProblem(
        context,
        `${source}[${index}]: campo "items" deve ser um array com pelo menos um item quando informado.`
      );
    } else {
      entry.items.forEach((item, itemIndex) => {
        if (!isNonEmptyString(item)) {
          pushBlockProblem(
            context,
            `${source}[${index}].items[${itemIndex}]: cada item deve ser uma string com conteúdo.`
          );
        }
      });
    }
  }

  const hasBody = isNonEmptyString(entry.body);
  const hasContent = isNonEmptyString(entry.content);
  const hasDescription = isNonEmptyString(entry.description);
  const hasFooter = isNonEmptyString(entry.footer);
  const hasItems = Array.isArray(entry.items) && entry.items.some((item) => isNonEmptyString(item));
  const hasActions = Array.isArray(entry.actions) && entry.actions.length > 0;

  if (!hasBody && !hasContent && !hasDescription && !hasFooter && !hasItems && !hasActions) {
    pushBlockProblem(
      context,
      `${source}[${index}]: inclua "content", "description", "body" ou outro campo com texto renderizável.`
    );
  }
}

function validateCardActions(actions, context, source, index) {
  if (!Array.isArray(actions) || actions.length === 0) {
    pushBlockProblem(
      context,
      `${source}[${index}]: campo "actions" deve ser um array com pelo menos um objeto { label, href }.`
    );
    return;
  }

  actions.forEach((action, actionIndex) => {
    if (!isPlainObject(action)) {
      pushBlockProblem(
        context,
        `${source}[${index}].actions[${actionIndex}]: cada ação deve ser um objeto com "label" e "href".`
      );
      return;
    }

    if (!isNonEmptyString(action.label)) {
      pushBlockProblem(
        context,
        `${source}[${index}].actions[${actionIndex}]: campo "label" deve ser string não vazia.`
      );
    }

    if (!isNonEmptyString(action.href)) {
      pushBlockProblem(
        context,
        `${source}[${index}].actions[${actionIndex}]: campo "href" deve ser string não vazia.`
      );
    }

    if (action.external !== undefined && typeof action.external !== 'boolean') {
      pushBlockProblem(
        context,
        `${source}[${index}].actions[${actionIndex}]: campo "external" deve ser booleano quando informado.`
      );
    }
  });
}

function validateCardVariant(value, context, source, index) {
  if (typeof value !== 'string') {
    pushBlockProblem(
      context,
      `${source}[${index}]: campo "variant" deve ser uma string utilizando tokens canônicos.`
    );
    return;
  }

  const normalized = value.trim().toLowerCase();
  if (!ALLOWED_CARD_GRID_VARIANTS.has(normalized)) {
    pushBlockProblem(
      context,
      `${source}[${index}]: valor de "variant" inválido ("${value}"). Use um dos valores: ${[
        ...ALLOWED_CARD_GRID_VARIANTS,
      ]
        .map((token) => `"${token}"`)
        .join(', ')}.`
    );
    return;
  }

  if (normalized === 'best-practice') {
    pushBlockProblem(
      context,
      `${source}[${index}]: use o token canônico "good-practice" em vez de "best-practice".`
    );
  }

  if (normalized !== value) {
    pushBlockProblem(
      context,
      `${source}[${index}]: valor de "variant" deve usar o formato canônico "${normalized}".`
    );
  }
}

function validateCardTone(value, context, source, index) {
  if (typeof value !== 'string') {
    pushBlockProblem(context, `${source}[${index}]: campo "tone" deve ser uma string.`);
    return;
  }

  const normalized = value.trim().toLowerCase();
  if (!ALLOWED_CARD_GRID_TONES.has(normalized)) {
    pushBlockProblem(
      context,
      `${source}[${index}]: valor de "tone" inválido ("${value}"). Use um dos valores: ${[
        ...ALLOWED_CARD_GRID_TONES,
      ]
        .map((token) => `"${token}"`)
        .join(', ')}.`
    );
    return;
  }

  if (normalized !== value) {
    pushBlockProblem(
      context,
      `${source}[${index}]: valor de "tone" deve usar o formato canônico "${normalized}".`
    );
  }
}

function validateBibliographyEntries(entries, source, context) {
  entries.forEach((entry, index) => {
    if (typeof entry === 'string') {
      if (!isNonEmptyString(entry)) {
        pushBlockProblem(context, `${source}[${index}]: referências devem ser strings não vazias.`);
      }
      return;
    }

    if (isPlainObject(entry)) {
      if (!isNonEmptyString(entry.html)) {
        pushBlockProblem(
          context,
          `${source}[${index}]: objetos devem incluir o campo "html" com conteúdo.`
        );
      }
      return;
    }

    pushBlockProblem(
      context,
      `${source}[${index}]: referências devem ser strings ou objetos com o campo "html".`
    );
  });
}

function pushBlockProblem(context, message) {
  context.problems.push({
    type: 'block-field',
    file: context.filePath,
    course: context.course,
    message: `content[${context.index}]: ${message}`,
  });
}

const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true, strict: false });
addFormats(ajv);
const validateLesson = ajv.compile(lessonSchema);
const validateLessonsIndex = ajv.compile(lessonsIndexSchema);
const validateExercisesIndex = ajv.compile(exercisesIndexSchema);
const validateSupplementsIndex = ajv.compile(supplementsIndexSchema);
const lessonIdRegex = new RegExp(LESSON_ID_PATTERN);

function isIsoDateString(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

async function readJson(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function validateCourseMetaFile(course, problems) {
  const filePath = path.join(contentRoot, course, 'meta.json');
  let json;

  try {
    json = await readJson(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      problems.push({
        type: 'missing',
        file: filePath,
        course,
        message:
          'Curso precisa de meta.json com id, title, institution e description padronizados.',
      });
      return;
    }

    if (error instanceof SyntaxError) {
      problems.push({
        type: 'parse',
        file: filePath,
        course,
        message: `Falha ao interpretar meta.json: ${error.message}.`,
      });
      return;
    }

    problems.push({ type: 'read', file: filePath, course, message: error.message });
    return;
  }

  if (!isPlainObject(json)) {
    problems.push({
      type: 'schema',
      file: filePath,
      course,
      message: 'meta.json deve conter um objeto com id, title, institution e description.',
    });
    return;
  }

  if (!isNonEmptyString(json.id)) {
    problems.push({
      type: 'schema',
      file: filePath,
      course,
      message: 'Campo "id" de meta.json deve ser uma string não vazia igual ao slug do curso.',
    });
  } else if (json.id.trim() !== course) {
    problems.push({
      type: 'mismatch',
      file: filePath,
      course,
      message: `Campo "id" (${json.id}) deve coincidir com o diretório do curso (${course}).`,
    });
  }

  if (!isNonEmptyString(json.title)) {
    problems.push({
      type: 'schema',
      file: filePath,
      course,
      message: 'Campo "title" de meta.json deve ser uma string não vazia.',
    });
  } else if (json.title.trim().length < MIN_META_TITLE_LENGTH) {
    problems.push({
      type: 'length',
      file: filePath,
      course,
      message: `Campo "title" deve ter ao menos ${MIN_META_TITLE_LENGTH} caracteres úteis.`,
    });
  }

  if (!isNonEmptyString(json.institution)) {
    problems.push({
      type: 'schema',
      file: filePath,
      course,
      message:
        'Campo "institution" deve ser uma string não vazia usando o nome canônico da instituição.',
    });
  } else {
    const trimmed = json.institution.trim();
    if (trimmed !== json.institution) {
      problems.push({
        type: 'whitespace',
        file: filePath,
        course,
        message: 'Campo "institution" não deve conter espaços extras no início ou fim.',
      });
    }

    if (!ALLOWED_INSTITUTIONS.has(trimmed)) {
      problems.push({
        type: 'institution',
        file: filePath,
        course,
        message: `Institution "${json.institution}" não é reconhecida. Use um dos valores: ${[
          ...ALLOWED_INSTITUTIONS,
        ]
          .map((value) => `"${value}"`)
          .join(', ')}.`,
      });
    }
  }

  if (!isNonEmptyString(json.description)) {
    problems.push({
      type: 'schema',
      file: filePath,
      course,
      message: 'Campo "description" de meta.json deve ser uma string não vazia.',
    });
  } else if (json.description.trim().length < MIN_META_DESCRIPTION_LENGTH) {
    problems.push({
      type: 'length',
      file: filePath,
      course,
      message: `Campo "description" deve ter pelo menos ${MIN_META_DESCRIPTION_LENGTH} caracteres úteis.`,
    });
  }
}

async function validateLessonFile(course, filePath, problems, warnings) {
  try {
    const json = await readJson(filePath);
    if (!validateLesson(json)) {
      problems.push({
        type: 'schema',
        file: filePath,
        course,
        message: ajv.errorsText(validateLesson.errors, { separator: '\n' }),
      });
      return;
    }

    const expectedId = path.parse(filePath).name;
    if (json.id !== expectedId) {
      problems.push({
        type: 'mismatch',
        file: filePath,
        course,
        message: `Lesson JSON id (${json.id}) must match file name (${expectedId}).`,
      });
    }

    recordLessonMetadataWarnings({ json, filePath, course, warnings });

    json.content.forEach((block, index) => {
      if (LEGACY_BLOCK_TYPES.includes(block.type)) {
        warnings.push({
          type: 'legacy-block',
          file: filePath,
          course,
          message: `Bloco legado em content[${index}]: "${block.type}" requer refino futuro.`,
        });
        return;
      }

      if (!SUPPORTED_BLOCK_TYPES.includes(block.type)) {
        problems.push({
          type: 'unknown-block',
          file: filePath,
          course,
          message: `Bloco desconhecido em content[${index}]: "${block.type}".`,
        });
        return;
      }

      if (block.type === 'component') {
        if (typeof block.component !== 'string' || block.component.length === 0) {
          problems.push({
            type: 'invalid-component',
            file: filePath,
            course,
            message: `Bloco component em content[${index}] requer o campo "component" com nome válido.`,
          });
          return;
        }

        if (!SUPPORTED_CUSTOM_COMPONENTS.includes(block.component)) {
          problems.push({
            type: 'invalid-component',
            file: filePath,
            course,
            message: `Componente personalizado não suportado em content[${index}]: "${block.component}".`,
          });
        }
      }

      const validator = blockValidators[block.type];
      if (validator) {
        validator(block, {
          course,
          filePath,
          index,
          problems,
        });
      }
    });
  } catch (error) {
    problems.push({ type: 'read', file: filePath, course, message: error.message });
  }
}

function recordLessonMetadataWarnings({ json, filePath, course, warnings }) {
  const metadataChecks = [
    {
      ok: () => typeof json.formatVersion === 'string',
      message:
        'Aula deve declarar "formatVersion" (use "md3.lesson.v1") para aderir ao schema unificado.',
    },
    {
      ok: () => isNonEmptyString(json.summary),
      message: 'Campo "summary" deve ser preenchido com resumo de 1-2 parágrafos.',
    },
    {
      ok: () => isNonEmptyString(json.objective),
      message: 'Campo "objective" precisa ser preenchido com o objetivo pedagógico principal.',
    },
    {
      ok: () => Array.isArray(json.competencies) && json.competencies.length > 0,
      message: 'Campo "competencies" deve listar as competências trabalhadas na aula.',
    },
    {
      ok: () => Array.isArray(json.outcomes) && json.outcomes.length > 0,
      message: 'Campo "outcomes" deve registrar resultados de aprendizagem mensuráveis.',
    },
    {
      ok: () => Array.isArray(json.content) && json.content.length > 0,
      message: 'Campo "content" precisa de pelo menos um bloco renderizável.',
    },
  ];

  metadataChecks.forEach(({ ok, message }) => {
    if (!ok()) {
      warnings.push({
        type: 'missing-metadata',
        file: filePath,
        course,
        message,
      });
    }
  });

  if (!json.metadata || !isIsoDateString(json.metadata.updatedAt)) {
    warnings.push({
      type: 'missing-metadata',
      file: filePath,
      course,
      message:
        'Preencha metadata.updatedAt com a data ISO da última revisão para rastrear governança.',
    });
  }

  if (!json.metadata || !Array.isArray(json.metadata.owners) || json.metadata.owners.length === 0) {
    warnings.push({
      type: 'missing-metadata',
      file: filePath,
      course,
      message: 'Preencha metadata.owners com responsáveis pedagógicos/tecnológicos.',
    });
  }
}

async function validateLessonsIndexFile(course, filePath, problems) {
  try {
    const manifest = await readManifest(filePath);
    if (manifest.missing) {
      problems.push({
        type: 'read',
        file: filePath,
        course,
        message: 'Manifesto de lições não encontrado.',
      });
      return [];
    }

    if (manifest.version !== MANIFEST_VERSION) {
      problems.push({
        type: 'manifest-version',
        file: filePath,
        course,
        message: `lessons.json deve declarar version="${MANIFEST_VERSION}".`,
      });
    }

    if (!validateLessonsIndex(manifest)) {
      problems.push({
        type: 'schema',
        file: filePath,
        course,
        message: ajv.errorsText(validateLessonsIndex.errors, { separator: '\n' }),
      });
      return [];
    }

    const entries = getManifestEntries(manifest);
    const seen = new Set();
    const duplicates = [];
    entries.forEach((item) => {
      if (seen.has(item.id)) {
        duplicates.push(item.id);
      }
      seen.add(item.id);

      if (!lessonIdRegex.test(item.id)) {
        problems.push({
          type: 'pattern',
          file: filePath,
          course,
          message: `Lesson id "${item.id}" must follow lesson-XX numeric pattern.`,
        });
      }

      const baseName = path.parse(item.file).name;
      if (baseName !== item.id) {
        problems.push({
          type: 'mismatch',
          file: filePath,
          course,
          message: `File name (${item.file}) must match lesson id (${item.id}).`,
        });
      }

      const extension = path.extname(item.file || '').toLowerCase();
      if (item.available && extension !== '.json') {
        problems.push({
          type: 'extension',
          file: filePath,
          course,
          message: `Lesson "${item.id}" must reference a .json payload when marked available (received ${item.file}).`,
        });
      }
    });
    if (duplicates.length > 0) {
      problems.push({
        type: 'duplicate',
        file: filePath,
        course,
        message: `Duplicated lesson ids: ${[...new Set(duplicates)].join(', ')}`,
      });
    }

    return entries;
  } catch (error) {
    problems.push({ type: 'read', file: filePath, course, message: error.message });
    return [];
  }
}

function validateGenerationMetadata({ metadata, filePath, problems, course, entryId }) {
  if (!metadata) {
    problems.push({
      type: 'metadata',
      file: filePath,
      course,
      message: `Entrada "${entryId}" requer objeto "metadata" com generatedBy, model e timestamp.`,
    });
    return;
  }

  if (!isNonEmptyString(metadata.generatedBy)) {
    problems.push({
      type: 'metadata',
      file: filePath,
      course,
      message: `Entrada "${entryId}" requer metadata.generatedBy preenchido.`,
    });
  }

  if (!isNonEmptyString(metadata.model)) {
    problems.push({
      type: 'metadata',
      file: filePath,
      course,
      message: `Entrada "${entryId}" requer metadata.model preenchido.`,
    });
  }

  if (!isIsoDateString(metadata.timestamp)) {
    problems.push({
      type: 'metadata',
      file: filePath,
      course,
      message: `Entrada "${entryId}" requer metadata.timestamp em formato ISO válido.`,
    });
  }
}

async function validateExercisesIndexFile(course, filePath, problems) {
  try {
    const manifest = await readManifest(filePath);
    if (manifest.missing) {
      return [];
    }

    if (manifest.version !== MANIFEST_VERSION) {
      problems.push({
        type: 'manifest-version',
        file: filePath,
        course,
        message: `exercises.json deve declarar version="${MANIFEST_VERSION}".`,
      });
    }

    if (!validateExercisesIndex(manifest)) {
      problems.push({
        type: 'schema',
        file: filePath,
        course,
        message: ajv.errorsText(validateExercisesIndex.errors, { separator: '\n' }),
      });
      return [];
    }

    const entries = getManifestEntries(manifest);
    const seen = new Set();
    const duplicates = [];
    const linkPrefix = `courses/${course}/exercises/`;

    entries.forEach((item) => {
      if (seen.has(item.id)) {
        duplicates.push(item.id);
      }
      seen.add(item.id);

      validateGenerationMetadata({
        metadata: item.metadata,
        filePath,
        problems,
        course,
        entryId: item.id,
      });

      if (item.link && !item.link.startsWith(linkPrefix) && !/^https?:\/\//i.test(item.link)) {
        problems.push({
          type: 'link-pattern',
          file: filePath,
          course,
          message: `Exercise "${item.id}" deve usar links começando com "${linkPrefix}" ou uma URL absoluta.`,
        });
      }

      if (item.file) {
        const baseName = path.parse(item.file).name;
        if (baseName !== item.id) {
          problems.push({
            type: 'mismatch',
            file: filePath,
            course,
            message: `Exercise file (${item.file}) deve corresponder ao id (${item.id}).`,
          });
        }
      }

      if (!item.file && !item.link) {
        problems.push({
          type: 'resource',
          file: filePath,
          course,
          message: `Exercise "${item.id}" precisa informar "file" ou "link" para acesso ao conteúdo.`,
        });
      }

      if (!isNonEmptyString(item.description)) {
        problems.push({
          type: 'description',
          file: filePath,
          course,
          message: `Exercise "${item.id}" requer "description" preenchido.`,
        });
      }
    });

    if (duplicates.length > 0) {
      problems.push({
        type: 'duplicate',
        file: filePath,
        course,
        message: `Duplicated exercise ids: ${[...new Set(duplicates)].join(', ')}`,
      });
    }

    return entries;
  } catch (error) {
    problems.push({ type: 'read', file: filePath, course, message: error.message });
    return [];
  }
}

async function validateSupplementsIndexFile(course, filePath, problems) {
  try {
    const manifest = await readManifest(filePath);
    if (manifest.missing) {
      return [];
    }

    if (manifest.version !== MANIFEST_VERSION) {
      problems.push({
        type: 'manifest-version',
        file: filePath,
        course,
        message: `supplements.json deve declarar version="${MANIFEST_VERSION}".`,
      });
    }

    if (!validateSupplementsIndex(manifest)) {
      problems.push({
        type: 'schema',
        file: filePath,
        course,
        message: ajv.errorsText(validateSupplementsIndex.errors, { separator: '\n' }),
      });
      return [];
    }

    const entries = getManifestEntries(manifest);
    const seen = new Set();
    const duplicates = [];
    const linkPrefix = `courses/${course}/supplements/`;

    entries.forEach((item) => {
      if (seen.has(item.id)) {
        duplicates.push(item.id);
      }
      seen.add(item.id);

      validateGenerationMetadata({
        metadata: item.metadata,
        filePath,
        problems,
        course,
        entryId: item.id,
      });

      if (!SUPPLEMENT_TYPES.includes(item.type)) {
        problems.push({
          type: 'type',
          file: filePath,
          course,
          message: `Supplement "${item.id}" requer campo "type" com valores válidos (${SUPPLEMENT_TYPES.join(', ')}).`,
        });
      }

      if (item.file) {
        const baseName = path.parse(item.file).name;
        if (baseName !== item.id) {
          problems.push({
            type: 'mismatch',
            file: filePath,
            course,
            message: `Supplement file (${item.file}) deve corresponder ao id (${item.id}).`,
          });
        }
      }

      if (item.link && !item.link.startsWith(linkPrefix) && !/^https?:\/\//i.test(item.link)) {
        problems.push({
          type: 'link-pattern',
          file: filePath,
          course,
          message: `Supplement "${item.id}" deve usar links absolutos ou começar com "${linkPrefix}".`,
        });
      }

      if (!item.file && !item.link) {
        problems.push({
          type: 'resource',
          file: filePath,
          course,
          message: `Supplement "${item.id}" precisa informar "file" ou "link" para acesso ao material.`,
        });
      }
    });

    if (duplicates.length > 0) {
      problems.push({
        type: 'duplicate',
        file: filePath,
        course,
        message: `Duplicated supplement ids: ${[...new Set(duplicates)].join(', ')}`,
      });
    }

    return entries;
  } catch (error) {
    problems.push({ type: 'read', file: filePath, course, message: error.message });
    return [];
  }
}

async function ensureFilesExist(course, entries, problems) {
  const courseDir = path.join(contentRoot, course, 'lessons');
  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.available) {
        return;
      }
      const targetExt = path.extname(entry.file) || '.vue';
      const targetPath = path.join(courseDir, entry.file);
      try {
        await fs.access(targetPath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          problems.push({
            type: 'missing',
            file: targetPath,
            course,
            message: `Listed in lessons.json but missing on disk (${entry.file}).`,
          });
        } else {
          problems.push({ type: 'read', file: targetPath, course, message: error.message });
        }
      }

      if (targetExt === '.vue') {
        const jsonPath = path.join(courseDir, `${path.parse(entry.file).name}.json`);
        try {
          await fs.access(jsonPath);
        } catch (error) {
          if (error.code === 'ENOENT') {
            problems.push({
              type: 'missing-json',
              file: jsonPath,
              course,
              message: `Wrapper ${entry.file} found but JSON payload is missing.`,
            });
          } else {
            problems.push({ type: 'read', file: jsonPath, course, message: error.message });
          }
        }
      }
    })
  );
}

async function ensureExerciseFilesExist(course, entries, problems) {
  const exercisesDir = path.join(contentRoot, course, 'exercises');
  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.available) {
        return;
      }

      if (!entry.file) {
        return;
      }

      const targetExt = path.extname(entry.file) || '.vue';
      const targetPath = path.join(exercisesDir, entry.file);
      try {
        await fs.access(targetPath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          problems.push({
            type: 'missing',
            file: targetPath,
            course,
            message: `Listado em exercises.json mas ausente no disco (${entry.file}).`,
          });
        } else {
          problems.push({ type: 'read', file: targetPath, course, message: error.message });
        }
      }

      if (targetExt === '.vue') {
        const jsonPath = path.join(exercisesDir, `${path.parse(entry.file).name}.json`);
        try {
          await fs.access(jsonPath);
        } catch (error) {
          if (error.code === 'ENOENT') {
            problems.push({
              type: 'missing-json',
              file: jsonPath,
              course,
              message: `Wrapper ${entry.file} encontrado mas JSON do exercício ausente.`,
            });
          } else {
            problems.push({ type: 'read', file: jsonPath, course, message: error.message });
          }
        }
      }
    })
  );
}

async function ensureSupplementFilesExist(course, entries, problems) {
  const supplementsDir = path.join(contentRoot, course, 'supplements');
  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.available || !entry.file) {
        return;
      }

      const targetPath = path.join(supplementsDir, entry.file);
      try {
        await fs.access(targetPath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          problems.push({
            type: 'missing',
            file: targetPath,
            course,
            message: `Listado em supplements.json mas ausente no disco (${entry.file}).`,
          });
        } else {
          problems.push({ type: 'read', file: targetPath, course, message: error.message });
        }
      }
    })
  );
}

async function collectLessonFiles(course) {
  const lessonsDir = path.join(contentRoot, course, 'lessons');
  try {
    const files = await fs.readdir(lessonsDir);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => path.join(lessonsDir, file));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function main() {
  const problems = [];
  const warnings = [];
  let totalLessons = 0;
  const lessonsPerCourse = {};

  let courses;
  try {
    const dirEntries = await fs.readdir(contentRoot, { withFileTypes: true });
    courses = dirEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch (error) {
    console.error('Failed to read courses directory:', error.message);
    process.exit(1);
  }

  const generationMetadata = {
    exercises: new Map(),
    supplements: new Map(),
  };

  for (const course of courses) {
    await validateCourseMetaFile(course, problems);
    const lessonsIndexPath = path.join(contentRoot, course, 'lessons.json');
    const entries = await validateLessonsIndexFile(course, lessonsIndexPath, problems);
    await ensureFilesExist(course, entries, problems);

    const exercisesIndexPath = path.join(contentRoot, course, 'exercises.json');
    const exerciseEntries = await validateExercisesIndexFile(course, exercisesIndexPath, problems);
    recordGenerationMetadata(
      generationMetadata.exercises,
      course,
      exerciseEntries,
      ({ metadata, available }) => ({
        generatedBy: metadata?.generatedBy ?? null,
        model: metadata?.model ?? null,
        timestamp: metadata?.timestamp ?? null,
        available: available ?? null,
      })
    );
    await ensureExerciseFilesExist(course, exerciseEntries, problems);

    const supplementsIndexPath = path.join(contentRoot, course, 'supplements.json');
    const supplementEntries = await validateSupplementsIndexFile(
      course,
      supplementsIndexPath,
      problems
    );
    recordGenerationMetadata(generationMetadata.supplements, course, supplementEntries, (item) => ({
      type: item.type,
      generatedBy: item.metadata?.generatedBy ?? null,
      model: item.metadata?.model ?? null,
      timestamp: item.metadata?.timestamp ?? null,
    }));
    await ensureSupplementFilesExist(course, supplementEntries, problems);

    const lessonFiles = await collectLessonFiles(course);
    totalLessons += lessonFiles.length;
    lessonsPerCourse[course] = lessonFiles.length;
    await Promise.all(
      lessonFiles.map((filePath) => validateLessonFile(course, filePath, problems, warnings))
    );
  }

  const reportData = buildReport({
    coursesValidated: courses,
    totalLessons,
    problems,
    warnings,
    lessonsPerCourse,
    generationMetadata,
  });

  if (reportPath) {
    try {
      await writeReport(reportPath, reportData);
      const displayPath = toPosix(path.relative(repoRoot, reportPath) || path.basename(reportPath));
      console.log(`📝 Relatório de validação salvo em ${displayPath}`);
    } catch (error) {
      console.error('Falha ao salvar relatório de validação:', error.message);
    }
  }

  if (problems.length > 0) {
    console.error('❌ Content validation failed.');
    for (const problem of problems) {
      console.error(
        `- [${problem.course}] ${path.relative(repoRoot, problem.file)}: ${problem.message}`
      );
    }
    process.exitCode = 1;
    return;
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Content validation completed with warnings:');
    for (const warning of warnings) {
      console.warn(
        `- [${warning.course}] ${path.relative(repoRoot, warning.file)}: ${warning.message}`
      );
    }
  }

  console.log(
    `✅ Content validation passed for ${courses.length} courses (${totalLessons} lessons).`
  );
}

main().catch((error) => {
  console.error('Unexpected error during content validation:', error);
  process.exitCode = 1;
});

function resolveReportPath(args) {
  if (args.includes('--no-report')) {
    return null;
  }

  const equalsArg = args.find((arg) => arg.startsWith('--report='));
  if (equalsArg) {
    const candidate = equalsArg.slice('--report='.length).trim();
    return toAbsoluteReportPath(candidate.length > 0 ? candidate : DEFAULT_REPORT_PATH);
  }

  const flagIndex = args.indexOf('--report');
  if (flagIndex === -1) {
    return toAbsoluteReportPath(DEFAULT_REPORT_PATH);
  }

  const nextArg = args[flagIndex + 1];
  const candidate = nextArg && !nextArg.startsWith('--') ? nextArg.trim() : '';
  return toAbsoluteReportPath(candidate.length > 0 ? candidate : DEFAULT_REPORT_PATH);
}

function toAbsoluteReportPath(candidate) {
  const target = candidate ?? DEFAULT_REPORT_PATH;
  return path.isAbsolute(target) ? target : path.join(repoRoot, target);
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function deriveLessonId(course, absolutePath) {
  const courseRoot = path.join(contentRoot, course);
  const relative = path.relative(courseRoot, absolutePath);
  if (relative.startsWith('..')) {
    return null;
  }

  const segments = relative.split(path.sep);
  if (segments[0] === 'lessons' && segments[1]) {
    return path.parse(segments[1]).name;
  }
  if (segments.length === 1 && segments[0] === 'lessons.json') {
    return 'lessons-index';
  }
  return null;
}

function groupByCourse(entries) {
  return entries.reduce((map, entry) => {
    if (!map.has(entry.course)) {
      map.set(entry.course, []);
    }
    map.get(entry.course).push(entry);
    return map;
  }, new Map());
}

function recordGenerationMetadata(map, course, entries, mapper) {
  if (!entries || entries.length === 0) {
    return;
  }

  if (!map.has(course)) {
    map.set(course, {
      course,
      total: 0,
      missing: 0,
      byGenerator: new Map(),
      byModel: new Map(),
      earliestTimestamp: null,
      latestTimestamp: null,
      entries: [],
    });
  }

  const summary = map.get(course);

  for (const entry of entries) {
    summary.total += 1;

    const payload = { id: entry.id, ...mapper(entry) };
    const generatedBy = payload.generatedBy ?? null;
    const model = payload.model ?? null;
    const timestamp = payload.timestamp ?? null;

    if (!generatedBy || !model || !timestamp) {
      summary.missing += 1;
    }

    if (generatedBy) {
      summary.byGenerator.set(generatedBy, (summary.byGenerator.get(generatedBy) ?? 0) + 1);
    }

    if (model) {
      summary.byModel.set(model, (summary.byModel.get(model) ?? 0) + 1);
    }

    if (timestamp) {
      const numeric = Date.parse(timestamp);
      if (!Number.isNaN(numeric)) {
        if (!summary.earliestTimestamp || numeric < summary.earliestTimestamp.numeric) {
          summary.earliestTimestamp = { numeric, value: timestamp };
        }
        if (!summary.latestTimestamp || numeric > summary.latestTimestamp.numeric) {
          summary.latestTimestamp = { numeric, value: timestamp };
        }
      }
    }

    summary.entries.push(payload);
  }
}

function serializeGenerationMetadata({ exercises, supplements }) {
  return {
    exercises: serializeGenerationCollection(exercises),
    supplements: serializeGenerationCollection(supplements),
  };
}

function serializeGenerationCollection(map) {
  return Array.from(map.values())
    .map((summary) => {
      const entries = summary.entries
        .map((entry) => ({
          ...entry,
          generatedBy: entry.generatedBy ?? null,
          model: entry.model ?? null,
          timestamp: entry.timestamp ?? null,
        }))
        .sort((a, b) => a.id.localeCompare(b.id));

      return {
        course: summary.course,
        total: summary.total,
        withMetadata: summary.total - summary.missing,
        missingMetadata: summary.missing,
        byGenerator: Object.fromEntries(summary.byGenerator.entries()),
        byModel: Object.fromEntries(summary.byModel.entries()),
        earliestTimestamp: summary.earliestTimestamp?.value ?? null,
        latestTimestamp: summary.latestTimestamp?.value ?? null,
        entries,
      };
    })
    .sort((a, b) => a.course.localeCompare(b.course));
}

function buildReport({
  coursesValidated,
  totalLessons,
  problems,
  warnings,
  lessonsPerCourse,
  generationMetadata,
}) {
  const problemsByCourse = groupByCourse(problems);
  const warningsByCourse = groupByCourse(warnings);
  const courseIds = new Set([...problemsByCourse.keys(), ...warningsByCourse.keys()]);

  const courses = Array.from(courseIds)
    .map((course) => {
      const courseProblems = problemsByCourse.get(course) ?? [];
      const courseWarnings = warningsByCourse.get(course) ?? [];
      const lessonsMap = new Map();

      const upsertLesson = (item) => {
        const repoRelative = toPosix(path.relative(repoRoot, item.file));
        if (lessonsMap.has(repoRelative)) {
          return lessonsMap.get(repoRelative);
        }
        const lessonEntry = {
          file: repoRelative,
          problems: [],
          warnings: [],
        };
        const lessonId = deriveLessonId(course, item.file);
        if (lessonId) {
          lessonEntry.lessonId = lessonId;
        }
        lessonsMap.set(repoRelative, lessonEntry);
        return lessonEntry;
      };

      courseProblems.forEach((item) => {
        upsertLesson(item).problems.push({ type: item.type, message: item.message });
      });
      courseWarnings.forEach((item) => {
        upsertLesson(item).warnings.push({ type: item.type, message: item.message });
      });

      const lessons = Array.from(lessonsMap.values()).sort((a, b) => a.file.localeCompare(b.file));

      return {
        id: course,
        lessonsTotal: lessonsPerCourse[course] ?? 0,
        lessonsWithIssues: lessons.length,
        problems: courseProblems.length,
        warnings: courseWarnings.length,
        lessons,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const lessonsWithIssuesTotal = courses.reduce(
    (total, course) => total + course.lessonsWithIssues,
    0
  );

  return {
    generatedAt: new Date().toISOString(),
    status:
      problems.length > 0 ? 'failed' : warnings.length > 0 ? 'passed-with-warnings' : 'passed',
    totals: {
      courses: coursesValidated.length,
      lessons: totalLessons,
      lessonsWithIssues: lessonsWithIssuesTotal,
      problems: problems.length,
      warnings: warnings.length,
    },
    courses,
    generation: serializeGenerationMetadata(generationMetadata),
  };
}

async function writeReport(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, payload, 'utf-8');
}

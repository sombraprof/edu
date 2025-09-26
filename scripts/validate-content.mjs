#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const contentRoot = path.join(repoRoot, 'src', 'content', 'courses');
const DEFAULT_REPORT_PATH = path.join('reports', 'content-validation-report.json');

const args = process.argv.slice(2);
const reportPath = resolveReportPath(args);

const LESSON_ID_PATTERN = '^lesson-[0-9]{2,}$';

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
  'truthTable',
  'audio',
  'audioBlock',
  'md3Table',
  'component',
  'legacySection',
];

const LEGACY_BLOCK_TYPES = ['dragAndDrop', 'fileTree', 'quiz'];

const SUPPORTED_CUSTOM_COMPONENTS = [
  'Md3Table',
  'Md3LogicOperators',
  'MemoryDiagram',
  'OrderedList',
  'CardGrid',
];

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
    const cards = normalizeArray(block.cards);
    const items = normalizeArray(block.items);
    if (cards.length === 0 && items.length === 0) {
      pushBlockProblem(
        context,
        'Bloco "cardGrid" requer "cards" ou "items" com pelo menos um card.'
      );
    }
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
  }
}

function validateAudioBlock(block, context) {
  requireStringField('title', 'Bloco "audio" requer o campo "title".')(block, context);
  requireStringField('src', 'Bloco "audio" requer o campo "src" com a URL do áudio.')(
    block,
    context
  );
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

function pushBlockProblem(context, message) {
  context.problems.push({
    type: 'block-field',
    file: context.filePath,
    course: context.course,
    message: `content[${context.index}]: ${message}`,
  });
}

const lessonContentSchema = Type.Object(
  {
    type: Type.String({
      minLength: 1,
      description: 'Each lesson block must declare its renderer type',
    }),
  },
  { additionalProperties: true }
);

const lessonSchema = Type.Object(
  {
    id: Type.String({
      pattern: LESSON_ID_PATTERN,
      description: 'Use lesson IDs like lesson-01',
    }),
    title: Type.String({ minLength: 1 }),
    objective: Type.Optional(Type.String()),
    duration: Type.Optional(Type.Number({ exclusiveMinimum: 0 })),
    content: Type.Array(lessonContentSchema, {
      description: 'Lesson blocks',
      minItems: 1,
    }),
    bibliography: Type.Optional(
      Type.Array(Type.String({ minLength: 1 }), {
        minItems: 1,
      })
    ),
    resources: Type.Optional(
      Type.Array(
        Type.Object(
          {
            label: Type.String({ minLength: 1 }),
            url: Type.String({
              format: 'uri',
            }),
          },
          { additionalProperties: true }
        ),
        { minItems: 1 }
      )
    ),
  },
  { additionalProperties: true }
);

const lessonsIndexSchema = Type.Array(
  Type.Object(
    {
      id: Type.String({ pattern: LESSON_ID_PATTERN }),
      title: Type.String({ minLength: 1 }),
      file: Type.String({ pattern: '^lesson-[0-9]{2,}\\.(vue|json)$' }),
      available: Type.Boolean(),
      description: Type.Optional(Type.String()),
    },
    { additionalProperties: false }
  )
);

const compiler = TypeCompiler.Compile(lessonSchema);
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true, strict: false });
addFormats(ajv);
const validateLesson = ajv.compile(lessonSchema);
const validateLessonsIndex = ajv.compile(lessonsIndexSchema);
const lessonIdRegex = new RegExp(LESSON_ID_PATTERN);

async function readJson(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
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

    if (!compiler.Check(json)) {
      problems.push({
        type: 'schema',
        file: filePath,
        course,
        message: compiler
          .Errors(json)
          .map((error) => `${error.path}: ${error.message}`)
          .join('\n'),
      });
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

async function validateLessonsIndexFile(course, filePath, problems) {
  try {
    const json = await readJson(filePath);
    if (!validateLessonsIndex(json)) {
      problems.push({
        type: 'schema',
        file: filePath,
        course,
        message: ajv.errorsText(validateLessonsIndex.errors, { separator: '\n' }),
      });
      return [];
    }

    const seen = new Set();
    const duplicates = [];
    json.forEach((item) => {
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
    });
    if (duplicates.length > 0) {
      problems.push({
        type: 'duplicate',
        file: filePath,
        course,
        message: `Duplicated lesson ids: ${[...new Set(duplicates)].join(', ')}`,
      });
    }

    return json;
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

  for (const course of courses) {
    const lessonsIndexPath = path.join(contentRoot, course, 'lessons.json');
    const entries = await validateLessonsIndexFile(course, lessonsIndexPath, problems);
    await ensureFilesExist(course, entries, problems);

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
  const equalsArg = args.find((arg) => arg.startsWith('--report='));
  if (equalsArg) {
    const candidate = equalsArg.slice('--report='.length).trim();
    return toAbsoluteReportPath(candidate.length > 0 ? candidate : DEFAULT_REPORT_PATH);
  }

  const flagIndex = args.indexOf('--report');
  if (flagIndex === -1) {
    return null;
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

function buildReport({ coursesValidated, totalLessons, problems, warnings, lessonsPerCourse }) {
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
  };
}

async function writeReport(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, payload, 'utf-8');
}

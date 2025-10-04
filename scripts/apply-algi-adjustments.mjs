#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const LESSONS_DIR = path.join(ROOT, 'src/content/courses/algi/lessons');
const MANIFEST_PATH = path.join(ROOT, 'src/content/courses/algi/lessons.json');
const LESSON_DURATION_MINUTES = 100;
const MOODLE_RESOURCE = {
  label: 'Moodle — AVA (Unichristus)',
  type: 'plataforma',
  url: 'https://ava.unichristus.edu.br/',
};

const WARMUP_CONTENT = [
  {
    type: 'paragraph',
    text: 'Revise os materiais desta aula aqui no site e anote os pontos-chave que precisam de atenção. Identifique dúvidas ou conceitos que merecem ser revisitados durante o encontro.',
  },
  {
    type: 'list',
    items: [
      {
        text: 'Reserve alguns minutos para tentar resolver mentalmente um exemplo relacionado ao tema da aula.',
      },
      {
        text: 'Garanta acesso ao OnlineGDB ou ao Dev-C++ para experimentar os códigos durante a aula.',
      },
    ],
  },
];

const TED_CONTENT = [
  {
    type: 'paragraph',
    text: 'Reserve um momento após a aula para concluir a atividade descrita a seguir. Ela complementa os estudos e ajuda a consolidar o que foi trabalhado em sala.',
  },
  {
    type: 'list',
    items: [
      {
        text: 'Desenvolva a prática proposta na aula registrando os passos e resultados no caderno ou no editor de sua preferência.',
      },
      {
        text: 'Anote dúvidas e insights que surgirem para discutirmos na próxima aula.',
      },
    ],
  },
];

function loadJson(filePath) {
  return fs.readFile(filePath, 'utf8').then((raw) => JSON.parse(raw));
}

async function saveJson(filePath, data) {
  const contents = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, contents, 'utf8');
}

function normalizeWarmup(block) {
  if (!block || block.type !== 'callout') return block;
  const title = typeof block.title === 'string' ? block.title.toLowerCase() : '';
  if (!title.includes('warm')) return block;
  return {
    ...block,
    variant: block.variant ?? 'info',
    title: 'Warm-up (pré-aula)',
    content: WARMUP_CONTENT,
  };
}

function normalizeFlightPlan(block) {
  if (!block || block.type !== 'flightPlan') return block;
  if (!Array.isArray(block.items)) {
    return {
      ...block,
      title: 'Plano de voo (1h40)',
    };
  }

  const regex = /^\((\d+)\s*min\)/i;
  const entries = block.items.map((item) => {
    if (typeof item !== 'string') {
      return { text: item };
    }
    const match = item.match(regex);
    if (!match) {
      return { text: item };
    }
    return { text: item, minutes: Number.parseInt(match[1], 10) };
  });

  const timed = entries.filter(
    (entry) => typeof entry.minutes === 'number' && Number.isFinite(entry.minutes)
  );
  const total = timed.reduce((sum, entry) => sum + entry.minutes, 0);
  if (total > 0 && timed.length > 0) {
    const scaled = timed.map((entry) => (entry.minutes * LESSON_DURATION_MINUTES) / total);
    const remainders = scaled.map((value, index) => ({
      index,
      remainder: value - Math.floor(value),
    }));
    const adjusted = scaled.map((value, index) => {
      const floor = Math.floor(value);
      const original = timed[index].minutes;
      const minValue = original >= 5 ? 5 : 1;
      return Math.max(minValue, floor);
    });

    let sum = adjusted.reduce((acc, value) => acc + value, 0);
    if (sum < LESSON_DURATION_MINUTES) {
      const diff = LESSON_DURATION_MINUTES - sum;
      remainders.sort((a, b) => b.remainder - a.remainder);
      for (let i = 0; i < diff; i += 1) {
        const target = remainders[i % remainders.length]?.index ?? 0;
        adjusted[target] += 1;
      }
    } else if (sum > LESSON_DURATION_MINUTES) {
      let diff = sum - LESSON_DURATION_MINUTES;
      remainders.sort((a, b) => a.remainder - b.remainder);
      let cursor = 0;
      const minValues = timed.map((entry) => (entry.minutes >= 5 ? 5 : 1));
      while (diff > 0 && remainders.length > 0) {
        const target = remainders[cursor % remainders.length].index;
        if (adjusted[target] > minValues[target]) {
          adjusted[target] -= 1;
          diff -= 1;
        }
        cursor += 1;
      }
    }

    let pointer = 0;
    for (const entry of entries) {
      if (typeof entry.minutes === 'number') {
        const minutes = adjusted[pointer];
        entry.text = entry.text.replace(regex, `(${minutes} min)`);
        pointer += 1;
      }
    }
  }

  return {
    ...block,
    title: 'Plano de voo (1h40)',
    items: entries.map((entry) => entry.text),
  };
}

function normalizeLessonPlan(block) {
  if (!block || block.type !== 'lessonPlan') return block;
  if (!Array.isArray(block.cards)) {
    return {
      ...block,
      title: block.title?.includes('Plano de voo') ? 'Plano de voo (1h40)' : block.title,
    };
  }

  const regex = /(\d+)\s*min/i;
  const cards = block.cards.map((card) => ({ ...card }));
  const timed = cards.map((card) => {
    if (!card || typeof card.title !== 'string') return null;
    const match = card.title.match(regex);
    if (!match) return null;
    return {
      minutes: Number.parseInt(match[1], 10),
      card,
    };
  });
  const validEntries = timed.filter((entry) => entry && Number.isFinite(entry.minutes));
  const total = validEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  if (total > 0 && validEntries.length > 0) {
    const scaled = validEntries.map((entry) => (entry.minutes * LESSON_DURATION_MINUTES) / total);
    const remainders = scaled.map((value, index) => ({
      index,
      remainder: value - Math.floor(value),
    }));
    const adjusted = scaled.map((value, index) => {
      const floor = Math.floor(value);
      const original = validEntries[index].minutes;
      const minValue = original >= 5 ? 5 : 1;
      return Math.max(minValue, floor);
    });

    let sum = adjusted.reduce((acc, value) => acc + value, 0);
    if (sum < LESSON_DURATION_MINUTES) {
      const diff = LESSON_DURATION_MINUTES - sum;
      remainders.sort((a, b) => b.remainder - a.remainder);
      for (let i = 0; i < diff; i += 1) {
        const target = remainders[i % remainders.length]?.index ?? 0;
        adjusted[target] += 1;
      }
    } else if (sum > LESSON_DURATION_MINUTES) {
      let diff = sum - LESSON_DURATION_MINUTES;
      remainders.sort((a, b) => a.remainder - b.remainder);
      let cursor = 0;
      const minValues = validEntries.map((entry) => (entry.minutes >= 5 ? 5 : 1));
      while (diff > 0 && remainders.length > 0) {
        const target = remainders[cursor % remainders.length].index;
        if (adjusted[target] > minValues[target]) {
          adjusted[target] -= 1;
          diff -= 1;
        }
        cursor += 1;
      }
    }

    remainders.sort((a, b) => b.index - a.index); // maintain stable updates
    validEntries.forEach((entry, idx) => {
      const card = entry.card;
      const minutes = adjusted[idx];
      if (card && typeof card.title === 'string') {
        card.title = card.title.replace(regex, `${minutes} min`);
      }
    });
  }

  return {
    ...block,
    title: block.title?.includes('Plano de voo') ? 'Plano de voo (1h40)' : block.title,
    cards,
  };
}

function normalizeTed(block) {
  if (!block || block.type !== 'callout') return block;
  const title = typeof block.title === 'string' ? block.title.toLowerCase() : '';
  if (!title.includes('ted')) return block;
  return {
    ...block,
    variant: block.variant ?? 'warning',
    title: 'TED pós-aula',
    content: TED_CONTENT,
  };
}

function hasClassActivity(block) {
  if (!block) return false;
  if (block.type === 'contentBlock' && typeof block.title === 'string') {
    return (
      block.title.toLowerCase().includes('atividade em sala') ||
      block.title.toLowerCase().includes('atividade de classe')
    );
  }
  if (block.type === 'callout' && typeof block.title === 'string') {
    return (
      block.title.toLowerCase().includes('atividade em sala') ||
      block.title.toLowerCase().includes('atividade de classe')
    );
  }
  return false;
}

function makeClassActivityBlock(lesson) {
  const rawTitle = typeof lesson.title === 'string' ? lesson.title : '';
  const themePart = rawTitle.includes(':')
    ? rawTitle.split(':').slice(1).join(':').trim()
    : rawTitle;
  const theme = themePart || 'o conteúdo da aula';

  return {
    type: 'contentBlock',
    title: 'Atividade em sala',
    content: [
      {
        type: 'paragraph',
        text: 'Em duplas ou trios, resolvam as questões a seguir para reforçar o aprendizado durante a aula.',
      },
      {
        type: 'orderedList',
        items: [
          {
            title: 'Questão teórica',
            text: `Explique com suas palavras os principais conceitos abordados em "${theme}" e destaque por que eles são importantes para a resolução de problemas.`,
          },
          {
            title: 'Questão prática',
            text: `Implemente ou descreva um exemplo curto relacionado a "${theme}" utilizando OnlineGDB ou Dev-C++ e compartilhe o resultado com o grupo.`,
          },
        ],
      },
    ],
  };
}

async function processLesson(fileName) {
  const fullPath = path.join(LESSONS_DIR, fileName);
  const lesson = await loadJson(fullPath);

  lesson.duration = LESSON_DURATION_MINUTES;
  lesson.resources = [MOODLE_RESOURCE];

  if (!lesson.assessment || typeof lesson.assessment !== 'object') {
    lesson.assessment = {};
  }
  lesson.assessment.type = 'prática';
  lesson.assessment.description =
    'Prática orientada para fortalecer os conceitos trabalhados em aula. Registre suas soluções e dúvidas para acompanhamento posterior.';

  if (Array.isArray(lesson.content)) {
    lesson.content = lesson.content
      .map((block) => normalizeWarmup(block))
      .map((block) => normalizeFlightPlan(block))
      .map((block) => normalizeLessonPlan(block))
      .map((block) => normalizeTed(block));

    const hasActivity = lesson.content.some((block) => hasClassActivity(block));
    if (!hasActivity) {
      const activityBlock = makeClassActivityBlock(lesson);
      const flightPlanIndex = lesson.content.findIndex((block) => block.type === 'flightPlan');
      if (flightPlanIndex >= 0) {
        lesson.content.splice(flightPlanIndex + 1, 0, activityBlock);
      } else {
        lesson.content.unshift(activityBlock);
      }
    }
  }

  await saveJson(fullPath, lesson);
}

async function processLessons() {
  const entries = await fs.readdir(LESSONS_DIR);
  const jsonFiles = entries.filter((file) => file.endsWith('.json'));
  await Promise.all(jsonFiles.map((file) => processLesson(file)));
}

async function updateManifest() {
  const manifest = await loadJson(MANIFEST_PATH);
  if (manifest && Array.isArray(manifest.entries)) {
    manifest.entries = manifest.entries.map((entry) => {
      if (entry && typeof entry === 'object' && entry.id?.startsWith('lesson-')) {
        return { ...entry, duration: LESSON_DURATION_MINUTES };
      }
      return entry;
    });
    await saveJson(MANIFEST_PATH, manifest);
  }
}

async function main() {
  await processLessons();
  await updateManifest();
  // eslint-disable-next-line no-console
  console.log('Alg I lessons atualizadas com ajustes gerais.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const lessonsDir = path.join('src', 'content', 'courses', 'algi', 'lessons');
const outputPath = path.join('docs', 'didactics', 'algi-content-audit.csv');

const recommendedPatterns = [
  /FORBELLONE/i,
  /MANZANO/i,
  /BACKES/i,
  /SANTOS/i,
  /ASCENCIO/i,
  /EBERSP/i,
];
const chapterPatterns = [/cap[íi]tulo/i, /cap\./i, /p\.\s*\d/i];
const examplePatterns = [/exemplo/i, /estudo de caso/i, /caso pr[áa]tico/i, /aplica[cç][ãa]o/i];
const methodologyPatterns = [
  /metodolog/i,
  /din[aâ]mica/i,
  /laborat[óo]rio/i,
  /oficina/i,
  /canvas/i,
  /debate/i,
];

const header = [
  'Aula',
  'Autores citados',
  'Capitulos/paginas',
  'Exemplos aplicados',
  'Metodologias descritas',
  'Rubrica explicita',
  'Observacoes',
];

function toCsvValue(value) {
  const normalized = String(value ?? '').replace(/"/g, '""');
  return `"${normalized}"`;
}

function toCsv(rows) {
  return rows.map((row) => row.map(toCsvValue).join(',')).join('\n');
}

function hasAnyPattern(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

async function loadLessons() {
  const files = (await fs.readdir(lessonsDir)).filter((file) => file.endsWith('.json')).sort();
  const lessons = [];

  for (const file of files) {
    const fullPath = path.join(lessonsDir, file);
    const raw = await fs.readFile(fullPath, 'utf8');
    const data = JSON.parse(raw);

    lessons.push({
      id: file.replace('.json', ''),
      fullPath,
      data,
      raw,
    });
  }

  return lessons;
}

function summarizeLesson(lesson) {
  const { id, fullPath, data, raw } = lesson;
  const bibliography = Array.isArray(data.bibliography) ? data.bibliography.map(String) : [];
  const flattened = raw.toLowerCase();

  const hasRecommended = bibliography.some((entry) => hasAnyPattern(entry, recommendedPatterns));
  const hasChapter = bibliography.some((entry) => hasAnyPattern(entry, chapterPatterns));
  const hasExample = hasAnyPattern(flattened, examplePatterns);
  const hasMethodology = hasAnyPattern(flattened, methodologyPatterns);
  const assessment = data.assessment ?? {};
  const hasRubric = Boolean(
    assessment.rubric ||
      assessment.rubricUrl ||
      (Array.isArray(assessment.criteria) && assessment.criteria.length > 0)
  );

  const observations = [];

  if (!hasRecommended) {
    observations.push(`Adicionar autores do plano de ensino em ${fullPath} → bibliography`);
  }

  if (!hasChapter) {
    observations.push(`Indicar cap./páginas nas referências de ${fullPath}`);
  }

  if (!hasExample) {
    observations.push(`Explicitar exemplos ou estudos de caso em ${fullPath}`);
  }

  if (!hasMethodology) {
    observations.push(`Descrever metodologia/dinâmicas MD3 em ${fullPath}`);
  }

  if (!hasRubric) {
    observations.push(`Incluir rubrica ou critérios em assessment de ${fullPath}`);
  }

  return [
    id,
    hasRecommended ? 'OK' : 'Pendente',
    hasChapter ? 'Parcial' : 'Ausente',
    hasExample ? 'Parcial' : 'Ausente',
    hasMethodology ? 'Parcial' : 'Ausente',
    hasRubric ? 'OK' : 'Ausente',
    observations.length ? observations.join('; ') : 'Sem pendencias criticas',
  ];
}

async function main() {
  const lessons = await loadLessons();
  const rows = [header];
  const summaries = lessons.map(summarizeLesson);
  rows.push(...summaries);

  const csv = `${toCsv(rows)}\n`;
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, csv, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`Planilha exportada para ${outputPath} com ${summaries.length} aulas.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

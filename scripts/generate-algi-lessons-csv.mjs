import { promises as fs } from 'fs';
import path from 'path';

const lessonsDir = path.resolve('src/content/courses/algi/lessons');
const outputPath = path.resolve('reports/algi-lessons-overview.csv');

function quote(value) {
  const normalized = value.replace(/"/g, '""');
  return `"${normalized}"`;
}

async function main() {
  const files = await fs.readdir(lessonsDir);
  const lessonFiles = files.filter((file) => file.endsWith('.json') && !file.endsWith('.vue'));
  const rows = [
    ['lessonId', 'title', 'objective', 'objectives', 'competencies', 'skills', 'outcomes'],
  ];

  for (const file of lessonFiles.sort()) {
    const content = await fs.readFile(path.join(lessonsDir, file), 'utf8');
    const lesson = JSON.parse(content);
    const join = (arr) => (arr ?? []).join(' | ');
    rows.push([
      lesson.id,
      lesson.title,
      lesson.objective ?? '',
      join(lesson.objectives ?? []),
      join(lesson.competencies ?? []),
      join(lesson.skills ?? []),
      join(lesson.outcomes ?? []),
    ]);
  }

  const csv = rows.map((row) => row.map((cell) => quote(cell)).join(',')).join('\n') + '\n';
  await fs.writeFile(outputPath, csv);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

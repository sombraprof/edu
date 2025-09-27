import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const coursesDir = path.resolve(__dirname, '../src/content/courses');
const reportsDir = path.resolve(__dirname, '../reports');

async function safeJsonRead(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function indexByFile(entries = []) {
  return new Map(entries.map((entry) => [entry.file, entry]));
}

function splitByExtension(files = []) {
  const groups = { json: [], vue: [], other: [] };
  for (const name of files) {
    if (name.endsWith('.json')) {
      groups.json.push(name);
    } else if (name.endsWith('.vue')) {
      groups.vue.push(name);
    } else {
      groups.other.push(name);
    }
  }
  return groups;
}

async function summarizeLessons(coursePath) {
  const lessonsIndexPath = path.join(coursePath, 'lessons.json');
  const lessonsDir = path.join(coursePath, 'lessons');

  const index = (await safeJsonRead(lessonsIndexPath)) ?? [];
  let directoryFiles = [];
  try {
    directoryFiles = await fs.readdir(lessonsDir);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const groups = splitByExtension(directoryFiles);
  const filesSet = new Set(directoryFiles);
  const entriesByFile = indexByFile(index);

  const missingFiles = index
    .filter((entry) => entry.file && !filesSet.has(entry.file))
    .map((entry) => ({ id: entry.id, file: entry.file }));

  const orphanFiles = [...filesSet]
    .filter((file) => file.endsWith('.json') || file.endsWith('.vue'))
    .filter((file) => !entriesByFile.has(file))
    .map((file) => ({ file }));

  const wrappersMismatch = [];
  for (const entry of index) {
    if (!entry.file) continue;
    const base = entry.file.replace(/\.(json|vue)$/i, '');
    const hasJson = filesSet.has(`${base}.json`);
    const hasVue = filesSet.has(`${base}.vue`);
    if (hasJson && hasVue) {
      wrappersMismatch.push({ id: entry.id, baseFile: base, duplicated: true });
    }
  }

  const published = index.filter((entry) => entry.available !== false).length;
  const upcoming = index.length - published;

  return {
    total: index.length,
    published,
    upcoming,
    directory: {
      json: groups.json.length,
      vue: groups.vue.length,
      other: groups.other,
    },
    missingFiles,
    orphanFiles,
    duplicatedWrappers: wrappersMismatch,
  };
}

async function summarizeManifest(coursePath, manifestName, baseDir) {
  const manifestPath = path.join(coursePath, `${manifestName}.json`);
  const index = (await safeJsonRead(manifestPath)) ?? [];
  const dirPath = baseDir ? path.join(coursePath, baseDir) : null;

  let directoryFiles = [];
  if (dirPath) {
    try {
      directoryFiles = await fs.readdir(dirPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  const filesSet = new Set(directoryFiles);
  const missingFiles = index
    .filter((entry) => entry.file && !filesSet.has(entry.file))
    .map((entry) => ({ id: entry.id, file: entry.file }));

  const orphanFiles = dirPath
    ? [...filesSet]
        .filter((file) => !index.some((entry) => entry.file === file))
        .map((file) => ({ file }))
    : [];

  const published = index.filter((entry) => entry.available !== false).length;
  const upcoming = index.length - published;

  return {
    total: index.length,
    published,
    upcoming,
    missingFiles,
    orphanFiles,
  };
}

async function buildSummary() {
  const courseDirs = await fs.readdir(coursesDir, { withFileTypes: true });
  const courses = [];

  for (const dirent of courseDirs) {
    if (!dirent.isDirectory()) continue;
    const courseId = dirent.name;
    const coursePath = path.join(coursesDir, courseId);
    const metaPath = path.join(coursePath, 'meta.json');
    const meta = await safeJsonRead(metaPath);

    const lessons = await summarizeLessons(coursePath);
    const exercises = await summarizeManifest(coursePath, 'exercises', 'exercises');
    const supplements = await summarizeManifest(coursePath, 'supplements', null);

    courses.push({
      id: courseId,
      title: meta?.title ?? courseId,
      institution: meta?.institution ?? 'Desconhecida',
      summary: {
        lessons,
        exercises,
        supplements,
      },
    });
  }

  const output = {
    generatedAt: new Date().toISOString(),
    courses,
  };

  await fs.mkdir(reportsDir, { recursive: true });
  const target = path.join(reportsDir, 'course-content-summary.json');
  await fs.writeFile(target, JSON.stringify(output, null, 2));
  return { target, output };
}

buildSummary()
  .then(({ target }) => {
    // eslint-disable-next-line no-console
    console.log(`Course content summary generated at ${target}`);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  });

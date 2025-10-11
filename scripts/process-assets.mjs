#!/usr/bin/env node
import { mkdir, readFile, readdir, stat, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MEDIA_ROOT = path.join(ROOT_DIR, 'public', 'media', 'interactive');
const OPTIMIZED_ROOT = path.join(MEDIA_ROOT, 'optimized');
const METADATA_PATH = path.join(MEDIA_ROOT, 'metadata.json');

const SUPPORTED_INPUT_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);
const RESPONSIVE_WIDTHS = [480, 720, 1080, 1440];
const RESPONSIVE_FORMATS = [
  { format: 'webp', quality: 80 },
  { format: 'avif', quality: 50 },
];

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const force = args.has('--force');

const logPrefix = '[media:process]';

function log(...parts) {
  console.log(logPrefix, ...parts);
}

function warn(...parts) {
  console.warn(logPrefix, ...parts);
}

function error(...parts) {
  console.error(logPrefix, ...parts);
}

async function ensureSharp() {
  try {
    const sharpModule = await import('sharp');
    return sharpModule.default;
  } catch (err) {
    error(
      'Sharp is required to optimise media assets. Install it with `npm install sharp --save-dev`.'
    );
    throw err;
  }
}

async function readMetadata() {
  try {
    const raw = await readFile(METADATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('metadata.json must export an object');
    }
    if (!Array.isArray(parsed.assets)) {
      parsed.assets = [];
    }
    return parsed;
  } catch (err) {
    if (err && (err.code === 'ENOENT' || err instanceof SyntaxError)) {
      warn('metadata.json not found or invalid. Generating fallback structure.');
      return { assets: [] };
    }
    throw err;
  }
}

async function writeMetadataFile(metadata) {
  const payload = JSON.stringify(metadata, null, 2);
  await writeFile(METADATA_PATH, `${payload}\n`, 'utf8');
}

async function collectMediaFiles() {
  const files = [];
  const entries = await readdir(MEDIA_ROOT, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === 'optimized') {
        continue;
      }
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_INPUT_EXTENSIONS.has(ext)) {
      continue;
    }
    files.push(path.join(MEDIA_ROOT, entry.name));
  }
  return files;
}

function ensureMetadataEntry(metadata, filename) {
  const existing = metadata.assets.find((asset) => asset.file === filename);
  if (existing) {
    return existing;
  }
  const entry = {
    file: filename,
    title: '',
    credit: '',
    license: '',
    source: '',
  };
  metadata.assets.push(entry);
  return entry;
}

function validateMetadataEntries(metadata, mediaFiles) {
  const errors = [];
  for (const asset of metadata.assets) {
    if (!asset || typeof asset !== 'object') {
      errors.push('All entries in metadata.assets must be objects.');
      continue;
    }
    if (typeof asset.file !== 'string' || !asset.file.trim()) {
      errors.push('Every metadata entry requires a non-empty `file` string.');
      continue;
    }
    if (typeof asset.credit !== 'string' || !asset.credit.trim()) {
      errors.push(`Missing credit for ${asset.file}.`);
    }
    if (typeof asset.license !== 'string' || !asset.license.trim()) {
      errors.push(`Missing license for ${asset.file}.`);
    }
  }

  const declared = new Set(metadata.assets.map((asset) => asset.file));
  for (const filePath of mediaFiles) {
    const filename = path.basename(filePath);
    if (!declared.has(filename)) {
      errors.push(`Metadata missing for ${filename}.`);
    }
  }

  return errors;
}

async function optimiseAssets(sharp, metadata) {
  await mkdir(OPTIMIZED_ROOT, { recursive: true });
  const mediaFiles = await collectMediaFiles();

  for (const filePath of mediaFiles) {
    const filename = path.basename(filePath);
    ensureMetadataEntry(metadata, filename);
    const outputDir = path.join(OPTIMIZED_ROOT, path.parse(filename).name);
    await mkdir(outputDir, { recursive: true });
    const fileStats = await stat(filePath);

    for (const { format, quality } of RESPONSIVE_FORMATS) {
      for (const width of RESPONSIVE_WIDTHS) {
        const outputName = `${path.parse(filename).name}-w${width}.${format}`;
        const outputPath = path.join(outputDir, outputName);

        if (!force) {
          try {
            const existing = await stat(outputPath);
            if (existing.mtimeMs >= fileStats.mtimeMs) {
              continue;
            }
          } catch {
            // File does not exist, continue with generation.
          }
        }

        log(`Generating ${path.relative(ROOT_DIR, outputPath)}`);
        const pipeline = sharp(filePath).resize({ width, withoutEnlargement: true });
        const formatter =
          format === 'avif' ? pipeline.avif({ quality }) : pipeline.webp({ quality });
        await formatter.toFile(outputPath);
      }
    }
  }

  return mediaFiles;
}

async function updateManifest(metadata) {
  metadata.generatedAt = new Date().toISOString();
  await writeMetadataFile(metadata);
}

async function main() {
  try {
    const metadata = await readMetadata();
    const mediaFiles = await collectMediaFiles();
    const errors = validateMetadataEntries(metadata, mediaFiles);

    if (errors.length > 0) {
      errors.forEach((message) => warn(message));
      if (checkOnly) {
        process.exitCode = 1;
        return;
      }
    }

    if (checkOnly) {
      log('Metadata check completed.');
      return;
    }

    const sharp = await ensureSharp();
    const processedFiles = await optimiseAssets(sharp, metadata);
    const postProcessErrors = validateMetadataEntries(metadata, processedFiles);
    if (postProcessErrors.length > 0) {
      postProcessErrors.forEach((message) => warn(message));
    }
    await updateManifest(metadata);
    log('Asset optimisation finished.');
  } catch (err) {
    error('Failed to process media assets.');
    error(err instanceof Error ? (err.stack ?? err.message) : err);
    process.exitCode = 1;
  }
}

main();

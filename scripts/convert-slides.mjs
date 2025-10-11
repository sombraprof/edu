#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_INPUT = path.join(__dirname, '..', 'src', 'content');
const DEFAULT_OUTPUT = path.join(__dirname, '..', 'public', 'slides');

function parseArgs(argv) {
  const args = { input: DEFAULT_INPUT, output: DEFAULT_OUTPUT, clean: false };
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--input' || token === '-i') {
      args.input = argv[++index] ?? args.input;
    } else if (token === '--output' || token === '-o') {
      args.output = argv[++index] ?? args.output;
    } else if (token === '--clean') {
      args.clean = true;
    } else if (token === '--help' || token === '-h') {
      printUsage();
      process.exit(0);
    }
  }
  return args;
}

function printUsage() {
  console.log(`\nconvert-slides.mjs\n-------------------\n`);
  console.log('Usage: node scripts/convert-slides.mjs [options]\n');
  console.log('Options:');
  console.log('  --input,  -i   Base directory with source slides (default: src/content)');
  console.log('  --output, -o   Output directory for generated decks (default: public/slides)');
  console.log('  --clean        Remove existing output before processing');
  console.log('  --help,  -h    Display this help message\n');
  console.log('The script looks for .pptx and .pdf files, converts them to HTML and PNG,');
  console.log('and produces a manifest that can be referenced by SlideDeck blocks.');
}

async function commandExists(command) {
  const probe = process.platform === 'win32' ? 'where' : 'which';
  return new Promise((resolve) => {
    const child = spawn(probe, [command]);
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

async function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

async function collectSlideFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);
      if (entry.isDirectory()) {
        const nested = await collectSlideFiles(entryPath);
        files.push(...nested);
      } else if (/\.(pptx|pdf)$/i.test(entry.name)) {
        files.push(entryPath);
      }
    })
  );
  return files;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function cleanDirectory(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function convertWithLibreOffice(command, inputPath, outputDir, format) {
  const args = ['--headless', '--convert-to', format, '--outdir', outputDir, inputPath];
  await run(command, args);
}

async function convertPdfWithPdftoppm(inputPath, outputDir, baseName) {
  const prefix = path.join(outputDir, baseName);
  await run('pdftoppm', ['-png', inputPath, prefix]);
}

async function normalizeGeneratedPngs(dir) {
  const entries = await fs.readdir(dir);
  const pngs = entries.filter((name) => name.toLowerCase().endsWith('.png')).sort();
  await Promise.all(
    pngs.map(async (name, index) => {
      const target = path.join(dir, `slide-${String(index + 1).padStart(2, '0')}.png`);
      if (name === path.basename(target)) {
        return;
      }
      await fs.rename(path.join(dir, name), target).catch(async (error) => {
        if (error && error.code === 'EXDEV') {
          const contents = await fs.readFile(path.join(dir, name));
          await fs.writeFile(target, contents);
          await fs.unlink(path.join(dir, name));
        } else {
          throw error;
        }
      });
    })
  );
  return pngs.length;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
    return false;
  }
}

async function convertSlidesFile(filePath, options) {
  const { libreOfficeCommand, hasPdftoppm, outputRoot } = options;
  const ext = path.extname(filePath).toLowerCase();
  const relative = path.relative(options.inputRoot, filePath);
  const baseName = path.basename(filePath, ext);
  const deckOutputDir = path.join(outputRoot, relative.replace(ext, ''));
  await ensureDir(deckOutputDir);

  console.log(`\n▶ Processing ${relative}`);

  let htmlGenerated = false;
  if (libreOfficeCommand) {
    try {
      await convertWithLibreOffice(libreOfficeCommand, filePath, deckOutputDir, 'html');
      const generatedHtml = path.join(deckOutputDir, `${baseName}.html`);
      const targetHtml = path.join(deckOutputDir, 'index.html');
      await fs.rename(generatedHtml, targetHtml).catch(async (error) => {
        if (error && error.code === 'ENOENT') {
          console.warn('  - LibreOffice did not generate HTML for', relative);
        } else if (error && error.code === 'EXDEV') {
          const contents = await fs.readFile(generatedHtml);
          await fs.writeFile(targetHtml, contents);
          await fs.unlink(generatedHtml);
        } else {
          throw error;
        }
      });
      if (await fileExists(targetHtml)) {
        htmlGenerated = true;
      }
      console.log('  ✓ HTML export ready');
    } catch (error) {
      console.warn('  ⚠️ Failed to export HTML via LibreOffice:', error.message);
    }
  } else {
    console.warn('  ⚠️ Skipping HTML export (LibreOffice not available)');
  }

  const pngTargetDir = path.join(deckOutputDir, 'png');
  await ensureDir(pngTargetDir);

  let pngGenerated = false;
  if (ext === '.pdf' && hasPdftoppm) {
    try {
      await convertPdfWithPdftoppm(filePath, pngTargetDir, baseName);
      const count = await normalizeGeneratedPngs(pngTargetDir);
      if (count > 0) {
        pngGenerated = true;
        console.log('  ✓ PNG previews generated via pdftoppm');
      } else {
        console.warn('  ⚠️ No PNG files were generated by pdftoppm');
      }
    } catch (error) {
      console.warn('  ⚠️ Failed to export PNG via pdftoppm:', error.message);
    }
  } else if (ext === '.pptx' && libreOfficeCommand) {
    try {
      await convertWithLibreOffice(libreOfficeCommand, filePath, pngTargetDir, 'png');
      const count = await normalizeGeneratedPngs(pngTargetDir);
      if (count > 0) {
        pngGenerated = true;
        console.log('  ✓ PNG previews generated via LibreOffice');
      } else {
        console.warn('  ⚠️ No PNG files were produced by LibreOffice');
      }
    } catch (error) {
      console.warn('  ⚠️ Failed to export PNG via LibreOffice:', error.message);
    }
  } else {
    console.warn('  ⚠️ Skipping PNG export (converter not available for this format)');
  }

  await writeManifest(deckOutputDir, relative, { hasHtml: htmlGenerated, hasPng: pngGenerated });
}

async function writeManifest(dir, sourceRelativePath, { hasHtml, hasPng }) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    source: sourceRelativePath,
    files: {},
  };
  if (hasHtml) {
    manifest.files.html = 'index.html';
  }
  if (hasPng) {
    const pngDir = path.join(dir, 'png');
    try {
      const entries = await fs.readdir(pngDir);
      const pngs = entries.filter((name) => name.toLowerCase().endsWith('.png')).sort();
      if (pngs.length) {
        manifest.files.png = pngs.map((name) => path.posix.join('png', name));
      }
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  const manifestPath = path.join(dir, 'deck.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log('  ✓ Manifest saved');
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.clean) {
    await cleanDirectory(args.output);
  }
  await ensureDir(args.output);

  if (!(await fileExists(args.input))) {
    console.warn(`Diretório de entrada não encontrado: ${args.input}`);
    return;
  }

  const [hasSoffice, hasLibreOffice, hasPdftoppm] = await Promise.all([
    commandExists('soffice'),
    commandExists('libreoffice'),
    commandExists('pdftoppm'),
  ]);

  const libreOfficeCommand = hasSoffice ? 'soffice' : hasLibreOffice ? 'libreoffice' : null;
  if (!libreOfficeCommand) {
    console.warn('⚠️ LibreOffice (soffice/libreoffice) not found. HTML export may be skipped.');
  }
  if (!hasPdftoppm) {
    console.warn('⚠️ `pdftoppm` not found. PDF to PNG conversion will be skipped.');
  }

  const files = await collectSlideFiles(args.input);
  if (!files.length) {
    console.log('Nenhum arquivo .pptx ou .pdf encontrado. Nada a converter.');
    return;
  }

  for (const file of files) {
    await convertSlidesFile(file, {
      inputRoot: args.input,
      outputRoot: args.output,
      libreOfficeCommand,
      hasPdftoppm,
    });
  }

  console.log('\nConversão de slides concluída.');
}

main().catch((error) => {
  console.error('Erro ao converter slides:', error);
  process.exit(1);
});

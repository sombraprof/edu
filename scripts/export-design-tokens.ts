import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDesignTokenExport } from '../src/theme/tokens';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, '../reports/design-tokens.json');

const tokens = buildDesignTokenExport();

await writeFile(outputPath, `${JSON.stringify(tokens, null, 2)}\n`, 'utf8');

console.log(`Design tokens export saved to ${path.relative(process.cwd(), outputPath)}`);

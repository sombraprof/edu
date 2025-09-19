#!/usr/bin/env node
/**
 * Script para converter aulas legadas em HTML para JSON de blocos.
 * Atualiza lessons.json e gera arquivos .json em cada pasta de lições.
 */
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  const coursesDir = path.join(process.cwd(), 'public', 'courses');
  const courses = await fs.readdir(coursesDir);
  for (const courseId of courses) {
    const coursePath = path.join(coursesDir, courseId);
    const indexPath = path.join(coursePath, 'lessons.json');
    let index;
    try {
      let rawIndex = await fs.readFile(indexPath, 'utf8');
      // Remover BOM para permitir parsing JSON
      rawIndex = rawIndex.replace(/^[\uFEFF\uFFFE]/g, '');
      index = JSON.parse(rawIndex);
    } catch (err) {
      console.warn(`Não foi possível ler índice de lições para curso '${courseId}'`);
      continue;
    }
    const newIndex = [];
    for (const entry of index) {
      if (entry.file.endsWith('.html')) {
        const htmlFilePath = path.join(coursePath, 'lessons', entry.file);
        let htmlContent;
        try {
          htmlContent = await fs.readFile(htmlFilePath, 'utf8');
        } catch (err) {
          console.warn(`Não foi possível ler arquivo HTML ${htmlFilePath}`);
          continue;
        }
        const jsonFileName = entry.file.replace(/\.html$/, '.json');
        const jsonFilePath = path.join(coursePath, 'lessons', jsonFileName);
        const lessonContent = {
          id: entry.id,
          title: entry.title,
          objective: '',
          content: [
            {
              type: 'html',
              html: htmlContent
            }
          ]
        };
        await fs.writeFile(jsonFilePath, JSON.stringify(lessonContent, null, 2), 'utf8');
        newIndex.push({ ...entry, file: jsonFileName });
      } else {
        newIndex.push(entry);
      }
    }
    await fs.writeFile(indexPath, JSON.stringify(newIndex, null, 2), 'utf8');
    console.log(`Convertido curso '${courseId}': atualizado lessons.json e gerado JSONs`);
  }
}

main().catch(err => {
  console.error('Erro ao converter lições:', err);
  process.exit(1);
});
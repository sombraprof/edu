#!/usr/bin/env node
/**
 * Script para converter blocos HTML <pre><code> em componentes CodeBlock estruturados
 * Converte automaticamente todos os arquivos JSON das aulas
 */
import { promises as fs } from 'fs';
import path from 'path';

async function convertHtmlToCodeBlocks(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let jsonContent = JSON.parse(content);

    function processContentBlocks(blocks) {
      return blocks.map(block => {
        if (block.type === 'contentBlock' && block.content) {
          // Process subBlocks within contentBlocks
          block.content = block.content.map(subBlock => {
            if (subBlock.type === 'subBlock' && subBlock.items) {
              const newItems = [];
              const codeBlocks = [];

              subBlock.items.forEach(item => {
                if (typeof item === 'string' && item.includes('<pre><code')) {
                  // Extract code from HTML
                  const codeMatch = item.match(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/);
                  if (codeMatch) {
                    const code = codeMatch[1]
                      .replace(/</g, '<')
                      .replace(/>/g, '>')
                      .replace(/&/g, '&')
                      .replace(/"/g, '"')
                      .replace(/'/g, "'");

                    // Extract language from class
                    const langMatch = item.match(/class="language-([^"]*)"/);
                    const language = langMatch ? langMatch[1] : 'plaintext';

                    // Remove the HTML part from the item
                    const cleanItem = item.replace(/<pre><code[^>]*>[\s\S]*?<\/code><\/pre>/g, '').trim();
                    if (cleanItem) {
                      newItems.push(cleanItem);
                    }

                    // Add code block
                    codeBlocks.push({
                      type: 'code',
                      language: language,
                      code: code
                    });
                  } else {
                    newItems.push(item);
                  }
                } else {
                  newItems.push(item);
                }
              });

              // Replace items with clean items
              subBlock.items = newItems;

              // Return both the modified subBlock and any code blocks
              return [subBlock, ...codeBlocks];
            }
            return subBlock;
          }).flat();
        } else if (block.type === 'html' && block.html && block.html.includes('<pre><code')) {
          // Handle HTML blocks with code
          const htmlBlocks = [];
          const codeBlocks = [];

          // Split HTML content and extract code blocks
          const parts = block.html.split(/(<pre><code[^>]*>[\s\S]*?<\/code><\/pre>)/);

          parts.forEach(part => {
            if (part.includes('<pre><code')) {
              const codeMatch = part.match(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/);
              if (codeMatch) {
                const code = codeMatch[1]
                  .replace(/</g, '<')
                  .replace(/>/g, '>')
                  .replace(/&/g, '&')
                  .replace(/"/g, '"')
                  .replace(/'/g, "'");

                const langMatch = part.match(/class="language-([^"]*)"/);
                const language = langMatch ? langMatch[1] : 'plaintext';

                codeBlocks.push({
                  type: 'code',
                  language: language,
                  code: code
                });
              }
            } else if (part.trim()) {
              htmlBlocks.push({
                type: 'html',
                html: part
              });
            }
          });

          return [...htmlBlocks, ...codeBlocks];
        }

        return block;
      }).flat();
    }

    // Process the content array
    if (jsonContent.content) {
      jsonContent.content = processContentBlocks(jsonContent.content);
    }

    // Write back the modified JSON
    await fs.writeFile(filePath, JSON.stringify(jsonContent, null, 2), 'utf8');
    console.log(`✅ Convertido: ${filePath}`);

  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

async function main() {
  const coursesDir = path.join(process.cwd(), 'public', 'courses');

  try {
    const courses = await fs.readdir(coursesDir);

    for (const course of courses) {
      const coursePath = path.join(coursesDir, course);
      const lessonsPath = path.join(coursePath, 'lessons');

      try {
        const lessonFiles = await fs.readdir(lessonsPath);

        for (const file of lessonFiles) {
          if (file.endsWith('.json')) {
            const filePath = path.join(lessonsPath, file);
            await convertHtmlToCodeBlocks(filePath);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Não foi possível processar aulas do curso ${course}:`, error.message);
      }
    }

    console.log('\n🎉 Conversão concluída! Todos os blocos HTML <pre><code> foram convertidos para componentes CodeBlock estruturados.');

  } catch (error) {
    console.error('❌ Erro ao executar conversão:', error);
    process.exit(1);
  }
}

main();
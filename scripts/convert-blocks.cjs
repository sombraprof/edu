const fs = require('fs');
const path = require('path');

const lessonNumbers = [22, 23, 24, 28, 30, 31, 32, 33, 34, 35, 36, 37, 38];
const lessonFiles = lessonNumbers.map((num) => `lesson-${String(num).padStart(2, '0')}.json`);

const baseDir = path.join(__dirname, '..', 'src', 'content', 'courses');

const courses = fs
  .readdirSync(baseDir)
  .filter((entry) => fs.statSync(path.join(baseDir, entry)).isDirectory());

const updatedFiles = [];

for (const course of courses) {
  const lessonsDir = path.join(baseDir, course, 'lessons');
  for (const lessonFile of lessonFiles) {
    const filePath = path.join(lessonsDir, lessonFile);
    if (!fs.existsSync(filePath)) continue;

    const original = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(original);
    let changed = false;

    function markChanged() {
      changed = true;
    }

    const specialTypes = new Set([
      'flightPlan',
      'timeline',
      'pipelineCanvas',
      'videosBlock',
      'cardGrid',
      'md3Table',
      'md3Flowchart',
    ]);

    function transformContentItem(item) {
      if (!item || typeof item !== 'object') {
        return item;
      }

      if (item.type && specialTypes.has(item.type)) {
        return transformBlock(item);
      }

      if (item.type === 'code') {
        markChanged();
        const next = {
          type: 'codeBlock',
          language: 'c',
          code: item.code,
        };
        if (item.title) {
          next.title = item.title;
        }
        return next;
      }

      if (Array.isArray(item.items)) {
        item.items = item.items.map((entry) => {
          if (entry && typeof entry === 'object' && entry.type) {
            return transformContentItem(entry);
          }
          return entry;
        });
      }

      if (Array.isArray(item.content)) {
        item.content = item.content.map((entry) => transformContentItem(entry));
      }

      return item;
    }

    function transformBlock(block) {
      if (!block || typeof block !== 'object') {
        return block;
      }

      switch (block.type) {
        case 'flightPlan': {
          markChanged();
          const cards = Array.isArray(block.items)
            ? block.items.map((item, index) => {
                let title = `Etapa ${index + 1}`;
                let content = typeof item === 'string' ? item.trim() : '';
                if (typeof item === 'string') {
                  const colonIndex = item.indexOf(':');
                  if (colonIndex !== -1) {
                    title = item.slice(0, colonIndex).trim();
                    content = item.slice(colonIndex + 1).trim();
                  } else {
                    const timeMatch = item.match(/^\(([^)]+)\)\s*(.*)$/);
                    if (timeMatch) {
                      title = timeMatch[1].trim();
                      content = timeMatch[2].trim();
                    } else {
                      const trimmed = item.trim();
                      if (trimmed) {
                        title = trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
                        content = trimmed;
                      }
                    }
                  }
                }
                return {
                  icon: 'check-circle',
                  title,
                  content,
                };
              })
            : [];
          return {
            type: 'lessonPlan',
            title: block.title,
            cards,
          };
        }
        case 'timeline': {
          markChanged();
          const items = Array.isArray(block.steps)
            ? block.steps.map((step) => {
                const pieces = [];
                if (step && typeof step === 'object') {
                  if (step.title) {
                    pieces.push(step.title.trim());
                  }
                  if (step.content) {
                    pieces.push(step.content.trim());
                  }
                }
                return { text: pieces.join(' – ') };
              })
            : [];
          const content = [];
          if (items.length > 0) {
            content.push({
              type: 'orderedList',
              items,
            });
          }
          return {
            type: 'contentBlock',
            title: block.title,
            content,
          };
        }
        case 'pipelineCanvas': {
          markChanged();
          const items = Array.isArray(block.stages)
            ? block.stages.map((stage) => {
                const parts = [];
                if (stage.title) {
                  parts.push(stage.title.trim());
                }
                if (stage.summary) {
                  parts.push(stage.summary.trim());
                }
                if (Array.isArray(stage.owners) && stage.owners.length > 0) {
                  parts.push(`Responsáveis: ${stage.owners.join(', ')}`);
                }
                if (typeof stage.durationHours === 'number') {
                  parts.push(`Duração: ${stage.durationHours}h`);
                }
                if (Array.isArray(stage.activities) && stage.activities.length > 0) {
                  const labels = stage.activities
                    .map((activity) => (activity && activity.label ? activity.label.trim() : null))
                    .filter(Boolean);
                  if (labels.length > 0) {
                    parts.push(`Atividades: ${labels.join('; ')}`);
                  }
                }
                if (Array.isArray(stage.deliverables) && stage.deliverables.length > 0) {
                  const deliverables = stage.deliverables
                    .map((deliverable) =>
                      deliverable && deliverable.label ? deliverable.label.trim() : null
                    )
                    .filter(Boolean);
                  if (deliverables.length > 0) {
                    parts.push(`Entregáveis: ${deliverables.join('; ')}`);
                  }
                }
                if (Array.isArray(stage.risks) && stage.risks.length > 0) {
                  const risks = stage.risks
                    .map((risk) => {
                      if (!risk || !risk.label) return null;
                      const mitigation = risk.mitigation ? ` (${risk.mitigation.trim()})` : '';
                      return `${risk.label.trim()}${mitigation}`;
                    })
                    .filter(Boolean);
                  if (risks.length > 0) {
                    parts.push(`Riscos: ${risks.join('; ')}`);
                  }
                }
                if (Array.isArray(stage.checkpoints) && stage.checkpoints.length > 0) {
                  parts.push(`Checkpoints: ${stage.checkpoints.join(', ')}`);
                }
                return { text: parts.join(' | ') };
              })
            : [];

          const content = [];
          if (block.summary) {
            content.push({ type: 'paragraph', text: block.summary.trim() });
          }
          if (items.length > 0) {
            content.push({ type: 'unorderedList', items });
          }
          return {
            type: 'contentBlock',
            title: block.title,
            content,
          };
        }
        case 'videosBlock': {
          markChanged();
          const items = Array.isArray(block.videos)
            ? block.videos.map((video) => {
                if (!video || typeof video !== 'object') {
                  return { text: '' };
                }
                const pieces = [];
                if (video.title) {
                  pieces.push(video.title.trim());
                }
                if (video.caption) {
                  pieces.push(video.caption.trim());
                }
                if (video.url) {
                  pieces.push(video.url.trim());
                } else if (video.youtubeId) {
                  pieces.push(`https://www.youtube.com/watch?v=${video.youtubeId}`);
                }
                return { text: pieces.join(' – ') };
              })
            : [];
          const content = [];
          if (items.length > 0) {
            content.push({ type: 'unorderedList', items });
          }
          return {
            type: 'contentBlock',
            title: block.title,
            content,
          };
        }
        case 'cardGrid': {
          markChanged();
          const items = Array.isArray(block.cards)
            ? block.cards.map((card) => {
                if (!card || typeof card !== 'object') {
                  return null;
                }
                const details = [];
                if (card.subtitle) {
                  details.push(card.subtitle.trim());
                }
                if (card.content) {
                  details.push(card.content.trim());
                }
                let bulletText = '';
                let normalized = [];
                if (Array.isArray(card.items) && card.items.length > 0) {
                  normalized = card.items
                    .map((entry) => {
                      if (!entry) return null;
                      if (typeof entry === 'string') {
                        return entry.trim();
                      }
                      if (entry && typeof entry === 'object' && entry.text) {
                        return entry.text.trim();
                      }
                      return null;
                    })
                    .filter(Boolean);
                  if (normalized.length > 0) {
                    bulletText = normalized.map((line) => `- ${line}`).join('\n');
                  }
                }
                const detailText = details.join(' ').trim();
                let contentText = detailText;
                if (!contentText && normalized.length > 0) {
                  contentText = normalized[0];
                }
                if (!contentText && card.title) {
                  contentText = card.title.trim();
                }
                const representation = {
                  title: card.title || 'Comparativo',
                  content: contentText,
                  language: 'plaintext',
                };
                const combined = [detailText, bulletText].filter(
                  (value) => value && value.trim().length > 0
                );
                if (combined.length > 0) {
                  representation.code = combined.join('\n');
                }
                return representation;
              })
            : [];

          return {
            type: 'representations',
            title: block.title,
            items: items.filter(Boolean),
          };
        }
        case 'code': {
          markChanged();
          const content = [
            {
              type: 'codeBlock',
              language: 'c',
              code: block.code,
            },
          ];
          return {
            type: 'contentBlock',
            title: block.title || block.caption || 'Exemplo de código',
            content,
          };
        }
        case 'codeBlock': {
          markChanged();
          const content = [
            {
              type: 'codeBlock',
              language: block.language || 'c',
              code: block.code,
            },
          ];
          return {
            type: 'contentBlock',
            title: block.title || 'Exemplo de código',
            content,
          };
        }
        case 'md3Table': {
          markChanged();
          const headers = Array.isArray(block.headers) ? block.headers : [];
          const items = Array.isArray(block.rows)
            ? block.rows.map((row) => {
                if (!Array.isArray(row)) {
                  return { text: '' };
                }
                const cells = row.map((cell, index) => {
                  const header = headers[index] ? `${headers[index]}: ` : '';
                  return `${header}${cell}`.trim();
                });
                return { text: cells.join(' | ') };
              })
            : [];
          const content = [];
          if (block.title) {
            // title will be set outside
          }
          if (items.length > 0) {
            content.push({ type: 'unorderedList', items });
          }
          return {
            type: 'contentBlock',
            title: block.title,
            content,
          };
        }
        case 'md3Flowchart': {
          markChanged();
          const nodeItems = Array.isArray(block.nodes)
            ? block.nodes
                .map((node, index) => {
                  if (!node || typeof node !== 'object') {
                    return { text: `Passo ${index + 1}` };
                  }
                  const parts = [];
                  if (node.label) {
                    parts.push(node.label.trim());
                  }
                  if (node.type) {
                    parts.push(`tipo: ${node.type}`);
                  }
                  const text = parts.join(' – ');
                  return { text };
                })
                .filter((entry) => entry.text && entry.text.trim().length > 0)
            : [];
          const edgeItems = Array.isArray(block.edges)
            ? block.edges
                .map((edge) => {
                  const parts = [];
                  if (Array.isArray(edge)) {
                    const [from, to, description] = edge;
                    if (from && to) {
                      parts.push(`${from} → ${to}`);
                    }
                    if (description) {
                      parts.push(String(description).trim());
                    }
                  } else if (edge && typeof edge === 'object') {
                    if (edge.from && edge.to) {
                      parts.push(`${edge.from} → ${edge.to}`);
                    }
                    if (edge.description) {
                      parts.push(edge.description.trim());
                    }
                  }
                  const text = parts.join(' – ');
                  return { text };
                })
                .filter((entry) => entry.text && entry.text.trim().length > 0)
            : [];
          const content = [];
          if (block.summary) {
            content.push({ type: 'paragraph', text: block.summary.trim() });
          }
          if (nodeItems.length > 0) {
            content.push({ type: 'orderedList', items: nodeItems });
          }
          if (edgeItems.length > 0) {
            content.push({ type: 'unorderedList', items: edgeItems });
          }
          return {
            type: 'contentBlock',
            title: block.title,
            content,
          };
        }
        case 'representations': {
          const result = { ...block };
          if (Array.isArray(result.items)) {
            let mutated = false;
            result.items = result.items.map((item) => {
              if (!item || typeof item !== 'object') {
                return item;
              }
              let content = typeof item.content === 'string' ? item.content.trim() : '';
              if (!content) {
                let fallback = '';
                if (typeof item.code === 'string') {
                  const lines = item.code.split('\n');
                  const firstLine = lines.find((line) => line && line.trim().length > 0);
                  if (firstLine) {
                    fallback = firstLine.replace(/^[-•]\s*/, '').trim();
                  }
                }
                if (!fallback && item.title) {
                  fallback = item.title.trim();
                }
                const updated = {
                  ...item,
                  content: fallback,
                };
                mutated = true;
                return updated;
              }
              return item;
            });
            if (mutated) {
              markChanged();
            }
          }
          return result;
        }
        default: {
          const result = { ...block };
          if (Array.isArray(result.content)) {
            result.content = result.content.map((item) => transformContentItem({ ...item }));
          }
          if (Array.isArray(result.items)) {
            result.items = result.items.map((item) => {
              if (item && typeof item === 'object' && item.type) {
                return transformContentItem({ ...item });
              }
              return item;
            });
          }
          return result;
        }
      }
    }

    if (Array.isArray(data.content)) {
      data.content = data.content.map((block) => transformBlock(block));
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      updatedFiles.push(filePath);
    }
  }
}

if (updatedFiles.length === 0) {
  console.log('No files updated.');
} else {
  console.log('Updated files:');
  for (const file of updatedFiles) {
    console.log(` - ${path.relative(path.join(__dirname, '..'), file)}`);
  }
}

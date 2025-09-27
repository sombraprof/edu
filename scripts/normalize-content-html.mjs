import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_ROOT = path.join(__dirname, '..', 'src', 'content', 'courses');

function normalizeInline(text) {
  return text
    .replace(/[\t\r\f\v]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function nodeText(node) {
  if (!node) {
    return '';
  }

  const { Node } = node.ownerDocument.defaultView;

  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node;
    if (el.tagName === 'BR') {
      return '\n';
    }

    if (el.tagName === 'A') {
      const label = Array.from(el.childNodes).map(nodeText).join('');
      const href = el.getAttribute('href');
      if (href) {
        return `${label} (${href})`;
      }
      return label;
    }

    return Array.from(el.childNodes).map(nodeText).join('');
  }

  return '';
}

function htmlToBlocks(html) {
  const dom = new JSDOM(`<body>${html}</body>`);
  const { document, Node } = dom.window;
  const blocks = [];
  let inlineBuffer = '';

  const flushInline = () => {
    const text = normalizeInline(inlineBuffer);
    if (text) {
      blocks.push({ type: 'paragraph', text });
    }
    inlineBuffer = '';
  };

  document.body.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      inlineBuffer += child.textContent ?? '';
      return;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const el = child;
    if (el.tagName === 'P') {
      flushInline();
      const text = normalizeInline(nodeText(el));
      if (text) {
        blocks.push({ type: 'paragraph', text });
      }
      return;
    }

    if (el.tagName === 'UL' || el.tagName === 'OL') {
      flushInline();
      const items = Array.from(el.children)
        .map((item) => normalizeInline(nodeText(item)))
        .filter((item) => item.length > 0);
      if (items.length) {
        blocks.push({ type: 'list', ordered: el.tagName === 'OL', items });
      }
      return;
    }

    if (el.tagName === 'BR') {
      inlineBuffer += '\n';
      return;
    }

    inlineBuffer += nodeText(el);
  });

  flushInline();

  if (!blocks.length) {
    const text = normalizeInline(nodeText(document.body));
    if (text) {
      blocks.push({ type: 'paragraph', text });
    }
  }

  return blocks;
}

function htmlToText(html) {
  const blocks = htmlToBlocks(html);
  const parts = [];

  blocks.forEach((block) => {
    if (block.type === 'paragraph') {
      parts.push(block.text);
    } else if (block.type === 'list') {
      block.items.forEach((item) => {
        parts.push(`- ${item}`);
      });
    }
  });

  return parts.join('\n');
}

const CODE_KEYS = new Set(['code', 'example']);

function transform(value, context = {}) {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      transform(item, {
        parent: value,
        key: index,
        parentKey: context.key,
        parentObject: context.parentObject,
      })
    );
  }

  if (value && typeof value === 'object') {
    if (value.type === 'callout') {
      return transformCallout(value, context);
    }

    if (value.type === 'bibliography') {
      return transformBibliography(value, context);
    }

    let htmlText = null;
    if (typeof value.html === 'string') {
      htmlText = htmlToText(value.html);
    }

    const result = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === 'html') {
        continue;
      }
      result[key] = transform(val, {
        parent: value,
        key,
        parentObject: value,
      });
    }

    if (htmlText && typeof result.text !== 'string') {
      result.text = htmlText;
    }

    if (result.type === 'list' && Array.isArray(result.items)) {
      result.items = result.items.map((item) =>
        typeof item === 'string' && /</.test(item)
          ? htmlToText(item)
          : normalizeInline(String(item))
      );
    }

    if (result.type === 'paragraph' && typeof result.text === 'string' && /</.test(result.text)) {
      result.text = htmlToText(result.text);
    }

    if (result.type === 'contentBlock' && Array.isArray(result.content)) {
      result.content = result.content.map((block) =>
        transform(block, { parent: result.content, key: null })
      );
    }

    return result;
  }

  if (typeof value === 'string') {
    if (!/[<>]/.test(value)) {
      return value;
    }

    if (context && CODE_KEYS.has(context.key)) {
      return value;
    }

    if (context && context.parentObject && context.parentObject.type === 'code') {
      return value;
    }

    return htmlToText(value);
  }

  return value;
}

function transformCallout(callout) {
  const result = {};

  for (const [key, val] of Object.entries(callout)) {
    if (key === 'content' || key === 'html') {
      continue;
    }
    result[key] = transform(val, { parent: callout, key, parentObject: callout });
  }

  const rawContent = callout.content;
  const normalized = [];

  if (typeof rawContent === 'string') {
    if (rawContent.trim()) {
      normalized.push(...htmlToBlocks(rawContent));
    }
  } else if (Array.isArray(rawContent)) {
    rawContent.forEach((block) => {
      if (typeof block === 'string') {
        if (block.trim()) {
          if (/<[a-z][\s\S]*>/i.test(block)) {
            normalized.push(...htmlToBlocks(block));
          } else {
            normalized.push({ type: 'paragraph', text: normalizeInline(block) });
          }
        }
        return;
      }

      if (!block || typeof block !== 'object') {
        return;
      }

      if (typeof block.html === 'string') {
        const blocks = htmlToBlocks(block.html);
        normalized.push(...blocks);
        return;
      }

      if (block.type === 'list' && Array.isArray(block.items)) {
        const items = block.items.map((item) =>
          typeof item === 'string' && /</.test(item)
            ? htmlToText(item)
            : normalizeInline(String(item))
        );
        normalized.push({ type: 'list', ordered: !!block.ordered, items });
        return;
      }

      if (block.type === 'paragraph' && typeof block.text === 'string' && /</.test(block.text)) {
        normalized.push({ type: 'paragraph', text: htmlToText(block.text) });
        return;
      }

      normalized.push(transform(block, { parent: callout, key: 'content', parentObject: callout }));
    });
  }

  result.content = normalized.filter((block) => {
    if (!block) {
      return false;
    }
    if (block.type === 'paragraph') {
      return typeof block.text === 'string' && block.text.trim().length > 0;
    }
    if (block.type === 'list') {
      return Array.isArray(block.items) && block.items.length > 0;
    }
    return true;
  });

  return result;
}

function transformBibliography(block) {
  const result = {};

  for (const [key, val] of Object.entries(block)) {
    if (key === 'content' || key === 'items' || key === 'html') {
      continue;
    }
    result[key] = transform(val, { parent: block, key, parentObject: block });
  }

  const items = [];

  if (Array.isArray(block.items)) {
    block.items.forEach((entry) => {
      if (typeof entry === 'string') {
        const value = /[<>]/.test(entry) ? htmlToText(entry) : normalizeInline(entry);
        items.push(value);
      } else if (entry && typeof entry === 'object' && typeof entry.html === 'string') {
        items.push(htmlToText(entry.html));
      }
    });
  }

  if (Array.isArray(block.content)) {
    block.content.forEach((entry) => {
      if (typeof entry === 'string') {
        const value = /[<>]/.test(entry) ? htmlToText(entry) : normalizeInline(entry);
        items.push(value);
        return;
      }

      if (entry && typeof entry === 'object') {
        if (typeof entry.html === 'string') {
          items.push(htmlToText(entry.html));
        } else if (typeof entry.text === 'string') {
          const value = /[<>]/.test(entry.text)
            ? htmlToText(entry.text)
            : normalizeInline(entry.text);
          items.push(value);
        }
      }
    });
  }

  if (typeof block.content === 'string') {
    items.push(htmlToText(block.content));
  }

  result.items = items.filter((value) => value && value.length > 0);

  return result;
}

async function collectJsonFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsonFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function processFile(file) {
  const original = await fs.readFile(file, 'utf8');
  const data = JSON.parse(original);
  const transformed = transform(data);
  const output = `${JSON.stringify(transformed, null, 2)}\n`;

  if (output !== original) {
    await fs.writeFile(file, output, 'utf8');
    return true;
  }

  return false;
}

async function main() {
  const files = await collectJsonFiles(CONTENT_ROOT);
  let updated = 0;

  for (const file of files) {
    const changed = await processFile(file);
    if (changed) {
      updated += 1;
      console.log(`Normalized ${path.relative(CONTENT_ROOT, file)}`);
    }
  }

  console.log(`Completed. Updated ${updated} file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

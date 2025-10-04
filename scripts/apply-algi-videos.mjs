#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const LESSONS_DIR = path.join(ROOT, 'src/content/courses/algi/lessons');
const CANDIDATE_FILE = '/tmp/algivids_unique.txt';
const VIDEO_BLOCK_TITLE = 'Vídeos de apoio';

function extractVideoId(value) {
  if (!value) return null;
  if (value.includes('youtube.com/embed/')) {
    const match = value.match(/embed\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
  }
  if (value.includes('watch?v=')) {
    const match = value.match(/watch\?v=([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
  }
  if (value.includes('youtu.be/')) {
    const match = value.match(/youtu.be\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];
  }
  return null;
}

async function loadLesson(fileName) {
  const fullPath = path.join(LESSONS_DIR, fileName);
  const raw = await fs.readFile(fullPath, 'utf8');
  return { fullPath, data: JSON.parse(raw) };
}

function ensureVideosBlock(block) {
  if (!block || block.type !== 'videos') return false;
  return true;
}

function fetchVideoMetadata(id) {
  const url = `https://r.jina.ai/https://www.youtube.com/watch?v=${id}`;
  let output = '';
  try {
    output = execSync(`curl -s --max-time 10 ${JSON.stringify(url)}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (error) {
    return { title: `Vídeo recomendado (${id})`, src: `https://www.youtube.com/embed/${id}` };
  }
  const titleMatch = output.match(/^Title:\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : `Vídeo recomendado (${id})`;
  return {
    title,
    src: `https://www.youtube.com/embed/${id}`,
  };
}

async function main() {
  const candidateText = await fs.readFile(CANDIDATE_FILE, 'utf8').catch(() => '');
  const candidateIds = candidateText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace('watch?v=', ''));
  if (candidateIds.length === 0) {
    throw new Error('Nenhum candidato de vídeo encontrado em /tmp/algivids_unique.txt');
  }

  const lessonFiles = (await fs.readdir(LESSONS_DIR)).filter((file) => file.endsWith('.json'));
  const lessons = await Promise.all(lessonFiles.map(loadLesson));

  const existingVideoIds = new Set();
  for (const lesson of lessons) {
    const blocks = Array.isArray(lesson.data.content) ? lesson.data.content : [];
    for (const block of blocks) {
      if (block && (block.type === 'videos' || block.type === 'videosBlock')) {
        const videos = Array.isArray(block.videos) ? block.videos : [];
        for (const video of videos) {
          const id = extractVideoId(video?.src || video?.url || video?.youtubeId);
          if (id) existingVideoIds.add(id);
        }
      }
    }
  }

  const availableIds = candidateIds.filter((id) => !existingVideoIds.has(id));
  if (availableIds.length < 80) {
    console.warn(
      `Aviso: apenas ${availableIds.length} vídeos disponíveis após filtrar duplicados.`
    );
  }

  const missingLessons = [];
  for (const lesson of lessons) {
    const blocks = Array.isArray(lesson.data.content) ? lesson.data.content : [];
    const videoBlocks = blocks.filter(
      (block) => block && (block.type === 'videos' || block.type === 'videosBlock')
    );
    if (videoBlocks.length === 0) {
      missingLessons.push({ lesson, needed: 2, existingBlock: null });
    } else {
      const block = videoBlocks[0];
      const currentCount = Array.isArray(block.videos) ? block.videos.length : 0;
      if (currentCount < 2) {
        missingLessons.push({ lesson, needed: 2 - currentCount, existingBlock: block });
      }
    }
  }

  const assignments = new Map();
  for (const { lesson, needed } of missingLessons) {
    const picks = [];
    for (let i = 0; i < needed; i += 1) {
      const id = availableIds.shift();
      if (!id) {
        throw new Error('Acabaram os vídeos candidatos antes de completar todas as aulas.');
      }
      existingVideoIds.add(id);
      picks.push(id);
    }
    assignments.set(lesson.fullPath, picks);
  }

  for (const { lesson, needed, existingBlock } of missingLessons) {
    const picks = assignments.get(lesson.fullPath) ?? [];
    if (picks.length === 0) continue;
    const videosToAdd = picks.map((id) => fetchVideoMetadata(id));
    if (existingBlock) {
      existingBlock.videos = Array.isArray(existingBlock.videos) ? existingBlock.videos : [];
      existingBlock.videos.push(...videosToAdd);
    } else {
      const newBlock = {
        type: 'videos',
        title: VIDEO_BLOCK_TITLE,
        videos: videosToAdd,
      };
      if (!Array.isArray(lesson.data.content)) {
        lesson.data.content = [newBlock];
      } else {
        const activityIndex = lesson.data.content.findIndex(
          (block) => typeof block?.title === 'string' && block.title.includes('Atividade em sala')
        );
        if (activityIndex >= 0) {
          lesson.data.content.splice(activityIndex + 1, 0, newBlock);
        } else {
          lesson.data.content.push(newBlock);
        }
      }
    }
    await fs.writeFile(lesson.fullPath, `${JSON.stringify(lesson.data, null, 2)}\n`, 'utf8');
    console.log(`Bloco de vídeos atualizado: ${path.basename(lesson.fullPath)}`);
  }

  console.log(`Vídeos atribuídos para ${missingLessons.length} aulas.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

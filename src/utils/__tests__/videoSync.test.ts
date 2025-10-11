import { describe, expect, it } from 'vitest';
import { createVideoSync, formatTimestamp } from '../videoSync';

describe('videoSync utility', () => {
  it('dispara eventos quando o tempo alcança o marcador', () => {
    const events: string[] = [];
    const sync = createVideoSync([
      { id: 'intro', time: 2, onTrigger: ({ event }) => events.push(event.id ?? '') },
      { id: 'checkpoint', time: 4, onTrigger: ({ event }) => events.push(event.id ?? '') },
    ]);

    sync.update(1);
    sync.update(3);
    sync.update(5);

    expect(events).toEqual(['intro', 'checkpoint']);
  });

  it('permite reexecutar eventos após seek para trás', () => {
    const events: string[] = [];
    const sync = createVideoSync([
      { id: 'quiz', time: 6, onTrigger: ({ event }) => events.push(event.id ?? '') },
    ]);

    sync.update(7);
    sync.seek(0);
    sync.update(6);

    expect(events).toEqual(['quiz', 'quiz']);
  });

  it('formata timestamps em mm:ss ou hh:mm:ss', () => {
    expect(formatTimestamp(0)).toBe('0:00');
    expect(formatTimestamp(75)).toBe('1:15');
    expect(formatTimestamp(3723)).toBe('1:02:03');
  });
});

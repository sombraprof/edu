export interface VideoSyncEvent<T = unknown> {
  id?: string;
  time: number;
  payload?: T;
  once?: boolean;
  onTrigger?: (context: { event: VideoSyncEvent<T>; currentTime: number }) => void;
}

export interface VideoSyncController<T = unknown> {
  update(currentTime: number): void;
  reset(): void;
  seek(time: number): void;
  getPending(currentTime?: number): VideoSyncEvent<T>[];
}

export interface VideoSyncOptions {
  retriggerOnSeek?: boolean;
}

interface NormalizedEvent<T> extends VideoSyncEvent<T> {
  id: string;
  triggered: boolean;
}

const DEFAULT_OPTIONS: Required<VideoSyncOptions> = {
  retriggerOnSeek: true,
};

export function createVideoSync<T = unknown>(
  events: VideoSyncEvent<T>[],
  options: VideoSyncOptions = DEFAULT_OPTIONS
): VideoSyncController<T> {
  const normalized = normalizeEvents(events);
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options } satisfies Required<VideoSyncOptions>;
  let lastTime = 0;

  function update(currentTime: number) {
    const goingForward = currentTime >= lastTime;

    if (goingForward) {
      for (const event of normalized) {
        if (!event.triggered && currentTime >= event.time) {
          event.triggered = true;
          event.onTrigger?.({ event, currentTime });
          if (event.once === false) {
            // allow retriggering immediately if not once and time passed same frame
            event.triggered = false;
          }
        }
      }
    } else if (resolvedOptions.retriggerOnSeek) {
      for (const event of normalized) {
        if (event.time > currentTime) {
          event.triggered = false;
        }
      }
    }

    lastTime = currentTime;
  }

  function reset() {
    for (const event of normalized) {
      event.triggered = false;
    }
    lastTime = 0;
  }

  function seek(time: number) {
    lastTime = time;
    if (resolvedOptions.retriggerOnSeek) {
      for (const event of normalized) {
        if (event.time >= time) {
          event.triggered = false;
        }
      }
    }
  }

  function getPending(currentTime = lastTime) {
    return normalized.filter((event) => !event.triggered && event.time >= currentTime);
  }

  return {
    update,
    reset,
    seek,
    getPending,
  } satisfies VideoSyncController<T>;
}

export function formatTimestamp(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:00';
  }

  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds / 60) % 60)
    .toString()
    .padStart(2, '0');
  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`;
  }

  return `${Math.floor(totalSeconds / 60)}:${seconds}`;
}

function normalizeEvents<T>(events: VideoSyncEvent<T>[]): NormalizedEvent<T>[] {
  return events
    .filter((event) => Number.isFinite(event.time))
    .map((event, index) => ({
      ...event,
      id: event.id ?? `event-${index + 1}`,
      triggered: false,
    }))
    .sort((a, b) => a.time - b.time);
}

export interface Animation {
  play(): void;
  pause(): void;
  destroy(): void;
}

export function loadAnimation(): Animation {
  return {
    play() {},
    pause() {},
    destroy() {},
  };
}

const stub = {
  loadAnimation,
};

export default stub;

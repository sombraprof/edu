class FabricCanvas {
  element: HTMLCanvasElement;
  backgroundColor: string | undefined;
  width = 0;
  height = 0;
  isDrawingMode = false;
  freeDrawingBrush = { color: '#000000', width: 1 };

  constructor(element: HTMLCanvasElement, options: { backgroundColor?: string } = {}) {
    this.element = element;
    this.backgroundColor = options.backgroundColor;
  }

  setWidth(width: number) {
    this.width = width;
  }

  setHeight(height: number) {
    this.height = height;
  }

  setBackgroundColor(color: string, callback?: () => void) {
    this.backgroundColor = color;
    callback?.();
  }

  renderAll() {}

  loadFromJSON(_state: unknown, callback: () => void) {
    callback();
  }

  clear() {}

  toJSON() {
    return {
      objects: [],
      background: this.backgroundColor ?? null,
      width: this.width,
      height: this.height,
    };
  }

  dispose() {}
}

export class Canvas extends FabricCanvas {}

export const fabric = {
  Canvas: FabricCanvas,
};

export default {
  Canvas: FabricCanvas,
  fabric,
};

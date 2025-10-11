interface Simulation {
  force(name: string, value: unknown): Simulation;
  alpha(value: number): Simulation;
  on(event: string, handler: () => void): Simulation;
  stop(): void;
}

const simulationStub: Simulation = {
  force() {
    return simulationStub;
  },
  alpha() {
    return simulationStub;
  },
  on() {
    return simulationStub;
  },
  stop() {},
};

export function forceSimulation(): Simulation {
  return simulationStub;
}

export function forceManyBody() {
  return {
    strength() {
      return this;
    },
  };
}

export function forceLink() {
  return {
    id() {
      return this;
    },
    distance() {
      return this;
    },
  };
}

export function forceCenter() {
  return {};
}

export function forceCollide() {
  return {
    radius() {
      return this;
    },
  };
}

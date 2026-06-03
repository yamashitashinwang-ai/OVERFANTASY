import '../test-support/phaser.test-fixtures.ts';
import { vi } from 'vitest';

export type FakeEmitter = {
  scene: object | null;
  setDepth: ReturnType<typeof vi.fn>;
  explode: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
};

export type FakeScene = {
  add: {
    particles: ReturnType<typeof vi.fn>;
  };
  make: {
    graphics: ReturnType<typeof vi.fn>;
  };
  textures: {
    exists: ReturnType<typeof vi.fn>;
  };
  time: {
    delayedCall: ReturnType<typeof vi.fn>;
  };
  delayedCallbacks: Array<{ ms: number; callback: () => void }>;
  generatedTextures: string[];
};

function fakeEmitter(): FakeEmitter {
  const emitter: FakeEmitter = {
    scene: {},
    setDepth: vi.fn(() => emitter),
    explode: vi.fn(),
    stop: vi.fn(),
    destroy: vi.fn()
  };
  return emitter;
}

export function fakeScene() {
  const generatedTextures: string[] = [];
  const delayedCallbacks: Array<{ ms: number; callback: () => void }> = [];
  const emitters: FakeEmitter[] = [];
  const graphics = () => ({
    fillStyle: vi.fn(),
    fillCircle: vi.fn(),
    fillTriangle: vi.fn(),
    generateTexture: vi.fn((key: string) => generatedTextures.push(key)),
    destroy: vi.fn()
  });
  const scene: FakeScene = {
    add: {
      particles: vi.fn(() => {
        const emitter = fakeEmitter();
        emitters.push(emitter);
        return emitter;
      })
    },
    make: { graphics: vi.fn(graphics) },
    textures: { exists: vi.fn(() => false) },
    time: {
      delayedCall: vi.fn((ms: number, callback: () => void) => {
        delayedCallbacks.push({ ms, callback });
      })
    },
    delayedCallbacks,
    generatedTextures
  };
  return { scene, emitters };
}

export async function importParticlesWithScene(scene: FakeScene | null) {
  vi.resetModules();
  const { display } = await import('./runtime.ts');
  display.pScene = scene as never;
  const particles = await import('./particles.ts');
  return { display, particles };
}

export async function resetParticleDisplay() {
  const { display } = await import('./runtime.ts');
  display.pScene = null;
  vi.clearAllMocks();
}

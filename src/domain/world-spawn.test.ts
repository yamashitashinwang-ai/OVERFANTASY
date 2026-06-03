import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  state: {
    scene: 'field',
    entities: [] as unknown[],
    objects: [] as unknown[],
    solids: [] as unknown[],
    pickups: [] as unknown[]
  },
  syncLostPackagePickupsForScene: vi.fn(),
  spawnField: vi.fn(),
  spawnForest: vi.fn(),
  spawnSilverleaf: vi.fn(),
  spawnPeakless: vi.fn(),
  spawnStonegorge: vi.fn(),
  spawnHatepit: vi.fn(),
  spawnRuins: vi.fn(),
  spawnDemon: vi.fn()
}));

vi.mock('../runtime/state.ts', () => ({ state: mocks.state }));
vi.mock('./lost-packages.ts', () => ({ syncLostPackagePickupsForScene: mocks.syncLostPackagePickupsForScene }));
vi.mock('./world-spawn/field.ts', () => ({ spawnField: mocks.spawnField }));
vi.mock('./world-spawn/forest.ts', () => ({ spawnForest: mocks.spawnForest }));
vi.mock('./world-spawn/silverleaf.ts', () => ({ spawnSilverleaf: mocks.spawnSilverleaf }));
vi.mock('./world-spawn/peakless.ts', () => ({ spawnPeakless: mocks.spawnPeakless }));
vi.mock('./world-spawn/stonegorge.ts', () => ({ spawnStonegorge: mocks.spawnStonegorge }));
vi.mock('./world-spawn/hatepit.ts', () => ({ spawnHatepit: mocks.spawnHatepit }));
vi.mock('./world-spawn/ruins.ts', () => ({ spawnRuins: mocks.spawnRuins }));
vi.mock('./world-spawn/demon.ts', () => ({ spawnDemon: mocks.spawnDemon }));

function seedWorldCollections() {
  mocks.state.entities = ['entity'];
  mocks.state.objects = ['object'];
  mocks.state.solids = ['solid'];
  mocks.state.pickups = ['pickup'];
}

function expectWorldCollectionsCleared() {
  expect(mocks.state.entities).toEqual([]);
  expect(mocks.state.objects).toEqual([]);
  expect(mocks.state.solids).toEqual([]);
  expect(mocks.state.pickups).toEqual([]);
}

describe('world-spawn facade dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.scene = 'field';
    seedWorldCollections();
  });

  it('clears world collections and dispatches the requested scene spawner', async () => {
    const { spawnWorld } = await import('./world-spawn.ts');

    spawnWorld('forest');

    expectWorldCollectionsCleared();
    expect(mocks.spawnForest).toHaveBeenCalledTimes(1);
    expect(mocks.spawnField).not.toHaveBeenCalled();
    expect(mocks.spawnDemon).not.toHaveBeenCalled();
    expect(mocks.syncLostPackagePickupsForScene).toHaveBeenCalledWith('forest');
  });

  it('uses the current scene when no scene argument is provided', async () => {
    const { spawnWorld } = await import('./world-spawn.ts');
    mocks.state.scene = 'demon';

    spawnWorld();

    expectWorldCollectionsCleared();
    expect(mocks.spawnDemon).toHaveBeenCalledTimes(1);
    expect(mocks.syncLostPackagePickupsForScene).toHaveBeenCalledWith('demon');
  });
});

import { runtime } from '../../state.ts';
import type { RuntimeInvariant } from '../types.ts';

export const sceneRuntimePSceneRefSetInvariant: RuntimeInvariant = {
  id: 'scene-runtime-pSceneRef-set',
  check() {
    if (!runtime.pSceneRef) return 'runtime.pSceneRef is null after boot';
    return null;
  }
};

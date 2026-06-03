import { runtime } from '../state.ts';

type PointerButtonState = {
  button?: number;
  buttons?: number;
  primaryDown?: boolean;
  isDown?: boolean;
  downElement?: unknown;
  upElement?: unknown;
  event?: unknown;
  wasCanceled?: boolean;
};

type PointerInputLike = {
  activePointer?: PointerButtonState | null;
  mousePointer?: PointerButtonState | null;
  pointers?: Array<PointerButtonState | null | undefined>;
  manager?: PointerInputLike | null;
};

type PointerSourceLike = PointerInputLike & {
  input?: PointerInputLike | null;
  game?: {
    input?: PointerInputLike | null;
  } | null;
  scene?: PointerSourceLike | null;
};

function collectPointerInputs(scene?: unknown): PointerInputLike[] {
  const inputs: PointerInputLike[] = [];
  const seen = new Set<object>();
  const add = (source?: PointerSourceLike | PointerInputLike | null) => {
    if (!source || typeof source !== 'object' || seen.has(source)) return;
    seen.add(source);
    if ('activePointer' in source || 'mousePointer' in source || 'pointers' in source) {
      inputs.push(source as PointerInputLike);
    }
    const wrapped = source as PointerSourceLike;
    add(wrapped.input);
    add(wrapped.input?.manager);
    add(wrapped.manager);
    add(wrapped.game?.input);
    add(wrapped.game?.input?.manager);
    add(wrapped.scene);
  };
  add(scene as PointerSourceLike | null | undefined);
  return inputs;
}

function releasePointerButtons(pointer: PointerButtonState | null | undefined) {
  if (!pointer) return;
  pointer.button = -1;
  pointer.buttons = 0;
  pointer.primaryDown = false;
  pointer.isDown = false;
  pointer.downElement = null;
  pointer.upElement = null;
  pointer.event = null;
  pointer.wasCanceled = true;
}

export function clearGamePointerState(scene?: unknown) {
  const pointers = new Set<PointerButtonState>();
  for (const input of collectPointerInputs(scene)) {
    if (input.activePointer) pointers.add(input.activePointer);
    if (input.mousePointer) pointers.add(input.mousePointer);
    for (const pointer of input.pointers || []) {
      if (pointer) pointers.add(pointer);
    }
  }
  pointers.forEach(releasePointerButtons);
}

export function releaseWorldPointerInput(scene?: unknown) {
  runtime.pointerInside = false;
  runtime.bowCharge = null;
  runtime.attackEffect = null;
  clearGamePointerState(runtime.pSceneRef);
  if (scene) clearGamePointerState(scene);
}

type GameFlowUiHandler = () => void;

export interface GameFlowUiHandlers {
  clearToast: GameFlowUiHandler;
  resetRuntimeUi: GameFlowUiHandler;
  applyLanguage: GameFlowUiHandler;
  invalidateMenuCache: GameFlowUiHandler;
  renderMainMenu: GameFlowUiHandler;
}

type GameFlowUiHandlerRegistration = Partial<{
  [K in keyof GameFlowUiHandlers]: GameFlowUiHandler | null | undefined;
}>;

const noop: GameFlowUiHandler = () => undefined;

const defaultHandlers: GameFlowUiHandlers = {
  clearToast: noop,
  resetRuntimeUi: noop,
  applyLanguage: noop,
  invalidateMenuCache: noop,
  renderMainMenu: noop
};

let handlers: GameFlowUiHandlers = { ...defaultHandlers };

export function registerGameFlowUiHandlers(nextHandlers: GameFlowUiHandlerRegistration) {
  handlers = Object.keys(defaultHandlers).reduce((acc, key) => {
    const handlerKey = key as keyof GameFlowUiHandlers;
    const nextHandler = nextHandlers[handlerKey];
    acc[handlerKey] = nextHandler === undefined ? handlers[handlerKey] : nextHandler || noop;
    return acc;
  }, {} as GameFlowUiHandlers);
}

export function resetGameFlowUiHandlers() {
  handlers = { ...defaultHandlers };
}

export function clearGameFlowToast() {
  handlers.clearToast();
}

export function resetRuntimeUiForGameFlow() {
  handlers.resetRuntimeUi();
}

export function applyGameFlowLanguage() {
  handlers.applyLanguage();
}

export function invalidateGameFlowMenuCache() {
  handlers.invalidateMenuCache();
}

export function renderGameFlowMainMenu() {
  handlers.renderMainMenu();
}

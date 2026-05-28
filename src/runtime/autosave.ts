let autoSaveHandler: () => void = () => {};

export function setAutoSaveHandler(handler: () => void) {
  autoSaveHandler = handler;
}

export function autoSave() {
  autoSaveHandler();
}

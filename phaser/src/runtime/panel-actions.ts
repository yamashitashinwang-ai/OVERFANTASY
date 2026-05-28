let closeQuestPanelHandler: () => void = () => {};

export function setCloseQuestPanelHandler(handler: () => void) {
  closeQuestPanelHandler = handler;
}

export function closeQuestPanel() {
  closeQuestPanelHandler();
}

type MagicPanelMode = string;

let closeQuestPanelHandler: () => void = () => {};
let openForgePanelHandler: () => void = () => {};
let openShopPanelHandler: () => void = () => {};
let openMagicPanelHandler: (mode?: MagicPanelMode, title?: string | null) => void = () => {};
let openGuildQuestPanelHandler: () => void = () => {};
let openNpcQuestPanelHandler: (npcName: string) => void = () => {};

export function setCloseQuestPanelHandler(handler: () => void) {
  closeQuestPanelHandler = handler;
}

export function closeQuestPanel() {
  closeQuestPanelHandler();
}

export function setOpenForgePanelHandler(handler: () => void) {
  openForgePanelHandler = handler;
}

export function requestOpenForgePanel() {
  openForgePanelHandler();
}

export function setOpenShopPanelHandler(handler: () => void) {
  openShopPanelHandler = handler;
}

export function requestOpenShopPanel() {
  openShopPanelHandler();
}

export function setOpenMagicPanelHandler(handler: (mode?: MagicPanelMode, title?: string | null) => void) {
  openMagicPanelHandler = handler;
}

export function requestOpenMagicPanel(mode?: MagicPanelMode, title?: string | null) {
  openMagicPanelHandler(mode, title);
}

export function setOpenGuildQuestPanelHandler(handler: () => void) {
  openGuildQuestPanelHandler = handler;
}

export function requestOpenGuildQuestPanel() {
  openGuildQuestPanelHandler();
}

export function setOpenNpcQuestPanelHandler(handler: (npcName: string) => void) {
  openNpcQuestPanelHandler = handler;
}

export function requestOpenNpcQuestPanel(npcName: string) {
  openNpcQuestPanelHandler(npcName);
}

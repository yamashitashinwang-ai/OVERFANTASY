// Tween-driven visual feedback compatibility facade. Action state, magic cast
// visuals, NPC feedback, and hit tweens live under `display/animations/`.

export { initAnimationFeedback } from './animations/feedback.ts';
export { triggerHitTween } from './animations/hit-tween.ts';
export {
  clearPlayerMagicCastVisual,
  currentPlayerMagicCastDebugLabel,
  currentPlayerMagicCastVisual,
  triggerPlayerMagicCharge,
  triggerPlayerMagicRelease
} from './animations/magic-cast.ts';
export type { PlayerMagicCastVisual } from './animations/magic-cast.ts';
export { npcVisualAdjust, triggerNpcInteract } from './animations/npc.ts';
export {
  currentPlayerPoseOverride,
  playerAttackAnimationNames,
  playerVisualAdjust,
  triggerPlayerAttackPlaceholder,
  triggerPlayerHurt,
  triggerPlayerInteract
} from './animations/player.ts';

// Engine-native time scheduling. Cooldown fields on state.player are handled
// by runtime/player-cooldowns.js, not by Phaser tweens.
//
// Two primitives live here:
//
//   schedulePeriodic(scene, intervalMs, callback)
//     Replaces "state.clock += dt; if (state.clock > N) {... ; state.clock = 0; }"
//     with a Phaser Time Event. Returns a handle with .remove().
//
//   scheduleOnce(scene, delayMs, callback)
//     Replaces "state.timer = N; ... if (state.timer-=dt < 0) fire()". A
//     Phaser delayedCall fires the callback once and self-disposes.

export function schedulePeriodic(scene, intervalMs, callback) {
  return scene.time.addEvent({
    delay: intervalMs,
    callback,
    callbackScope: scene,
    loop: true
  });
}

export function scheduleOnce(scene, delayMs, callback) {
  return scene.time.delayedCall(delayMs, callback, [], scene);
}

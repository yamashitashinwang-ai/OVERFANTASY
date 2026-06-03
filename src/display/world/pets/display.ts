import { display as D } from '../../runtime.ts';
import { hexToInt } from '../../colors.ts';
import { attachCircleBody } from '../../physics.ts';
import { petTextureKey } from '../../placeholder-art.ts';
import { state } from '../../../runtime/state.ts';
import { tile } from '../../../runtime/constants.ts';
import { currentPetScene } from '../../../domain/world.ts';
import type { PetState } from '../../../domain/types.ts';
import { resetBody } from '../shared.ts';

export function syncPetDisplay() {
  if (!D.pScene) return;
  const sceneKey = currentPetScene();
  const visiblePets = new Map<string, PetState>();
  for (const pet of state.pets) {
    if (pet.lost) continue;
    if (!pet.carried && pet.scene !== sceneKey) continue;
    if (!pet.alive && !pet.injured) continue;
    visiblePets.set(pet.id, pet);
  }
  for (const [id, display] of D.petDisplayMap) {
    if (!visiblePets.has(id)) {
      display.circle.destroy();
      display.sprite?.destroy();
      D.petDisplayMap.delete(id);
    }
  }
  for (const [id, pet] of visiblePets) {
    let display = D.petDisplayMap.get(id);
    if (!display) {
      const circle = D.pScene.add.arc(pet.x * tile, pet.y * tile, pet.r, 0, 360, false, hexToInt(pet.color));
      circle.setVisible(false);
      attachCircleBody(circle, pet.r, true);
      if (D.petsGroup) D.petsGroup.add(circle);
      const sprite = D.pScene.add.sprite(pet.x * tile, pet.y * tile, petTextureKey(pet));
      sprite.setOrigin(0.5, 0.88);
      sprite.setDepth(5);
      display = { circle, sprite, pet };
      D.petDisplayMap.set(id, display);
    }
    display.pet = pet;
    const injured = pet.injured && !pet.lost;
    // For carried pets, game logic owns position; the physics body follows it.
    if (pet.carried && display.circle.body) {
      resetBody(display.circle.body, pet.x * tile, pet.y * tile);
    }
    display.circle.setVisible(false);
    display.circle.setRadius(injured ? Math.max(6, pet.r - 2) : pet.r);
    if (display.sprite) {
      display.sprite.setTexture(petTextureKey(pet));
      display.sprite.setPosition(display.circle.x, display.circle.y);
      display.sprite.setDepth(5 + display.circle.y / 100000);
      if (injured) display.sprite.setTint(0xff8f70);
      else display.sprite.clearTint();
    }
  }
}

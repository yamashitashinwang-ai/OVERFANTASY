import type Phaser from 'phaser';
import { playerRigTextureKey } from '../placeholder-art.ts';
import { partOrigins, partTexture } from './constants.ts';
import { isRigFacingDir, solvePlayerRigPose } from './pose.ts';
import {
  playerRigDebugPointNames,
  playerRigPartNames,
  type PlayerRigDebugPointName,
  type PlayerRigPartName,
  type PlayerRigPoseResult,
  type PlayerRigSyncOptions,
  type RigPoint
} from './types.ts';

export class PlayerRig {
  readonly root: Phaser.GameObjects.Container;

  private readonly parts: Record<PlayerRigPartName, Phaser.GameObjects.Image>;
  private currentPose: PlayerRigPoseResult | null = null;
  private visualOffset: RigPoint = { x: 0, y: 0 };
  private monsterForm = false;

  constructor(scene: Phaser.Scene) {
    this.root = scene.add.container(0, 0).setName('playerRig');
    this.parts = playerRigPartNames.reduce((acc, name) => {
      const texture = playerRigTextureKey(partTexture[name], false);
      const image = scene.add.image(0, 0, texture).setName(`playerRig:${name}`);
      const origin = partOrigins[name];
      image.setOrigin(origin.x, origin.y);
      acc[name] = image;
      return acc;
    }, {} as Record<PlayerRigPartName, Phaser.GameObjects.Image>);
    this.root.add(Object.values(this.parts));
  }

  sync(options: PlayerRigSyncOptions) {
    const facing = isRigFacingDir(options.facing) ? options.facing : 's';
    const pose = options.pose;
    const solved = solvePlayerRigPose(facing, pose, options.animationProgress, options.magicCast);
    this.currentPose = solved;
    this.visualOffset = { x: options.visualOffsetX ?? 0, y: options.visualOffsetY ?? 0 };
    this.monsterForm = options.monsterForm;
    this.root.setPosition(options.x, options.y);
    this.root.setDepth(options.depth ?? 6);
    this.root.setVisible(true);
    const visualScale = options.visualScale ?? 1;
    for (const name of playerRigPartNames) {
      const image = this.parts[name];
      const transform = solved.parts[name];
      image.setTexture(playerRigTextureKey(partTexture[name], this.monsterForm));
      image.setPosition(transform.x + this.visualOffset.x, transform.y + this.visualOffset.y);
      image.setRotation(transform.rotation);
      image.setScale(transform.scaleX * visualScale, transform.scaleY * visualScale);
      image.setDepth(transform.depth);
      if (options.tint) image.setTint(options.tint);
      else image.clearTint();
    }
    const sortable = this.root as Phaser.GameObjects.Container & { sort?: (property: string) => void };
    sortable.sort?.('depth');
  }

  weaponAnchorWorld(): { x: number; y: number; front: boolean } | null {
    if (!this.currentPose) return null;
    const weapon = this.currentPose.points.weapon;
    return {
      x: this.root.x + weapon.x + this.visualOffset.x,
      y: this.root.y + weapon.y + this.visualOffset.y,
      front: this.currentPose.weaponFront
    };
  }

  debugPointsWorld(): Record<PlayerRigDebugPointName, RigPoint> | null {
    if (!this.currentPose) return null;
    return playerRigDebugPointNames.reduce((acc, name) => {
      const point = this.currentPose!.points[name];
      acc[name] = {
        x: this.root.x + point.x + this.visualOffset.x,
        y: this.root.y + point.y + this.visualOffset.y
      };
      return acc;
    }, {} as Record<PlayerRigDebugPointName, RigPoint>);
  }

  get depth() {
    return this.root.depth;
  }

  setVisible(visible: boolean) {
    this.root.setVisible(visible);
  }

  destroy() {
    this.root.destroy(true);
  }
}

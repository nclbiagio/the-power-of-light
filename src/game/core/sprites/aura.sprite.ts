/** FIALA */
import { GameObjects, Physics, Scene } from 'phaser';
import { EntityModel } from '../model/entity.model';

export type Status = 'idle' | 'active' | 'affected' | 'dead';

export const defaultAlpha = 0.7;
export const defaultDepth = 9;

export interface AuraModel extends EntityModel {
   status: Status;
   pos: { x: number; y: number };
   name: string;
   onAuraDeadCallback?: (() => void) | null | undefined;
   hasEntityTarget: string | null;
   affectedTimerDelay: number;
   lastCheckOnAffectedAt: number;
   animations?: {
      key: string;
      frames?: Phaser.Types.Animations.AnimationFrame[];
      frameRate?: number;
      repeat?: number;
   }[];
}

export class AuraSprite extends GameObjects.Sprite {
   model: AuraModel;
   declare body: Physics.Arcade.Body;
   constructor(scene: Scene, props: EntityModel) {
      super(scene, props.x, props.y, props.key);
      scene.physics.world.enable(this);
      scene.add.existing(this);
      this.model = {
         status: 'idle',
         pos: { x: props.x, y: props.y },
         name: `aura${self.crypto.randomUUID()}`,
         hasEntityTarget: null,
         affectedTimerDelay: 2, //seconds
         lastCheckOnAffectedAt: 0,
         ...props,
      };
   }

   setAuraBody(animationcompleteCallback?: (animation: string) => void) {
      //this.setScale(0.7, 1);
      this.on(
         'animationcomplete',
         (animation: { key: string }) => {
            if (animationcompleteCallback) {
               animationcompleteCallback(animation.key);
            }
         },
         this
      );
      this.body.setVelocity(0, 0);
      this.body.setCollideWorldBounds(true);
      this.setDepthAndAlpha();
   }

   setModel<T extends AuraModel>(model: Partial<T>) {
      this.model = {
         ...this.model,
         ...model,
      };
   }

   setDepthAndAlpha(depth = defaultDepth, alpha = defaultAlpha) {
      this.setDepth(depth);
      this.setAlpha(alpha);
   }

   override update(x: number, y: number, vel: Phaser.Math.Vector2, time: number) {
      if (this.active && this.visible) {
         if (this.model.status === 'dead') {
            if (this.model.onAuraDeadCallback) {
               this.model.onAuraDeadCallback();
            }
            this.destroyAura();
         }
         if (this.model.status === 'active' || this.model.status === 'affected') {
            this.body.setVelocity(vel.x, vel.y);
            this.setPosition(x, y);
         }
      }
   }

   destroyAura() {
      this.destroy();
   }
}

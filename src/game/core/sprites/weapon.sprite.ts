import { GameObjects, Physics, Scene } from 'phaser';
import { Direction, EntityModel } from '../model/entity.model';

export type Status = 'idle' | 'active' | 'fire' | 'dead';

export interface WeaponModel extends EntityModel {
   status: Status;
   pos: { x: number; y: number };
   offset: { x: number; y: number };
   name: string;
   consumeWeaponPowerCallback?: (() => void) | null | undefined;
   animations?: {
      key: string;
      frames?: Phaser.Types.Animations.AnimationFrame[];
      frameRate?: number;
      repeat?: number;
   }[];
}

export class WeaponSprite extends GameObjects.Sprite {
   model: WeaponModel;
   declare body: Physics.Arcade.Body;
   constructor(scene: Scene, props: EntityModel) {
      super(scene, props.x, props.y, props.key);
      scene.physics.world.enable(this);
      scene.add.existing(this);
      this.model = {
         status: 'idle',
         pos: { x: props.x, y: props.y },
         offset: { x: 0, y: 0 }, // px
         name: '',
         ...props,
      };
   }

   setWeaponBody(animationcompleteCallback?: (animation: string) => void) {
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
      this.setWeaponVisible(true);
   }

   setModel<T extends WeaponModel>(model: Partial<T>) {
      this.model = {
         ...this.model,
         ...model,
      };
   }

   setWeaponVisible(active: boolean) {
      this.active = active;
      this.setVisible(this.active);
      if (this.active && this.visible) {
         this.setPosition(this.model.pos.x, this.model.pos.y);
      }
   }

   override update(x: number, y: number, vel: Phaser.Math.Vector2, direction: Direction, _playerStatus?: string, _time?: number) {
      let yOffset = 0;
      let xOffset = 0;
      if (this.model.status === 'dead') {
         this.setWeaponVisible(false);
         this.destroyWeapon();
      }
      if (this.model.status === 'active' || this.model.status === 'fire') {
         switch (direction) {
            case Direction.LEFT:
               xOffset = -this.model.offset.x;
               this.angle = 180;
               break;
            case Direction.RIGHT:
               xOffset = this.model.offset.x;
               this.angle = 360;
               break;
            case Direction.UP:
               yOffset = -this.model.offset.y;
               this.angle = -90;
               break;
            case Direction.DOWN:
               yOffset = this.model.offset.y;
               this.angle = 90;
               break;
            default:
               break;
         }
         this.body.setVelocity(vel.x, vel.y);
         this.setPosition(x + xOffset, y + yOffset);
      }
   }

   destroyWeapon() {
      this.destroy();
   }
}

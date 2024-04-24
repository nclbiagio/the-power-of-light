import { GameObjects, Physics, Scene } from 'phaser';
import { Direction, EntityModel } from '../model/entity.model';
import { Cursors } from '../model/game.model';
import { GameService } from '../../services/game.service';

export type Status = 'idle' | 'run' | 'fire' | 'affected' | 'dead';

const ORIGIN_VEL = 120; //slower is velocity, smoother seems the game, originally was 160
const ORIGIN_lIVES = 10;

export interface PlayerModel extends EntityModel {
   lives: number;
   defaultVel: number;
   facingX: number;
   facingY: number;
   status: Status;
   updateTime: number;
   direction: Direction;
   hasWeapon: boolean;
   shootDelay: number;
   shootTimer: number;
   affectedDelay: number;
   affectedTimer: number;
}

export class PlayerSprite extends GameObjects.Sprite {
   model: PlayerModel;
   declare body: Physics.Arcade.Body;
   cursors: Cursors;
   constructor(scene: Scene, props: EntityModel) {
      super(scene, props.x, props.y, props.key);
      scene.physics.world.enable(this);
      scene.add.existing(this);
      this.model = {
         lives: ORIGIN_lIVES,
         defaultVel: ORIGIN_VEL,
         facingX: 1, // -1 left 1 right
         facingY: 1,
         status: 'idle',
         updateTime: 0,
         direction: Direction.RIGHT,
         hasWeapon: false,
         shootDelay: 300,
         shootTimer: 0,
         affectedDelay: 500, //milliseconds
         affectedTimer: 0,
         ...props,
      };
      this.cursors = this.createCursorKeys();
   }

   setPlayerBody(): void {
      this.setPosition(this.model.x, this.model.y);
      this.body.setBounce(0.2, 0.2);
      this.body.setCollideWorldBounds(true);
   }

   setModel<T extends PlayerModel>(model: Partial<T>) {
      this.model = {
         ...this.model,
         ...model,
      };
   }

   /**
    * Track the arrow keys & WASD.
    */
   private createCursorKeys() {
      return this.scene.input.keyboard!.addKeys('w,a,s,d,up,left,down,right,space') as Cursors;
   }

   /**
    *
    * @param {*} time
    * @param {*} cursors
    */
   override update(time: number): void {
      this.model.updateTime = time;
      if (this.model.status !== 'dead') {
         this.body.setVelocity(0);
         const status: Status = this.model.status === 'affected' ? 'affected' : 'run';
         if (this.cursors.left.isDown || this.cursors.a.isDown) {
            this.setModel({
               status,
               facingX: -1,
               direction: Direction.LEFT,
            });
            this.body.setVelocityX(-this.model.defaultVel);
         } else if (this.cursors.right.isDown || this.cursors.d.isDown) {
            this.setModel({
               status,
               facingX: 1,
               direction: Direction.RIGHT,
            });
            this.body.setVelocityX(this.model.defaultVel);
         } else if (this.cursors.up.isDown || this.cursors.w.isDown) {
            this.setModel({
               status,
               facingY: -1,
               direction: Direction.UP,
            });
            this.body.setVelocityY(-this.model.defaultVel);
         } else if (this.cursors.down.isDown || this.cursors.s.isDown) {
            this.setModel({
               status,
               facingY: 1,
               direction: Direction.DOWN,
            });
            this.body.setVelocityY(this.model.defaultVel);
         } else {
            const status: Status = this.model.status === 'affected' ? 'affected' : 'idle';
            this.setModel({
               status,
            });
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
         }

         if (this.model.hasWeapon) {
            if (this.cursors.space.isDown && time > this.model.shootTimer) {
               this.setModel({
                  status: 'fire',
                  shootTimer: this.model.updateTime + this.model.shootDelay,
               });
            }
         }

         if (this.model.status === 'affected') {
            if (time > this.model.affectedTimer) {
               this.decreaseHpStatus();
               this.setModel({
                  affectedTimer: this.model.updateTime + this.model.affectedDelay,
               });
            } else {
               this.setModel({
                  status: 'run',
               });
            }
         }

         // Normalize and scale the velocity so that player can't move faster along a diagonal
         this.body.velocity.normalize().scale(this.model.defaultVel);

         this.flipX = this.model.facingX === -1;
      }
   }

   decreaseHpStatus() {
      const numberOfPointsToDecrease = 1;
      let isDead = false;
      this.setModel({
         lives: this.model.lives - numberOfPointsToDecrease,
      });
      if (this.model.lives === 0) {
         isDead = true;
      }
      if (isDead) {
         this.setModel({
            status: 'dead',
         });
      }
   }

   removeFromGame(): void {
      this.destroy();
   }
}

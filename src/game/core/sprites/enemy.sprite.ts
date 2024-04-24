import { GameObjects, Physics, Scene } from 'phaser';
import { Direction, EntityModel } from '../model/entity.model';
import { GameService } from '../../services/game.service';
import { getOppositeDirection } from '../../services/utils.service';

export type Status = 'idle' | 'run' | 'affected' | 'inactive' | 'dead';

export interface EnemyModel extends EntityModel {
   lives: number;
   defaultVel: number;
   direction: Direction;
   facingX: number;
   facingY: number;
   status: Status;
   name: string;
}

export class EnemySprite extends GameObjects.Sprite {
   model: EnemyModel;
   declare body: Physics.Arcade.Body;
   moveEvent: Phaser.Time.TimerEvent | null = null;
   pathWasFound = false;
   gameService = GameService.getInstance();
   debug = this.gameService.debug;

   constructor(scene: Scene, props: EntityModel) {
      super(scene, props.x, props.y, props.key);
      scene.physics.world.enable(this);
      scene.add.existing(this);

      this.model = {
         lives: 1,
         defaultVel: 200,
         direction: Direction.RIGHT,
         facingX: 1, // -1 left 1 right
         facingY: 1,
         status: 'idle',
         name: `enemy_${self.crypto.randomUUID()}`,
         ...props,
      };
   }

   setEnemyBody(animationcompleteCallback?: (animation: string) => void): void {
      this.on(
         'animationcomplete',
         (animation: { key: string }) => {
            if (animationcompleteCallback) {
               animationcompleteCallback(animation.key);
            }
         },
         this
      );
      this.setPosition(this.model.x, this.model.y);
      this.body.setBounce(0.2, 0.2);
      this.body.setCollideWorldBounds(true);
      this.setModel({
         status: 'idle',
      });
      this.body.setImmovable(true);
      this.setDepth(99);
      this.setAlpha(1);
   }

   setModel<T extends EnemyModel>(model: Partial<T>) {
      this.model = {
         ...this.model,
         ...model,
      };
   }

   setRandomMoveEvent() {
      this.setModel({
         status: 'run',
      });
      this.moveEvent = this.scene.time.addEvent({
         delay: 2000,
         callback: () => {
            this.model.direction = this.randomDirection(this.model.direction);
         },
         loop: true,
      });
   }

   destroyMoveEvent() {
      if (this.moveEvent) {
         this.moveEvent.destroy();
         this.moveEvent = null;
      }
   }

   setVelocityBasedOnDirection(velocity: number) {
      switch (this.model.direction) {
         case Direction.UP:
            this.setModel({
               facingY: -1,
            });
            this.body.setVelocity(0, velocity * this.model.facingY);
            break;

         case Direction.DOWN:
            this.setModel({
               facingY: 1,
            });
            this.body.setVelocity(0, velocity * this.model.facingY);
            break;

         case Direction.LEFT:
            this.setModel({
               facingX: -1,
            });
            this.body.setVelocity(velocity * this.model.facingX, 0);
            break;

         case Direction.RIGHT:
            this.setModel({
               facingX: 1,
            });
            this.body.setVelocity(velocity * this.model.facingX, 0);
            break;
      }
   }

   override update(time: number): void {
      if (this.visible && this.active) {
         if (this.model.status === 'idle' || this.model.status === 'inactive') {
            this.body.setVelocity(0, 0);
         }
         if (this.model.status === 'run' || this.model.status === 'affected') {
            this.setVelocityBasedOnDirection(this.model.defaultVel);
         }
         if (this.model.status === 'dead') {
            this.removeFromGame();
         }
      }
   }

   runBouncingEffect() {
      const vel = 2000;
      if (this.model.direction === Direction.LEFT) {
         this.body.velocity.x = -vel;
      } else if (this.model.direction === Direction.RIGHT) {
         this.body.velocity.x = vel;
      } else if (this.model.direction === Direction.UP) {
         this.body.velocity.y = -vel;
      } else if (this.model.direction === Direction.DOWN) {
         this.body.velocity.y = vel;
      }
   }

   randomDirection(exclude: Direction) {
      const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      let newDirection = directions[Phaser.Math.Between(0, 3)];
      while (newDirection === exclude) {
         newDirection = directions[Phaser.Math.Between(0, 3)];
      }
      //console.log(newDirection);
      return newDirection as Direction;
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
      return isDead;
   }

   removeFromGame(): void {
      if (this.moveEvent) {
         this.moveEvent.destroy();
      }
      this.destroy();
   }
}

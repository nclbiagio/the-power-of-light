import { Animations, Scene } from 'phaser';
import { EntityModel } from '../core/model/entity.model';
import { EnemyModel, EnemySprite, Status } from '../core/sprites/enemy.sprite';
import { AnimationService } from '../services/animation.service';
import { AuraSprite } from '../core/sprites/aura.sprite';
import { PlagueAuraEntity } from './plague-aura.entity';

export type ExtendedStatus = 'backToHuman' | 'human' | 'plague';
export interface PlagueModel extends EnemyModel {
   animationStatus: ExtendedStatus;
   isBackToHuman: boolean;
   auraCollisionEnabled: boolean;
}

export class PlagueEntity extends EnemySprite {
   static key = 'plague';
   override model!: PlagueModel;
   aura: AuraSprite | null = null;
   humanBeingCounter: Phaser.Time.TimerEvent | null = null;
   humanBeingCountdown = 3;
   constructor(scene: Scene, props: EntityModel) {
      super(scene, props);
   }

   static create(scene: Scene, props: { x: number; y: number }, model?: Partial<PlagueModel>): PlagueEntity {
      const entity = new PlagueEntity(scene, { id: self.crypto.randomUUID(), key: `${PlagueEntity.key}`, ...props });
      if (model) {
         entity.setPlagueModel(model);
      }
      entity.setAnimations(scene.anims);
      entity.setBody();

      const aura = PlagueAuraEntity.create(
         scene,
         {
            ...props,
         },
         {
            status: 'active',
            hasEntityTarget: entity.model.id,
            onAuraDeadCallback: () => {
               entity.aura = null;
               //Aura is dead because of Player, so plague could return to human being
               entity.setPlagueModel({
                  animationStatus: 'backToHuman',
               });
            },
         }
      );
      entity.setAnimations(scene.anims);
      entity.setBody();
      entity.setPlagueAura(aura);

      return entity;
   }

   static loadSpritesheet(scene: Scene) {
      scene.load.spritesheet(`${PlagueEntity.key}`, `${PlagueEntity.key}.png`, {
         frameWidth: 32,
         frameHeight: 32,
      });
   }

   setBody() {
      const setOnCompletOnimation = (animationkey: string) => {
         if (animationkey === `${this.model.key}HumanTransformation`) {
            this.setPlagueModel({ animationStatus: 'human' });
            this.startHumanAnimation();
            this.setHumanCounter();
         }
      };
      this.setEnemyBody(setOnCompletOnimation);
   }

   setPlagueModel<T extends PlagueModel>(model: Partial<T>) {
      this.model = {
         ...this.model,
         ...model,
      };
   }

   setPlagueAura(aura: AuraSprite) {
      this.aura = aura;
   }

   setHumanCounter() {
      if (!this.humanBeingCounter) {
         this.humanBeingCounter = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
               this.humanBeingCountdown = this.humanBeingCountdown - 1;
               if (this.humanBeingCountdown <= 0) {
                  this.setPlagueModel({
                     status: 'dead',
                  });
               }
            },
            loop: true,
         });
      }
   }

   get plagueIsInactiveButNotHumanBeing() {
      return this.model.status === 'inactive' && !this.model.isBackToHuman;
   }

   override update(time: number) {
      super.update(time);
      if (this.aura) {
         this.aura.update(this.x, this.y, this.body.velocity, time);
      }
      if (this.plagueIsInactiveButNotHumanBeing) {
         this.setDepth(9);
         this.setAlpha(0.4);
         this.setPlagueModel({
            isBackToHuman: true,
         });
      }
      if (this.model.status === 'dead') {
         if (this.humanBeingCounter) {
            this.humanBeingCounter.destroy();
            this.humanBeingCounter = null;
         }
      }
      if (this.model.status !== 'dead') {
         this.runAnimations();
      }
   }

   startTransformAnimation() {
      this.anims.play(`${this.model.key}HumanTransformation`, true);
   }

   startHumanAnimation() {
      this.anims.play(`${this.model.key}HumanIdleAndRun`, true);
   }

   runAnimations(): void {
      if (this.model.animationStatus === 'plague') {
         this.anims.play(`${this.model.key}PlagueIdleAndRun`, true);
      }
      if (this.model.animationStatus === 'backToHuman') {
         this.startTransformAnimation();
      }
      if (this.model.animationStatus === 'human') {
         this.startHumanAnimation();
         this.destroyMoveEvent();
         this.setModel({
            status: 'inactive',
         });
      }
   }

   setAnimations(sceneAnims: Animations.AnimationManager) {
      const as = AnimationService.getInstance();
      if (!as.animationIsAdded(PlagueEntity.key)) {
         const animations = [
            {
               key: `${this.model.key}PlagueIdleAndRun`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 0, end: 3 }),
               frameRate: 6,
               repeat: -1,
            },
            {
               key: `${this.model.key}HumanTransformation`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 4, end: 7 }),
               frameRate: 4,
               repeat: 0,
            },
            {
               key: `${this.model.key}HumanIdleAndRun`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 7, end: 10 }),
               frameRate: 6,
               repeat: -1,
            },
         ];
         animations.forEach((animation) => {
            sceneAnims.create(animation);
         });
         as.addAnimation(PlagueEntity.key);
      }
   }
}

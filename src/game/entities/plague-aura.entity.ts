import { Animations, Scene } from 'phaser';
import { Direction, EntityModel } from '../core/model/entity.model';
import { AuraModel, AuraSprite, defaultAlpha, defaultDepth } from '../core/sprites/aura.sprite';
import { AnimationService } from '../services/animation.service';

export class PlagueAuraEntity extends AuraSprite {
   static key = 'plagueAura';
   constructor(scene: Scene, props: EntityModel) {
      super(scene, props);
   }

   static create(scene: Scene, props: { x: number; y: number }, model?: Partial<AuraModel>): PlagueAuraEntity {
      const entity = new PlagueAuraEntity(scene, { id: self.crypto.randomUUID(), key: `${PlagueAuraEntity.key}`, ...props });
      if (model) {
         entity.setModel(model);
      }
      entity.setAnimations(scene.anims);
      entity.setBody();
      return entity;
   }

   static loadSpritesheet(scene: Scene) {
      scene.load.spritesheet(`${PlagueAuraEntity.key}`, `${PlagueAuraEntity.key}.png`, {
         frameWidth: 96,
         frameHeight: 96,
      });
   }

   setBody() {
      this.setAuraBody();
   }

   setAnimations(sceneAnims: Animations.AnimationManager) {
      const as = AnimationService.getInstance();
      if (!as.animationIsAdded(PlagueAuraEntity.key)) {
         this.model.animations = [
            {
               key: `${this.model.key}Start`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 0, end: 0 }),
               frameRate: 4,
               repeat: -1,
            },
         ];
         this.model.animations.forEach((animation) => {
            sceneAnims.create(animation);
         });
         as.addAnimation(PlagueAuraEntity.key);
      }
   }

   override update(x: number, y: number, vel: Phaser.Math.Vector2, time: number) {
      if (this.active && this.visible) {
         super.update(x, y, vel, time);
         if (this.model.status !== 'dead') {
            this.anims.play(`${this.model.key}Start`, true);

            const touching = !this.body.touching.none;
            const wasTouching = !this.body.wasTouching.none;

            if (touching && !wasTouching) {
               //Overlap is started
               this.setDepthAndAlpha(defaultDepth, 0.4);
               if (this.model.status === 'affected') {
                  this.setModel({
                     lastCheckOnAffectedAt: time,
                  });
               }
            }

            if (!touching && wasTouching) {
               //Overlap is endend
               if (this.alpha === 0.4) {
                  this.setDepthAndAlpha(defaultDepth, defaultAlpha);
               }
               if (this.model.status === 'affected') {
                  this.setModel({
                     status: 'active',
                     lastCheckOnAffectedAt: 0,
                  });
               }
            }

            if (touching && wasTouching && this.model.status === 'affected') {
               //Overlap is currently in progress
               if (this.model.lastCheckOnAffectedAt === 0) {
                  this.setModel({
                     lastCheckOnAffectedAt: time,
                  });
               }
               const seconds = (((time - this.model.lastCheckOnAffectedAt) % 60000) / 1000).toFixed(0);
               if (Number(seconds) >= this.model.affectedTimerDelay) {
                  this.setModel({
                     status: 'dead',
                  });
               }
            }
         }
      }
   }
}

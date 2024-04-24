import { Animations, Scene } from 'phaser';
import { EntityModel } from '../core/model/entity.model';
import { PlayerSprite, PlayerModel, Status } from '../core/sprites/player.sprite';
import { AnimationService } from '../services/animation.service';

export class GundoEntity extends PlayerSprite {
   static spriteKey = 'gundo';
   constructor(scene: Scene, props: EntityModel) {
      super(scene, props);
   }

   static create(scene: Scene, props: { x: number; y: number }, model?: Partial<PlayerModel>): GundoEntity {
      const entity = new GundoEntity(scene, { id: self.crypto.randomUUID(), key: `${GundoEntity.spriteKey}`, ...props });
      if (model) {
         entity.setModel(model);
      }
      entity.setAnimations(scene.anims);
      entity.setBody();
      return entity;
   }

   static loadSpritesheet(scene: Scene) {
      scene.load.spritesheet(`${GundoEntity.spriteKey}`, `${GundoEntity.spriteKey}.png`, {
         frameWidth: 32,
         frameHeight: 32,
      });
   }

   setBody() {
      this.setPlayerBody();
      this.setDepth(6);
   }

   setAnimations(sceneAnims: Animations.AnimationManager) {
      const as = AnimationService.getInstance();
      if (!as.animationIsAdded(GundoEntity.spriteKey)) {
         const animations = [
            {
               key: `${this.model.key}Left`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 0, end: 3 }),
               frameRate: 10,
               repeat: -1,
            },
            {
               key: `${this.model.key}IdleRight`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 0, end: 3 }),
               frameRate: 4,
               repeat: -1,
            },
            {
               key: `${this.model.key}IdleLeft`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 0, end: 3 }),
               frameRate: 4,
               repeat: -1,
            },
            {
               key: `${this.model.key}Right`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 0, end: 3 }),
               frameRate: 10,
               repeat: -1,
            },
         ];
         animations.forEach((animation) => {
            sceneAnims.create(animation);
         });
         as.addAnimation(GundoEntity.spriteKey);
      }
   }

   override update(time: number) {
      super.update(time);
      this.runAnimations(this.model.status, this.model.facingX, this.model.facingY);
   }

   runAnimations(status: Status, facingX: number, facingY: number): void {
      if (status === 'run') {
         const runTypeAnimation = facingX !== -1 ? `${this.model.key}Right` : `${this.model.key}Left`;
         this.anims.play(runTypeAnimation, true);
      } else if (status === 'idle') {
         const idleTypeAnimation = facingY !== -1 ? `${this.model.key}IdleRight` : `${this.model.key}IdleLeft`;
         this.anims.play(idleTypeAnimation, true);
      }
   }
}

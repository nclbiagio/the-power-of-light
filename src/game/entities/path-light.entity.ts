import { Animations, Scene, Tilemaps } from 'phaser';
import { Direction, EntityModel } from '../core/model/entity.model';
import { WeaponModel, WeaponSprite } from '../core/sprites/weapon.sprite';
import { AnimationService } from '../services/animation.service';

export interface PathLightModel extends WeaponModel {}

export class PathLightEntity extends WeaponSprite {
   static key = 'pathLight';
   override model!: PathLightModel;
   lightPoint: Phaser.GameObjects.Light | null = null;
   constructor(scene: Scene, props: EntityModel) {
      super(scene, props);
   }

   static create(scene: Scene, props: { x: number; y: number }, model?: Partial<PathLightModel>): PathLightEntity {
      const entity = new PathLightEntity(scene, { id: self.crypto.randomUUID(), key: `${PathLightEntity.key}`, ...props });
      if (model) {
         entity.setPathLightModel(model);
      }
      entity.setLightPoint();
      entity.setAnimations(scene.anims);
      entity.setBody();
      return entity;
   }

   static loadSpritesheet(scene: Scene) {
      scene.load.spritesheet(`${PathLightEntity.key}`, `${PathLightEntity.key}.png`, {
         frameWidth: 32,
         frameHeight: 32,
      });
   }

   setPathLightModel<T extends PathLightModel>(model: Partial<T>) {
      this.model = {
         ...this.model,
         ...model,
      };
   }

   setBody() {
      const setOnCompletOnimation = (animationkey: string) => {
         if (animationkey === `${this.model.key}Fire`) {
            this.setModel({ status: 'active' });
            this.startActiveAnimation();
            this.resetAmbientLight();
         }
      };
      this.setWeaponBody(setOnCompletOnimation);
      this.setModel({
         offset: {
            x: 12,
            y: 12,
         },
      });
      this.setDepth(99);
      //this.body.setSize(TILESIZE + 24, 16, true);
   }

   setAnimations(sceneAnims: Animations.AnimationManager) {
      const as = AnimationService.getInstance();
      if (!as.animationIsAdded(PathLightEntity.key)) {
         this.model.animations = [
            {
               key: `${this.model.key}Fire`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 5, end: 15 }),
               frameRate: 4,
               repeat: 0,
            },
            {
               key: `${this.model.key}Active`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 4, end: 4 }),
               frameRate: 8,
               repeat: 0,
            },
            {
               key: `${this.model.key}Idle`,
               frames: sceneAnims.generateFrameNumbers(`${this.model.key}`, { start: 0, end: 3 }),
               frameRate: 12,
               repeat: 0,
            },
         ];
         this.model.animations.forEach((animation) => {
            sceneAnims.create(animation);
         });
         as.addAnimation(PathLightEntity.key);
      }
   }

   setLightPoint() {
      this.lightPoint = this.scene.lights.addLight(this.x, this.y, 200).setColor(0xFFFF00).setIntensity(3.0);
      this.lightPoint.setVisible(false);
   }

   resetAmbientLight() {
      this.scene.lights.setAmbientColor(0xffffff);
      this.lightPoint?.setVisible(false);
   }

   startFireAnimation() {
      this.anims.play(`${this.model.key}Fire`, false);
   }

   startActiveAnimation() {
      this.anims.play(`${this.model.key}Active`, true);
   }

   startIdleAnimation() {
      this.anims.play(`${this.model.key}Idle`, true);
   }

   override update(x: number, y: number, vel: Phaser.Math.Vector2, direction: Direction, ownerStatus: string, _time?: number) {
      if (ownerStatus === 'fire' && this.model.status === 'active') {
         this.startFireAnimation();
         this.setModel({ status: 'fire' });
         this.scene.lights.setAmbientColor(0x808080);
         if (!this.lightPoint?.visible) {
            this.lightPoint?.setVisible(true);
         }
      }
      if (this.lightPoint?.visible) {
         this.lightPoint.setPosition(this.x, this.y);
      }
      if (this.model.status === 'idle') {
         this.startIdleAnimation();
      }
      if (this.model.status === 'active') {
         this.startActiveAnimation();
      }
      super.update(x, y, vel, direction);
   }

   override destroyWeapon() {
      this.resetAmbientLight();
      super.destroyWeapon();
   }
}

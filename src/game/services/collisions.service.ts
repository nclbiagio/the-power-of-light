import { Direction } from '../core/model/entity.model';
import { AuraSprite } from '../core/sprites/aura.sprite';
import { EnemySprite } from '../core/sprites/enemy.sprite';
import { PlayerSprite } from '../core/sprites/player.sprite';
import { WeaponSprite } from '../core/sprites/weapon.sprite';
import { GameService } from './game.service';
import { getOppositeDirection } from './utils.service';

export type CollisionServiceCallbacksType = 'someCallbackKey';

export interface CollisionEntities {
   player: PlayerSprite;
   groundLayer: Phaser.Types.Physics.Arcade.ArcadeColliderType;
   plagues: Phaser.GameObjects.Group;
   playerWeapon: WeaponSprite;
}

export class CollisionService {
   scene: Phaser.Scene;
   gameService = GameService.getInstance();
   callbackList: { [key in CollisionServiceCallbacksType]?: (...args: any) => void } = {};
   //--------
   player!: PlayerSprite;
   groundLayer!: Phaser.Types.Physics.Arcade.ArcadeColliderType;
   plagues!: Phaser.GameObjects.Group;
   playerWeapon!: WeaponSprite;

   constructor(scene: Phaser.Scene) {
      this.scene = scene;
   }

   addEntities({ player, groundLayer, plagues, playerWeapon }: CollisionEntities) {
      this.player = player;
      this.groundLayer = groundLayer;
      this.plagues = plagues;
      this.playerWeapon = playerWeapon;
   }

   addCallback(key: CollisionServiceCallbacksType, callback: (...args: any) => void) {
      if (!this.callbackList[key]) {
         this.callbackList[key] = callback;
      }
   }

   addGroundLayerColliders() {
      if (this.player && this.groundLayer) {
         this.scene.physics.add.collider(this.player, this.groundLayer, (player) => {
            const p = player as PlayerSprite;
            p.setModel({
               direction: Direction.NONE,
            });
         });
      }
      if (this.plagues) {
         this.scene.physics.add.collider(this.plagues, this.groundLayer, (plague) => {
            const e = plague as EnemySprite;
            e.setModel({
               direction: getOppositeDirection(e.model.direction),
            });
         });
      }
   }

   addWeaponColliders() {
      this.scene.physics.add.collider(this.playerWeapon, this.groundLayer);
   }

   addAuraColliders(aura: AuraSprite) {
      this.scene.physics.add.overlap(this.playerWeapon, aura, (weapon, aura) => {
         const a = aura as AuraSprite;
         const w = weapon as WeaponSprite;
         if (a.model.status !== 'dead' && a.model.status !== 'affected' && w.model.status === 'fire') {
            a.setModel({
               status: 'affected',
            });
         }
      });
   }

   addPlayerColliderWithEnemies() {
      if (this.player && this.plagues) {
         this.scene.physics.add.overlap(this.player, this.plagues, (player, plague) => {
            const e = plague as EnemySprite;
            if (e.model.status !== 'inactive') {
               const p = player as PlayerSprite;
               if (p.model.status !== 'dead' && p.model.status !== 'affected') {
                  p.setModel({
                     status: 'affected',
                  });
                  this.scene.cameras.main.shake(500, 0.002);
               }
            }
         });
      }
   }

   addColliders() {
      //
      this.addGroundLayerColliders();
      //

      this.addPlayerColliderWithEnemies();

      this.addWeaponColliders();
   }
}

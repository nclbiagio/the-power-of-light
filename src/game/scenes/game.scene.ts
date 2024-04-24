import { Scene, Tilemaps, Types } from 'phaser';
import { ObjectLayers, TileLayers } from '../core/model/game.model';
import { GameService } from '../services/game.service';
import { GundoEntity } from '../entities/gundo.entity';
import { PathLightEntity } from '../entities/path-light.entity';
import { PlagueEntity } from '../entities/plague.entity';
import { CollisionEntities, CollisionService } from '../services/collisions.service';

export type ObjectLayersTypes = 'playerObjectLayer' | 'enemyFactoryObjectLayer';
export type TileLayersTypes = 'groundLayer';

export class GameScene extends Scene {
   #gameService = GameService.getInstance();
   #collisionService = new CollisionService(this);

   tileMap!: Tilemaps.Tilemap;
   tileLayers: TileLayers<TileLayersTypes> | null = null;
   objectLayers: ObjectLayers<ObjectLayersTypes> | null = null;

   player!: GundoEntity;
   playerWeapon: PathLightEntity | null = null;
   plagues!: Phaser.GameObjects.Group;
   plaguesAura!: Phaser.GameObjects.Group;

   timer: Phaser.Time.TimerEvent | null = null;
   timerCountdown = 300;

   enemiesData: { x: number; y: number; velocity: number }[] = [];

   constructor() {
      super({
         key: 'GameScene',
      });
   }

   init() {
      this.#gameService.scene$.next('game');
      this.physics.world.fixedStep = false;
   }

   startGameOverScene() {
      this.scene.start('GameOverScene');
   }

   create(): void {
      this.tileLayers = this.createTileLayers();
      this.objectLayers = this.createObjectsLayers();
      if (!this.objectLayers) {
         throw Error('One or more object layer is missing in Tiled map');
      } else {
         this.player = this.createPlayer();
         this.playerWeapon = this.createPlayerWeapon();
         this.plagues = this.createEnemies();

         this.createPhysicsColliders();
         this.createCamera();

         this.timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
               this.timerCountdown = this.timerCountdown - 1;
               let min = Math.floor(this.timerCountdown / 60).toFixed(0);
               let sec = (this.timerCountdown % 60).toFixed(0);
               //every min add new group of enemies
               if (sec === '7') {
                  this.#gameService.addedNewEnemies$.next(true);
                  this.updateEnemies();
               }
               //set countdown on screen
               if (Number(min) < 10) {
                  min = `0${min}`;
               }
               if (Number(sec) < 10) {
                  sec = `0${sec}`;
               }
               const timeLeft = `${min}:${sec}`;
               this.#gameService.gameCountdown$.next(timeLeft);
            },
            loop: true,
         });
      }
      if (!this.tileMap && !this.player) {
         throw Error('gameMap OR player are missing!');
      }
   }

   createTileLayers(): TileLayers<TileLayersTypes> | null {
      let tileLayersError = null;
      const key = 'map';
      //List of layers
      let groundLayer: Tilemaps.TilemapLayer | null = null;
      this.tileMap = this.make.tilemap({
         key,
      });
      if (this.tileMap) {
         this.#gameService.tileMap = this.tileMap;
         const groundTiles = this.tileMap.addTilesetImage('ground', 'ground');
         //Ground Tiles
         if (groundTiles) {
            groundLayer = this.tileMap.createLayer('Ground', [groundTiles], 0, 0);
            if (groundLayer) {
               groundLayer.setCollisionByProperty({ collides: true });
               this.setAmbientLights(groundLayer);
            } else {
               tileLayersError = `[ERROR] Ground Layer not created!`;
            }
         } else {
            tileLayersError = `[ERROR] Ground Tiles not created!`;
         }
      } else {
         tileLayersError = `[ERROR] Game Map with key ${key} not created!`;
      }

      if (tileLayersError) {
         throw new Error(tileLayersError);
      }

      return groundLayer
         ? {
              groundLayer,
           }
         : null;
   }

   createObjectsLayers(): ObjectLayers<ObjectLayersTypes> | null {
      //let tileObjectsError = null;
      if (this.tileMap) {
         const playerObjectLayer = this.tileMap.getObjectLayer('Player');
         const enemyFactoryObjectLayer = this.tileMap.getObjectLayer('EnemyFactory');
         if (playerObjectLayer && enemyFactoryObjectLayer) {
            return {
               playerObjectLayer,
               enemyFactoryObjectLayer,
            };
         } else {
            return null;
         }
      } else {
         return null;
      }
   }

   setAmbientLights(groundLayer: Tilemaps.TilemapLayer) {
      groundLayer.setPipeline('Light2D');
      this.lights.enable();
      this.lights.setAmbientColor(0xffffff);
   }

   createPlayer(): GundoEntity {
      let playerPosition = {
         x: 256,
         y: 360,
      };
      if (this.tileMap) {
         if (this.objectLayers && this.objectLayers.playerObjectLayer) {
            const playerObject = this.objectLayers.playerObjectLayer.objects[0];
            playerPosition = {
               x: playerObject.x || playerPosition.x,
               y: playerObject.y || playerPosition.y,
            };
         }
      }
      const player = GundoEntity.create(
         this,
         {
            x: playerPosition.x,
            y: playerPosition.y,
         },
         {
            hasWeapon: true,
         }
      );
      if (player) {
         this.#gameService.playerLives$.next(player.model.lives);
      }
      return player;
   }

   createPlayerWeapon() {
      const position = {
         x: this.player.x,
         y: this.player.y,
      };

      const weapon = PathLightEntity.create(this, { ...position }, { status: 'active' });

      return weapon;
   }

   removePlayerWeapon() {
      if (this.playerWeapon) {
         this.playerWeapon.destroyWeapon();
         this.playerWeapon = null;
      }
   }

   updateEnemies() {
      const newEnemiesData = [];
      const originalNumberOfEnemies = this.enemiesData.length;
      const enemiesToAddEachMinutes = Math.round(this.enemiesData.length / 2);
      for (let i = 0; i <= enemiesToAddEachMinutes; i++) {
         const randomIndex = Phaser.Math.Between(0, originalNumberOfEnemies);
         if (this.enemiesData[randomIndex]) {
            newEnemiesData.push(this.enemiesData[randomIndex]);
         }
      }
      for (const data of newEnemiesData) {
         const enemy = this.createEnemy(data, true);
         this.plagues.add(enemy);
      }
      //Colliders for the new entries
      this.createPlagueAuraColliders();
   }

   createEnemies(): Phaser.GameObjects.Group {
      const enemiesGroup = this.add.group();
      if (this.objectLayers) {
         const total = this.objectLayers.enemyFactoryObjectLayer.objects.length;
         this.objectLayers.enemyFactoryObjectLayer.objects.forEach((obj, index) => {
            if (index <= total) {
               const enemy = this.createEnemy(obj);
               this.enemiesData.push({ x: enemy.x, y: enemy.y, velocity: enemy.model.defaultVel });
               enemiesGroup.add(enemy);
            }
         });
      }
      return enemiesGroup;
   }

   createEnemy(obj: Partial<{ x: number; y: number; velocity: number }>, upgrade = false) {
      const x = obj.x || 0;
      const y = obj.y || 0;
      const pos = {
         x,
         y,
      };
      const upgradedVel = obj.velocity ? obj.velocity + 10 : Math.floor(Math.random() * 200);
      const vel = !upgrade ? Math.floor(Math.random() * 200) : upgradedVel;
      const enemy = PlagueEntity.create(this, pos, {
         lives: 1,
         defaultVel: Math.floor(Math.random() * 200),
         animationStatus: 'plague',
         isBackToHuman: false,
         auraCollisionEnabled: false,
      });
      enemy.setRandomMoveEvent();
      return enemy;
   }

   createCamera(): void {
      if (this.tileMap) {
         this.cameras.main.setBounds(0, 0, this.tileMap.widthInPixels, this.tileMap.heightInPixels);
      }
      if (this.player) {
         this.cameras.main.startFollow(this.player, true, 1, 1);
      }
   }

   createPhysicsColliders(): void {
      if (this.tileLayers) {
         this.physics.world.bounds.width = this.tileLayers.groundLayer.width;
         this.physics.world.bounds.height = this.tileLayers.groundLayer.height;

         if (this.player && this.plagues && this.playerWeapon) {
            const collisionEntities: CollisionEntities = {
               player: this.player,
               groundLayer: this.tileLayers.groundLayer,
               plagues: this.plagues,
               playerWeapon: this.playerWeapon,
            };
            this.#collisionService.addEntities(collisionEntities);
            this.#collisionService.addColliders();
            this.createPlagueAuraColliders();
         }
      }
      //TODO check if setBoundsCollision is necessary
      this.physics.world.setBoundsCollision(true, true, true, true);
   }

   createPlagueAuraColliders() {
      if (this.plagues && this.plagues.children.entries.length > 0) {
         for (let i = 0; i <= this.plagues.children.entries.length; i++) {
            const plague = this.plagues.children.entries[i] as PlagueEntity;
            if (plague && plague.aura && !plague.model.auraCollisionEnabled) {
               this.#collisionService.addAuraColliders(plague.aura);
               plague.setPlagueModel({
                  auraCollisionEnabled: true,
               });
            }
         }
      }
   }

   saveScoreOnLocalStorage(points: number) {
      const currentScore = localStorage.getItem('score');
      const currentHumanSaved = localStorage.getItem('saved');
      if (currentScore) {
         localStorage.setItem('score', `${Number(currentScore) + points}`);
      } else {
         localStorage.setItem('score', `${points}`);
      }
      //console.log(Number(currentScore) + points);

      if (currentHumanSaved) {
         localStorage.setItem('saved', `${Number(currentHumanSaved) + 1}`);
      } else {
         localStorage.setItem('saved', `1`);
      }
   }

   override update(time: number): void {
      const loop = this.sys.game.loop;
      if (this.#gameService.debug) {
         this.#gameService.fps$.next(loop.actualFps);
         this.#gameService.delta$.next(loop.delta);
      }

      if (this.player) {
         if (this.player.model.status === 'affected' || this.player.model.status === 'dead') {
            this.#gameService.playerLives$.next(this.player.model.lives);
         }
         if (this.player.model.status === 'dead') {
            this.startGameOverScene();
         }
         this.player.update(time);
      }

      if (this.playerWeapon && this.playerWeapon.model.status === 'dead') {
         this.removePlayerWeapon();
      }
      if (this.player.model.hasWeapon && this.playerWeapon && this.playerWeapon.model.status !== 'dead') {
         this.playerWeapon.update(this.player.x, this.player.y, this.player.body.velocity, this.player.model.direction, this.player.model.status, time);
      }

      for (const e of this.plagues.children.entries) {
         if (e.active) {
            const enemy = e as PlagueEntity;
            if (enemy.plagueIsInactiveButNotHumanBeing) {
               this.#gameService.updateGameScore$.next(enemy.model.defaultVel);
               this.saveScoreOnLocalStorage(enemy.model.defaultVel);
            }
            enemy.update(time);
         }
      }
   }
}

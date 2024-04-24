import { Scene } from 'phaser';
import { GameService } from '../services/game.service';
import { MessageService } from '../services/message.service';
import { GundoEntity } from '../entities/gundo.entity';
import { PathLightEntity } from '../entities/path-light.entity';
import { PlagueEntity } from '../entities/plague.entity';
import { PlagueAuraEntity } from '../entities/plague-aura.entity';

export class LoadAssetsScene extends Scene {
   #gameService = GameService.getInstance();

   constructor() {
      super({
         key: 'LoadAssetsScene',
      });
   }

   init() {
      this.#gameService.scene$.next('loadAssets');
   }

   preload() {
      this.load.setPath(this.#gameService.assetsPath);

      //Loading Assets Progress Bar
      this.load.on('progress', (items: number) => {
         const status = items * 100;
         this.#gameService.loadProgress$.next(Math.round(status));
         //console.info('Items Loading Progress: ', status);
         if (status === 100) {
            setTimeout(() => {
               this.scene.start('StartScene');
            }, 1000);
         }
      });
      this.load.on('fileprogress', (file: { key: string }) => {
         //console.info('Loading asset: ', file.key);
      });

      this.load.audio('theme', ['intro.mp3']);

      this.load.image('ground', 'ground.png');

      this.load.tilemapTiledJSON('map', 'map.json');

      GundoEntity.loadSpritesheet(this);
      PlagueEntity.loadSpritesheet(this);
      PathLightEntity.loadSpritesheet(this);
      PlagueAuraEntity.loadSpritesheet(this);
   }
}

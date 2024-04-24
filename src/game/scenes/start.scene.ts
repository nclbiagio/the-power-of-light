import { Scene } from 'phaser';
import { GameService } from '../services/game.service';
import { MessageService } from '../services/message.service';
import { EventBus } from '../EventBus';

export class StartScene extends Scene {
   #gameService = GameService.getInstance();
   music!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
   musicIsPlaying = false;
   constructor() {
      super({
         key: 'StartScene',
      });
   }

   init() {
      this.#gameService.scene$.next('start');
      EventBus.on('play-game', () => {
         if (this.musicIsPlaying) {
            this.music.stop();
         }
         this.scene.start('PlotScene');
      });
      EventBus.on('play-sound', () => {
         this.musicIsPlaying = true;
         this.music.play();
      });
      EventBus.on('stop-sound', () => {
         if (this.musicIsPlaying) {
            this.music.stop();
         }
      });
   }

   create() {
      this.music = this.sound.add('theme');
   }
}

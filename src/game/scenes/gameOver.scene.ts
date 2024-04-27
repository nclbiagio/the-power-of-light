import { Scene } from 'phaser';
import { GameService } from '../services/game.service';
import { EventBus } from '../EventBus';

export class GameOverScene extends Scene {
   #gameService = GameService.getInstance();
   constructor() {
      super({
         key: 'GameOverScene',
      });
   }

   init() {
      this.#gameService.scene$.next('gameOver');
      EventBus.on('restart', () => {
         this.#gameService.gameCountdown$.next(null);
         this.#gameService.updateGameScore$.next(0);
         this.#gameService.scene$.next('start');
         //location.reload()
      });
   }

   create() {}
}

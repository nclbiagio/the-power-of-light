import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, WritableSignal, inject, model, signal } from '@angular/core';
import { GameService } from '../../game/services/game.service';
import { EventBus } from '../../game/EventBus';
import { RecapTotalScoresComponent } from './recap-total-scores.component';
import { NgOptimizedImage } from '@angular/common';
import { GameMusicComponent } from './music.component';

@Component({
   selector: 'app-game-start-menu',
   standalone: true,
   imports: [RecapTotalScoresComponent, NgOptimizedImage, GameMusicComponent],
   template: `
      <div class="game-menu flex items-center justify-center flex-col w-full h-full">
         <img ngSrc="{{ assetsPath() }}logoStart.png" width="500" height="400" priority />
         <div class="instructions-container flex items-center justify-center rounded w-full pb-4">
            <div class="flex flex-row items-center">
               <p class="p-2">Use A,D,S,W to move around, SPACE to HIT enemy</p>
            </div>
         </div>
         <app-music />
         <div class="mt-4 flex justify-center">
            <button
               (click)="playGame()"
               class="msg-btn focus-ring relative flex items-center justify-center rounded-2xl px-5 py-2.5 bg-sky-600 text-white hover:bg-sky-600/80"
               type="button"
            >
               Start
            </button>
         </div>
      </div>
   `,
   styles: [
      `
         .instructions-container {
            background: rgba(0, 0, 0, 0.3803921569);
            line-height: 22px;
            font-size: 14px;
            color: white;
            overflow: hidden;
            text-align: center;
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameStartMenuComponent implements OnInit {
   destroyRef = inject(DestroyRef);
   #gameService = GameService.getInstance();

   assetsPath = signal(this.#gameService.assetsPath);

   checked = model(false);

   constructor() {}

   ngOnInit(): void {}

   playGame() {
      EventBus.emit('play-game');
   }

   toggle() {
      this.checked.set(!this.checked());
      if (this.checked()) {
         EventBus.emit('play-sound');
      } else {
         EventBus.emit('stop-sound');
      }
   }
}

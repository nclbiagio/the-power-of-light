import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, WritableSignal, inject, model, signal } from '@angular/core';
import { GameService } from '../../game/services/game.service';
import { EventBus } from '../../game/EventBus';
import { RecapTotalScoresComponent } from './recap-total-scores.component';
import { NgOptimizedImage } from '@angular/common';

@Component({
   selector: 'app-game-start-menu',
   standalone: true,
   imports: [RecapTotalScoresComponent, NgOptimizedImage],
   template: `
      <div class="game-menu flex items-center justify-center flex-col">
         <img ngSrc="{{ assetsPath() }}logoStart.png" width="500" height="400" priority />
         <div class="instructions-container flex items-center justify-center">
            <div class="flex flex-row items-center">
               <p>Use A,D,S,W to move around, SPACE to HIT enemy</p>
            </div>
         </div>
         <div class="mt-2 flex flex-row items-center">
            <div class="mr-2">
               <span class="checkbox-label">Menu Audio</span>
            </div>
            <div class="checkbox">
               <input (click)="toggle()" type="checkbox" [(checked)]="checked" class="checkbox-input" />
            </div>
         </div>
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
         .game-menu {
            width: 100%;
            padding: 20px;
         }
         .instructions-container {
            background: rgba(0, 0, 0, 0.3803921569);
            border-radius: 4px;
            width: 360px;
            line-height: 22px;
            font-size: 14px;
            color: white;
            width: 100%;
            overflow: hidden;
            text-align: center;
            padding-bottom: 10px;
         }
         .checkbox-label {
            color: #fff;
         }

         .checkbox .checkbox-input {
            appearance: none;
            background-color: #dfe1e4;
            border-radius: 72px;
            border-style: none;
            flex-shrink: 0;
            height: 20px;
            margin: 0;
            position: relative;
            width: 30px;
            cursor: pointer;
         }

         .checkbox .checkbox-input::before {
            bottom: -6px;
            content: '';
            left: -6px;
            position: absolute;
            right: -6px;
            top: -6px;
         }

         .checkbox .checkbox-input,
         .checkbox .checkbox-input::after {
            transition: all 100ms ease-out;
         }

         .checkbox .checkbox-input::after {
            background-color: #fff;
            border-radius: 50%;
            content: '';
            height: 14px;
            left: 3px;
            position: absolute;
            top: 3px;
            width: 14px;
         }

         .checkbox input[type='checkbox'] {
            cursor: pointer;
         }

         .checkbox .checkbox-input:hover {
            background-color: #c9cbcd;
            transition-duration: 0s;
         }

         .checkbox .checkbox-input:checked {
            background-color: #6e79d6;
         }

         .checkbox .checkbox-input:checked::after {
            background-color: #fff;
            left: 13px;
         }

         .checkbox :focus:not(.focus-visible) {
            outline: 0;
         }

         .checkbox .checkbox-input:checked:hover {
            background-color: #535db3;
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

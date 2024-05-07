import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, WritableSignal, inject, model, signal } from '@angular/core';
import { GameService } from '../../game/services/game.service';
import { EventBus } from '../../game/EventBus';
import { RecapTotalScoresComponent } from './recap-total-scores.component';
import { NgOptimizedImage } from '@angular/common';

@Component({
   selector: 'app-music',
   standalone: true,
   imports: [],
   template: `
      <div class="music-container">
         <div class="mt-2 flex flex-row items-center">
            <div class="mr-2">
               <span class="checkbox-label">Audio</span>
            </div>
            <div class="checkbox">
               <input (click)="toggle()" type="checkbox" [(checked)]="checked" class="checkbox-input" />
            </div>
         </div>
      </div>
   `,
   styles: [
      `
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
export class GameMusicComponent implements OnInit {
   destroyRef = inject(DestroyRef);
   checked = model(false);

   constructor() {}

   ngOnInit(): void {}

   toggle() {
      this.checked.set(!this.checked());
      if (this.checked()) {
         EventBus.emit('play-sound');
      } else {
         EventBus.emit('stop-sound');
      }
   }
}

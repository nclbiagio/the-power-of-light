import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RecapTotalScoresComponent } from './recap-total-scores.component';
import { EventBus } from '../../game/EventBus';

@Component({
   selector: 'app-game-over',
   standalone: true,
   imports: [RecapTotalScoresComponent],
   template: `
      <div class="gameOver">
         <h1 class="title">Game Over</h1>
         <app-recap-total-scores [availableForScene]="'gameOver'" />
         <div class="mt-2 flex justify-center">
            <button
               (click)="restartGame()"
               class="msg-btn focus-ring relative flex items-center justify-center rounded-2xl px-5 py-2.5 bg-sky-600 text-white hover:bg-sky-600/80"
               type="button"
            >
               Try Again
            </button>
         </div>
      </div>
   `,
   styles: [
      `
         .title {
            color: wheat;
            font-size: 40px;
            margin-bottom: 20px;
            text-align: center;
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameOverComponent implements OnInit {
   constructor() {}

   ngOnInit(): void {}

   restartGame() {
      EventBus.emit('restart');
   }
}

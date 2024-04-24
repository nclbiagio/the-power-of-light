import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, WritableSignal, inject, input, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../game/services/game.service';

@Component({
   selector: 'app-recap-total-scores',
   standalone: true,
   imports: [AsyncPipe],
   template: `
      @if (availableForScene() === 'gameOver') {
         <div class="score">
            <div class="label text-center m-4">
               <b>Total score points</b>: <span class="ml-4">{{ currentScore() }}</span>
            </div>
            <div class="label text-center m-4">
               <b>Total human saved</b>: <span class="ml-4">{{ currentSaved() }}</span>
            </div>
         </div>
      }
      @if (availableForScene() === 'start') {
         <div class="score-list w-full mb-4">
            @for (item of scoreList(); track $index) {
               <div class="flex flex-row items-center justify-between mb-1">
                  <span class="label mr-4">{{ item.date }}</span>
                  <span class="label">{{ item.score }}</span>
               </div>
            }
         </div>
      }
   `,
   styles: [
      `
         .score {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
         }
         .label {
            font-size: 14px;
            color: #fff;
            line-height: 22px
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecapTotalScoresComponent implements OnInit {
   destroyRef = inject(DestroyRef);
   gameService = GameService.getInstance();
   availableForScene = input.required<'start' | 'gameOver'>();
   currentScore: WritableSignal<string> = signal('0');
   currentSaved: WritableSignal<string> = signal('0');
   scoreList: WritableSignal<{ date: string; score: string }[]> = signal([]);

   constructor() {}

   ngOnInit(): void {
      const currentScore = localStorage.getItem('score');
      const currentHumanSaved = localStorage.getItem('saved');
      const scoreList = localStorage.getItem('totals');
      if (this.availableForScene() && this.availableForScene() === 'gameOver') {
         if (currentScore) {
            this.currentScore.set(currentScore);
            localStorage.removeItem('score');
         }
         if (currentHumanSaved) {
            this.currentSaved.set(currentHumanSaved);
            localStorage.removeItem('saved');
         }
         let scoreListArray: { date: string; score: string }[] = [];
         if (scoreList) {
            scoreListArray = JSON.parse(scoreList);
         }
         scoreListArray.push({ date: new Date().toISOString(), score: this.currentScore() || '0' });
         localStorage.setItem('totals', JSON.stringify(scoreListArray));
      }
      if (this.availableForScene() && this.availableForScene() === 'start') {
         if (scoreList) {
            this.scoreList.set(JSON.parse(scoreList));
         }
      }
   }
}

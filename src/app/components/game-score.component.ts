import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, WritableSignal, inject, signal } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../game/services/game.service';

@Component({
   selector: 'app-game-score',
   standalone: true,
   imports: [AsyncPipe, JsonPipe],
   template: `
      <div class="score">
         <div class="counter"><b>Points</b> {{ score() }}</div>
      </div>
   `,
   styles: [
      `
         .counter {
            color: #fff;
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameScoreComponent implements OnInit {
   destroyRef = inject(DestroyRef);
   gameService = GameService.getInstance();
   score: WritableSignal<number> = signal(0);

   gameScore$ = this.gameService.updateGameScore$.pipe(takeUntilDestroyed());

   constructor() {
      this.gameScore$.subscribe((score) => {
         const updatedScore = this.score() + score;
         this.score.set(updatedScore);
      });
   }

   ngOnInit(): void {}
}

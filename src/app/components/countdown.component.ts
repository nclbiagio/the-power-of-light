import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../game/services/game.service';

@Component({
   selector: 'app-game-countdown',
   standalone: true,
   imports: [],
   template: `
      <div class="countdown">
         <div class="counter"><b>Time left</b> {{ countdown() }}</div>
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
export class GameCountdownComponent implements OnInit {
   destroyRef = inject(DestroyRef);
   gameService = GameService.getInstance();
   countdown: WritableSignal<string> = signal('0:00');

   gameCountdown$ = this.gameService.gameCountdown$.pipe(takeUntilDestroyed());

   constructor() {
      this.gameCountdown$.subscribe((cd) => {
         this.countdown.set(cd || '0:00');
      });
   }

   ngOnInit(): void {}
}

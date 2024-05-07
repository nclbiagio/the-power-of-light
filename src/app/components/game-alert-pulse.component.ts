import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../game/services/game.service';

@Component({
   selector: 'app-game-alert-pulse',
   standalone: true,
   imports: [],
   template: `
      @if (pulse()) {
         <div class="pulse"></div>
      }
   `,
   styles: [
      `
         .pulse {
            background: transparent;
            border-radius: 0%;
            margin: 10px;
            height: 100%;
            width: 100%;
            box-shadow: 0 0 0 0 rgba(223, 41, 41, 1);
            transform: scale(1);
            animation: pulse 1s infinite;
         }

         @keyframes pulse {
            0% {
               transform: scale(0.95);
               box-shadow: 0 0 0 0 rgba(223, 41, 41, 0.7);
            }

            70% {
               transform: scale(1);
               box-shadow: 0 0 0 10px rgba(223, 41, 41, 0);
            }

            100% {
               transform: scale(0.95);
               box-shadow: 0 0 0 0 rgba(223, 41, 41, 0);
            }
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameAlertPulseComponent implements OnInit {
   destroyRef = inject(DestroyRef);
   gameService = GameService.getInstance();
   pulse: WritableSignal<boolean> = signal(false);

   addedNewEnemies$ = this.gameService.addedNewEnemies$.pipe(takeUntilDestroyed());

   constructor() {
      this.addedNewEnemies$.subscribe((pulse) => {
         this.pulse.set(pulse);
         if (pulse) {
            setTimeout(() => {
               this.gameService.addedNewEnemies$.next(false);
            }, 9000);
         }
      });
   }

   ngOnInit(): void {}
}

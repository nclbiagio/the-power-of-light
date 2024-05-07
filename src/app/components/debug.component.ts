import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { combineLatest, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../game/services/game.service';

@Component({
   selector: 'app-game-debug',
   standalone: true,
   imports: [NgClass],
   template: `
      <div class="debugFps flex flex-col">
         <span class="fps element mb-4">FPS: {{ fpsDebug() }}</span>
         <span class="delta element mb-4">DELTA: {{ deltaDebug() }}</span>
         <button
            [disabled]="!appHasLocalStorage"
            (click)="resetStorageData()"
            class="element relative flex items-center justify-center rounded-2xl px-5 py-2.5 bg-sky-600 text-white"
            type="button"
         >
            Reset Storage
         </button>
      </div>
   `,
   styles: [
      `
         .debugFps button:disabled {
            opacity: 0.4;
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebugComponent implements OnInit {
   destroyRef = inject(DestroyRef);
   gameService = GameService.getInstance();
   fpsDebug = signal(0);
   deltaDebug = signal(0);

   constructor() {}

   ngOnInit(): void {
      if (this.gameService.debug) {
         combineLatest([this.gameService.fps$, this.gameService.delta$])
            .pipe(
               takeUntilDestroyed(this.destroyRef),
               tap(([fps, delta]) => {
                  this.fpsDebug.set(Number(fps.toFixed(2)));
                  this.deltaDebug.set(Number(delta.toFixed(2)));
               })
            )
            .subscribe();
      }
   }

   get appHasLocalStorage() {
      return localStorage.getItem('score') !== null;
   }

   resetStorageData() {
      localStorage.clear();
      location.reload();
   }
}

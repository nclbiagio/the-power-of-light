import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../game/services/game.service';

@Component({
   selector: 'app-player-health-bar',
   standalone: true,
   imports: [],
   template: `
      <div class="player-hp flex flex-row items-center justify-center relative">
         <img src="{{ assetsPath() }}icon-player.png" class="mr-2" />
         <div class="health-bar-container">
            <div class="h-3 relative max-w-xl rounded-full overflow-hidden">
               <div class="w-full h-full bg-gray-200 absolute"></div>
               <div id="bar" [style.width.%]="(healthBar() || 0) * 10" class="transition-all ease-out duration-1000 h-full bg-green-500 relative"></div>
            </div>
         </div>
      </div>
   `,
   styles: [
      `
         .health-bar-container {
            width: 200px;
         }
         .g-logo {
            width: 32px;
            height: 27px;
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerHealthBarComponent implements OnInit {
   destroyRef = inject(DestroyRef);
   #gameService = GameService.getInstance();
   healthBar: WritableSignal<number> = signal(0);

   playerLives$ = this.#gameService.playerLives$.pipe(takeUntilDestroyed());

   assetsPath = signal(this.#gameService.assetsPath);

   constructor() {
      this.playerLives$.subscribe((lives) => {
         this.healthBar.set(lives || 0);
      });
   }

   ngOnInit(): void {}
}

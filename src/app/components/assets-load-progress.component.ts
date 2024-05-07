import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameService } from '../../game/services/game.service';

@Component({
   selector: 'app-assets-load-progress',
   standalone: true,
   imports: [],
   template: `
      <div class="load-progress">
         <div class="progress">
            <h1>{{ progress() }}&#x00025;</h1>
         </div>
      </div>
   `,
   styles: [
      `
         .load-progress {
            background-color: #6c6ca6bd;
            padding: 20px;
         }
         .progress h1 {
            color: #fff;
            font-size: 60px;
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsLoadProgressComponent implements OnInit {
   destroyRef = inject(DestroyRef);
   gameService = GameService.getInstance();
   progress: WritableSignal<number> = signal(0);

   loadProgress$ = this.gameService.loadProgress$.pipe(takeUntilDestroyed());

   constructor() {
      this.loadProgress$.subscribe((progress) => {
         this.progress.set(progress);
      });
   }

   ngOnInit(): void {}
}

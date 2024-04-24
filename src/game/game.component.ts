import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, inject, signal } from '@angular/core';
import Phaser from 'phaser';
import { StartGame } from './main';
import { GameSceneTypes, GameService } from './services/game.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageComponent } from '../app/components/message.component';
import { MessageService } from './services/message.service';
import { AsyncPipe } from '@angular/common';
import { PlayerHealthBarComponent } from '../app/components/player-health-bar.component';
import { GameCountdownComponent } from '../app/components/countdown.component';
import { GameScoreComponent } from '../app/components/game-score.component';
import { GameOverComponent } from '../app/components/game-over.component';
import { GameStartMenuComponent } from '../app/components/game-start-menu.component';
import { GameAlertPulseComponent } from '../app/components/game-alert-pulse.component';
import { AssetsLoadProgressComponent } from '../app/components/assets-load-progress.component';
import { NgOptimizedImage } from '@angular/common';
import { DebugComponent } from '../app/components/debug.component';

@Component({
   selector: 'app-game',
   template: `
      <div class="game-container flex h-full">
         @if (messageService.showMessage$ | async; as showMessage) {
            @if (showMessage) {
               <div class="layer message-layer">
                  <app-message />
               </div>
            }
         }
         <div class="scene flex items-center justify-center w-full h-full">
            <div id="game"></div>
         </div>
         @if (currentScene() === 'loadAssets') {
            <div class="scene flex items-center justify-center w-full h-full">
               <div class="img-container">
                  <img ngSrc="{{ assetsPath() }}phaser-planet.png" width="764" height="662" priority />
               </div>
               <app-assets-load-progress />
            </div>
         }
         @if (currentScene() === 'start') {
            <div class="scene game-scene flex items-center justify-center w-full h-full">
               <app-game-start-menu />
            </div>
         }
         @if (currentScene() === 'game') {
            @if (isDebug) {
               <div class="debug-layer">
                  <app-game-debug />
               </div>
            }
            <div class="layer pulse-layer">
               <app-game-alert-pulse class="pulse" />
            </div>
            <div class="scene flex items-center justify-center w-full h-full">
               <div class="game-data">
                  <div class="player-hp m-4">
                     <app-player-health-bar />
                  </div>
                  <div class="game-countdow m-4">
                     <app-game-countdown />
                  </div>
                  <div class="game-score m-4">
                     <app-game-score />
                  </div>
               </div>
            </div>
         }
         @if (currentScene() === 'gameOver') {
            <div class="scene flex items-center justify-center w-full h-full">
               <app-game-over />
            </div>
         }
      </div>
   `,
   standalone: true,
   imports: [
      AsyncPipe,
      MessageComponent,
      PlayerHealthBarComponent,
      GameCountdownComponent,
      GameScoreComponent,
      GameOverComponent,
      GameStartMenuComponent,
      GameAlertPulseComponent,
      AssetsLoadProgressComponent,
      NgOptimizedImage,
      DebugComponent,
   ],
   styles: [
      `
         .scene,
         .layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
            flex-direction: column;
         }
         .pulse {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
         }
         .message-layer,
         .pulse-layer {
            z-index: 9998;
            overflow: hidden;
         }
         .debug-layer {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            color: white;
            font-size: 12px;
            z-index: 9999;
            overflow: hidden;
         }
         .game-data {
            position: absolute;
            top: 0;
            left: 0;
         }
         .img-container {
            width: 500px;
         }
      `,
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Game implements OnInit {
   private destroyRef = inject(DestroyRef);

   #gameService = GameService.getInstance();
   messageService = MessageService.getInstance();

   isDebug = this.#gameService.debug;

   game: Phaser.Game | null = null;
   currentScene = signal<GameSceneTypes | null>(null);

   assetsPath = signal(this.#gameService.assetsPath);

   constructor() {
      this.#gameService.scene$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((scene) => {
         if (scene) {
            this.runSceneManager(scene);
         }
      });
   }

   ngOnInit() {
      this.game = StartGame('game');
   }

   runSceneManager(scene: GameSceneTypes) {
      //console.log('Scene:', scene);
      this.currentScene.set(scene);
      switch (scene) {
         case 'loadAssets':
            break;
         case 'start':
            break;
         case 'plot':
            break;
         case 'game':
            break;
         case 'gameOver':
            if (this.game) {
               //this.game.destroy(true);
               //this.game = null;
            }
            break;
         default:
            break;
      }
   }

   // Component unmounted
   ngOnDestroy() {
      if (this.game) {
         this.game.destroy(true);
      }
   }
}

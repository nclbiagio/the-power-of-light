import { BehaviorSubject } from 'rxjs';
import { Game, Tilemaps } from 'phaser';

export type GameSceneTypes = 'loadAssets' | 'start' | 'plot' | 'game' | 'gameOver';

export class GameService {
   private static _instance: GameService;
   //---------- DEBUG
   debug = false;
   fps$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
   delta$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
   //----------
   game: Game | null = null;
   tileMap: Tilemaps.Tilemap | null = null;
   scene$: BehaviorSubject<GameSceneTypes | null> = new BehaviorSubject<GameSceneTypes | null>(null);
   //----------
   playerLives$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
   //----------
   gameCountdown$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
   updateGameScore$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
   addedNewEnemies$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
   //----------
   assetsPath = window.location.href.includes('localhost') ? 'assets/' : this.getOriginAssets(); //only for itch.io game jam otherwise use 'assets/'

   loadProgress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

   constructor() {}

   getOriginAssets() {
      const origin = window.location.href.replace('/index.html', '');
      return `${origin}/assets/`;
   }

   static getInstance(): GameService {
      if (this._instance) {
         return this._instance;
      }

      this._instance = new GameService();
      return this._instance;
   }
}

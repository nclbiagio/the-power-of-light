import Phaser, { Game } from 'phaser';
import { LoadAssetsScene } from './scenes/loadAssets.scene';
import { GameService } from './services/game.service';
import { GameScene } from './scenes/game.scene';
import { GameOverScene } from './scenes/gameOver.scene';
import { StartScene } from './scenes/start.scene';
import { PlotScene } from './scenes/plot.scene';

const config: Phaser.Types.Core.GameConfig = {
   type: Phaser.WEBGL,
   parent: 'game',
   scene: [LoadAssetsScene, StartScene, PlotScene, GameScene, GameOverScene],
   audio: {
      disableWebAudio: true,
   },
   scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 480,
      height: 460,
   },
   render: {
      antialiasGL: true,
      pixelArt: true,
   },
   physics: {
      default: 'arcade',
      arcade: {
         debug: GameService.getInstance().debug,
      },
   },
   powerPreference: 'high-performance',
};

export const StartGame = (parent: string) => {
   return new Game({ ...config, parent });
};

import { Scene } from 'phaser';
import { GameService } from '../services/game.service';
import { MessageService } from '../services/message.service';

export class PlotScene extends Scene {
   #gameService = GameService.getInstance();
   #messageService = MessageService.getInstance();

   constructor() {
      super({
         key: 'PlotScene',
      });
   }

   init() {
      this.#gameService.scene$.next('plot');
      this.addMessageToShowPlot();
   }

   addMessageToShowPlot() {
      this.#messageService.addMessagesList([
         {
            id: 'plot1',
            image: `${this.#gameService.assetsPath}plot1.png`,
            rows: [
               "In the very distant past, man had given household appliances a consciousness.",
               'A mad microwave decided to exterminate the human race by modifying its magnetron, generating something dark and terrible.',
               'The modified magnetron in fact poured a stream of evil microwaves onto the earth.',
               "Humans began to transform into hideous formless plagues destined to wander for eternity.",
            ],
            onCloseCallback: () => {
               this.#messageService.setMessage('plot2');
            },
         },
         {
            id: 'plot2',
            image: `${this.#gameService.assetsPath}plot2.png`,
            rows: [
               "But a flashlight, horrified by humanity's terrible fate, decided to oppose it.",
               "The flashlight modified its circuits so that it could emit a special beam of green light.",
               'The plagues, illuminated by the beam of light, would be restored to their human form.',
               "The flashlight was given to a valiant man so that he could use its power and save the world.",
            ],
            onCloseCallback: () => {
               this.#messageService.setMessage('plot3');
            },
         },
         {
            id: 'plot3',
            image: `${this.#gameService.assetsPath}plot3.png`,
            rows: [
               'Use the power of the flashlight for at least two seconds while inside the aura emitted by the plagues.',
               'Earn points by healing as many infected humans as plagues and become the hero the world is looking for.',
            ],
            onCloseCallback: () => {
               this.#messageService.closeMessage();
               localStorage.setItem('plotIsViewed', 'true');
               this.scene.start('GameScene');
            },
         },
      ]);
   }

   create() {
      const plotViewed = localStorage.getItem('plotIsViewed');
      if (plotViewed && plotViewed === 'true') {
         this.scene.start('GameScene');
      } else {
         this.#messageService.openMessage('plot1');
      }
   }
}

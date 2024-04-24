import { Component } from '@angular/core';
import { Game } from '../game/game.component';

@Component({
   selector: 'app-root',
   standalone: true,
   imports: [Game],
   templateUrl: './app.component.html',
   styleUrl: './app.component.scss',
})
export class AppComponent {}

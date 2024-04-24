import { Tilemaps } from 'phaser';

export type Cursors = Record<'w' | 'a' | 's' | 'd' | 'up' | 'left' | 'down' | 'right' | 'space', Phaser.Input.Keyboard.Key>;

export type TileLayers<T extends string> = {
   [key in T]: Tilemaps.TilemapLayer;
};

export type ObjectLayers<T extends string> = {
   [key in T]: Tilemaps.ObjectLayer;
};

import { Direction } from '../core/model/entity.model';

export const getOppositeDirection = (direction: Direction) => {
   if (direction === Direction.LEFT) {
      return Direction.RIGHT;
   } else if (direction === Direction.RIGHT) {
      return Direction.LEFT;
   } else if (direction === Direction.UP) {
      return Direction.DOWN;
   } else if (direction === Direction.DOWN) {
      return Direction.UP;
   } else {
      return Direction.NONE;
   }
};

export const canDoActionAfterDelay = (time: number, lastActionAt: number, delay: number) => {
   if (time - lastActionAt < delay) {
      return false;
   } else {
      return true;
   }
};

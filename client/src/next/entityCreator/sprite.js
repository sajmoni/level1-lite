import * as Render from '../../internal/Render';
import * as Core from '../../internal/Core';
import getX from '../entityUtil/getX';
import getY from '../entityUtil/getY';
import getNewEntity from './getNewEntity';

/**
 * Flip Sprite horizontally
 * @param {PIXI.Srite|PIXI.AnimatedSprite|PIXI.Text} sprite
 */
// export function flipSprite(sprite) {
//   sprite.anchor.x = 1;
//   sprite.scale.x *= -1;
//   sprite.flipped = !sprite.flipped;
// }

export default (options) => {
  const {
    texture,
    // flipX = false,
    // flipY = false,
    zIndex = 0,
  } = options;

  if (!texture) {
    throw new Error('Sprite created without "texture"');
  }

  const {
    id,
  } = options;

  if (id && Core.exists(id)) {
    throw new Error(`Sprite created using an already existing id: ${id}`);
  }

  const sprite = Render.getNewPIXISprite(texture);

  // TODO: Handle flipping
  // if (flipX) {
  //   sprite.anchor.x = 1;
  //   sprite.scale.x *= -1;
  //   sprite.flipX = flipX;
  // }

  // if (flipY) {
  //   sprite.anchor.y = 1;
  //   sprite.scale.y *= -1;
  //   sprite.flipY = flipY;
  // }

  const entity = getNewEntity(options);

  sprite.zIndex = zIndex;
  sprite.filters = [];
  sprite.position.set(
    getX(entity),
    getY(entity),
  );

  Render.add(sprite);

  entity.asset = sprite;

  return Core.addEntity(entity);
};

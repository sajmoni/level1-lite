import uuid from 'uuid/v4';
import * as Render from '../internal/Render';
import * as Core from '../internal/Core';
import getDisplayObject from './getDisplayObject';

export default (options, asset) => {
  const {
    parent,
    zIndex = 0,
    id = uuid(),
    types = [],
  } = options;

  const entity = {
    id,
    types,
    asset: null,
    hasBody: false,
    behaviors: [],
    children: [],
  };

  asset.zIndex = zIndex;
  asset.filters = [];

  Render.add(getDisplayObject(parent), asset);

  entity.asset = asset;

  const defaultBody = {
    entity,
  };
  entity.body = defaultBody;

  entity.parent = null;
  if (parent) {
    entity.parent = parent;
    entity.parent.children = entity.parent.children.concat(entity);
  }

  Core.addEntity(entity);

  return entity;
};
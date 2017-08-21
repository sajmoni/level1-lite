import MainLoop from 'mainloop.js';
import { Engine } from 'matter-js';

// unaware if network is enabled or not
// unaware of renderer
// unaware of physics

// game loop
// game entities

export let engine;
let entities = [];

export function createCore(){
  MainLoop
  .setUpdate(update)
  .setMaxAllowedFPS(60);
}

export function start(){
  MainLoop.start();
}

export function setDraw(draw) {
  MainLoop.setDraw(draw);
}

export function stop(){
  MainLoop.stop();
}

export function getEntities(){
  return entities;
}

export function get(id) {
  return entities.find(e => e.id === id);
}

export function add(entity) {
  entities = entities.concat(entity);
}

export function remove(entity) {
  const { id } = entity;
  entities = entities.filter(e => e.id !== id);
  return entity;
}

export function removeAll(){
  entities.forEach(e => remove(e));
}

function update() {
  entities.forEach(e => e.run(e));
}

/* PHYSICS */

export function createPhysics(){
  engine = Engine.create();
  engine.world.gravity.y = 0;
  Engine.run(engine);
}
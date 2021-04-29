/**
 * An Entity in the world.
 */
class Entity {
  constructor(x = 0, speed = 2, positionBuffer = []) {
    this.x = x;
    this.speed = speed; // units/s
    this.positionBuffer = positionBuffer;
  }

  // Apply user's input to this entity.
  applyInput(input) {
    this.x += input.pressTime * this.speed;
  }
}

export default Entity;

/* eslint-disable no-restricted-syntax */
export function element(id) {
  return document.getElementById(id);
}

// Render all the entities in the given canvas.
export function renderWorld(canvas, entities) {
  // Clear the canvas.
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  const colours = ['blue', 'red'];

  // eslint-disable-next-line guard-for-in
  for (const i in entities) {
    const entity = entities[i];
    // Compute size and position.
    const radius = (canvas.height * 0.9) / 2;
    const x = (entity.x / 10.0) * canvas.width;

    // Draw the entity.
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, canvas.height / 2, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = colours[entity.entityId];
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = `dark${colours[entity.entityId]}`;
    ctx.stroke();
  }
}

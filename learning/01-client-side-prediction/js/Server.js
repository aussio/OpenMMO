import Entity from './Entity.js';
import { renderWorld } from './Helpers.js';

/**
 * The Server
 */
class Server {
  constructor(canvas, status, network) {
  // Connected clients and their entities.
    this.clients = [];
    this.entities = [];

    // Last processed input for each client.
    this.lastProcessedInput = [];

    // Simulated network connection.
    this.network = network;

    // UI.
    this.canvas = canvas;
    this.status = status;

    // Default update rate.
    this.setUpdateRate(10);
  }

  connect(client) {
    // Give the Client enough data to identify itself.
    client.server = this;
    client.entityId = this.clients.length;
    this.clients.push(client);

    // Create a new Entity for this Client.
    const entity = new Entity();
    this.entities.push(entity);
    entity.entityId = client.entityId;

    // Set the initial state of the Entity (e.g. spawn point)
    const spawnPoints = [4, 6];
    entity.x = spawnPoints[client.entityId];
  }

  setUpdateRate(hz) {
    this.updateRate = hz;

    clearInterval(this.updateInterval);
    this.updateInterval = setInterval(
      // eslint-disable-next-line func-names
      (function (self) { return function () { self.update(); }; }(this)),
      1000 / this.updateRate,
    );
  }

  update() {
    this.processInputs();
    this.sendWorldState();
    renderWorld(this.canvas, this.entities);
  }

  // Check whether this input seems to be valid (e.g. "make sense" according
  // to the physical rules of the World)
  // eslint-disable-next-line class-methods-use-this
  validateInput(input) {
    if (Math.abs(input.pressTime) > 1 / 40) {
      return false;
    }
    return true;
  }

  processInputs() {
    // Process all pending messages from clients.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const message = this.network.receive();
      if (!message) {
        break;
      }

      // Update the state of the entity, based on its input.
      // We just ignore inputs that don't look valid; this is what prevents clients from cheating.
      if (this.validateInput(message)) {
        const id = message.entityId;
        this.entities[id].applyInput(message);
        this.lastProcessedInput[id] = message.inputSequenceNumber;
      }
    }

    // Show some info.
    let info = 'Last acknowledged input: ';
    for (let i = 0; i < this.clients.length; i += 1) {
      info += `Player ${i}: #${this.lastProcessedInput[i] || 0}   `;
    }
    this.status.textContent = info;
  }

  // Send the world state to all the connected clients.
  sendWorldState() {
    // Gather the state of the world. In a real app, state could be filtered to avoid leaking data
    // (e.g. position of invisible enemies).
    const worldState = [];
    const numClients = this.clients.length;
    for (let i = 0; i < numClients; i += 1) {
      const entity = this.entities[i];
      worldState.push({
        entityId: entity.entityId,
        position: entity.x,
        lastProcessedInput: this.lastProcessedInput[i],
      });
    }

    // Broadcast the state to all the clients.
    for (let j = 0; j < numClients; j += 1) {
      const client = this.clients[j];
      client.network.send(client.lag, worldState);
    }
  }
}

export default Server;

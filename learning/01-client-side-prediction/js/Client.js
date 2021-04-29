/* eslint-disable no-restricted-syntax */
import Entity from './Entity.js';
import { renderWorld } from './Helpers.js';

/**
 * The Client
 */
class Client {
  constructor(canvas, status, network) {
    // Local representation of the entities.
    this.entities = {};

    // Input state.
    this.keyLeft = false;
    this.keyRight = false;

    // Simulated network connection.
    this.network = network;
    this.server = null;
    this.lag = 0;

    // Unique ID of our entity. Assigned by Server on connection.
    this.entityId = null;

    // Data needed for reconciliation.
    this.clientSidePrediction = false;
    this.serverReconciliation = false;
    this.inputSequenceNumber = 0;
    this.pendingInputs = [];

    // Entity interpolation toggle.
    this.entityInterpolation = true;

    // UI.
    this.canvas = canvas;
    this.status = status;

    // Update rate.
    this.setUpdateRate(50);
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

  // Update Client state.
  update() {
    // Listen to the server.
    this.processServerMessages();

    if (this.entityId == null) {
      return; // Not connected yet.
    }

    // Process inputs.
    this.processInputs();

    // Interpolate other entities.
    if (this.entityInterpolation) {
      this.interpolateEntities();
    }

    // Render the World.
    renderWorld(this.canvas, this.entities);

    // Show some info.
    const info = `Non-acknowledged inputs: ${this.pendingInputs.length}`;
    this.status.textContent = info;
  }

  // Get inputs and send them to the server.
  // If enabled, do client-side prediction.
  processInputs() {
    // Compute delta time since last update.
    const now = +new Date();
    const lastTimestamp = this.lastTimestamp || now;
    const deltaTimestampSec = (now - lastTimestamp) / 1000.0;
    this.lastTimestamp = now;

    // Package player's input.
    let input;
    if (this.keyRight) {
      input = { pressTime: deltaTimestampSec };
    } else if (this.keyLeft) {
      input = { pressTime: -deltaTimestampSec };
    } else {
      // Nothing interesting happened.
      return;
    }

    // Send the input to the server.
    this.inputSequenceNumber += 1;
    input.inputSequenceNumber = this.inputSequenceNumber;
    input.entityId = this.entityId;
    this.server.network.send(this.lag, input);

    // Do client-side prediction.
    if (this.clientSidePrediction) {
      this.entities[this.entityId].applyInput(input);
    }

    // Save this input for later reconciliation.
    this.pendingInputs.push(input);
  }

  // Process all messages from the server, i.e. world updates.
  // If enabled, do server reconciliation.
  processServerMessages() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const message = this.network.receive();
      if (!message) {
        break;
      }

      // World state is a list of entity states.
      for (let i = 0; i < message.length; i += 1) {
        const state = message[i];

        // If this is the first time we see this entity, create a local representation.
        if (!this.entities[state.entityId]) {
          const entity = new Entity();
          entity.entityId = state.entityId;
          this.entities[state.entityId] = entity;
        }

        const entity = this.entities[state.entityId];

        if (state.entityId === this.entityId) {
          // Received the authoritative position of this client's entity.
          entity.x = state.position;

          if (this.serverReconciliation) {
            // Server Reconciliation. Re-apply all the inputs not yet processed by
            // the server.
            let j = 0;
            while (j < this.pendingInputs.length) {
              const input = this.pendingInputs[j];
              if (input.inputSequenceNumber <= state.lastProcessedInput) {
                // Already processed. Its effect is already taken into account into the world update
                // we just got, so we can drop it.
                this.pendingInputs.splice(j, 1);
              } else {
                // Not processed by the server yet. Re-apply it.
                entity.applyInput(input);
                j += 1;
              }
            }
          } else {
            // Reconciliation is disabled, so drop all the saved inputs.
            this.pendingInputs = [];
          }
        } else if (!this.entityInterpolation) {
          // Entity interpolation is disabled - just accept the server's position.
          entity.x = state.position;
        } else {
          // Add it to the position buffer.
          const timestamp = +new Date();
          entity.positionBuffer.push([timestamp, state.position]);
        }
      }
    }
  }

  interpolateEntities() {
    // Compute render timestamp.
    const now = +new Date();
    const renderTimestamp = now - (1000.0 / this.server.updateRate);

    // eslint-disable-next-line guard-for-in
    for (const i in this.entities) {
      const entity = this.entities[i];

      // No point in interpolating this client's entity.
      if (entity.entityId === this.entityId) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // Find the two authoritative positions surrounding the rendering timestamp.
      const buffer = entity.positionBuffer;

      // Drop older positions.
      while (buffer.length >= 2 && buffer[1][0] <= renderTimestamp) {
        buffer.shift();
      }

      // Interpolate between the two surrounding authoritative positions.
      if (buffer.length >= 2 && buffer[0][0] <= renderTimestamp && renderTimestamp <= buffer[1][0]) {
        const x0 = buffer[0][1];
        const x1 = buffer[1][1];
        const t0 = buffer[0][0];
        const t1 = buffer[1][0];

        entity.x = x0 + ((x1 - x0) * (renderTimestamp - t0)) / (t1 - t0);
      }
    }
  }
}

export default Client;

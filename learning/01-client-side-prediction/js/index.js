/* eslint-disable import/first */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */

// =============================================================================
//  Get everything up and running.
// =============================================================================
import LagNetwork from './LagNetwork.js';
import Client from './Client.js';
import Server from './Server.js';
import { element } from './Helpers.js';

// When the player presses the arrow keys, set the corresponding flag in the client.
function keyHandler(e) {
  if (e.keyCode === 39) {
    player1.keyRight = (e.type === 'keydown');
  } else if (e.keyCode === 37) {
    player1.keyLeft = (e.type === 'keydown');
  } else if (e.key === 'd') {
    player2.keyRight = (e.type === 'keydown');
  } else if (e.key === 'a') {
    player2.keyLeft = (e.type === 'keydown');
  }
}

// Update simulation parameters from UI.
export function updateParameters() {
  updatePlayerParameters(player1, 'player1');
  updatePlayerParameters(player2, 'player2');
  server.setUpdateRate(updateNumberFromUI(server.updateRate, 'server_fps'));
  return true;
}

export function updatePlayerParameters(client, prefix) {
  client.lag = updateNumberFromUI(client.lag, `${prefix}_lag`);

  const cbPrediction = element(`${prefix}_prediction`);
  const cbReconciliation = element(`${prefix}_reconciliation`);

  // Client Side Prediction disabled => disable Server Reconciliation.
  if (client.clientSidePrediction && !cbPrediction.checked) {
    cbReconciliation.checked = false;
  }

  // Server Reconciliation enabled => enable Client Side Prediction.
  if (!client.serverReconciliation && cbReconciliation.checked) {
    cbPrediction.checked = true;
  }

  client.clientSidePrediction = cbPrediction.checked;
  client.serverReconciliation = cbReconciliation.checked;

  client.entityInterpolation = element(`${prefix}_interpolation`).checked;
}

export function updateNumberFromUI(oldValue, elementId) {
  const input = element(elementId);
  let newValue = parseInt(input.value, 10);
  if (Number.isNaN(newValue)) {
    newValue = oldValue;
  }
  input.value = newValue;
  return newValue;
}

document.body.onkeydown = keyHandler;
document.body.onkeyup = keyHandler;

// Setup a server, the player's client, and another player.
const server = new Server(element('server_canvas'), element('server_status'), new LagNetwork());
const player1 = new Client(element('player1_canvas'), element('player1_status'), new LagNetwork());
const player2 = new Client(element('player2_canvas'), element('player2_status'), new LagNetwork());

// Connect the clients to the server.
server.connect(player1);
server.connect(player2);

// Read initial parameters from the UI.
updateParameters(player1, player2, server);

element('server_fps').onchange = updateParameters;
element('player1_lag').onchange = updateParameters;
element('player1_prediction').onchange = updateParameters;
element('player1_reconciliation').onchange = updateParameters;
element('player1_interpolation').onchange = updateParameters;
element('player2_lag').onchange = updateParameters;
element('player2_prediction').onchange = updateParameters;
element('player2_reconciliation').onchange = updateParameters;
element('player2_interpolation').onchange = updateParameters;

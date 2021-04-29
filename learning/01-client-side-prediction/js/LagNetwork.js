/**
 * A message queue with simulated network lag.
 */
class LagNetwork {
  constructor(messages = []) {
    this.messages = messages;
  }

  /* "Send" a message. Store each message with the timestamp when it should be
     received, to simulate lag.
  */
  send(lagInMs, message) {
    this.messages.push({
      recvTs: +new Date() + lagInMs,
      payload: message,
    });
  }

  /**
   * Returns a "received" message or undefined if there are no messages available yet.
   */
  receive() {
    const now = +new Date();
    for (let i = 0; i < this.messages.length; i += 1) {
      const message = this.messages[i];
      if (message.recvTs <= now) {
        this.messages.splice(i, 1);
        return message.payload;
      }
    }
    return null;
  }
}

export default LagNetwork;

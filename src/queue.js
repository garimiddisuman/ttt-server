export class GameQueue {
  #pairs;
  #peakCounter;

  constructor() {
    this.#pairs = [];
    this.#peakCounter = 0;
  }

  #isPaired(position) {
    const node = this.#pairs.at(position);
    return !node || node.players.length === 2;
  }

  #generateGameId() {
    return Date.now();
  }

  #createPair() {
    const gameID = this.#generateGameId();
    this.#pairs.push({ gameID, players: [] });
  }

  enqueue(player) {
    if (this.#isPaired(-1)) {
      this.#createPair();
    }

    const rare = this.#pairs.at(-1);
    rare.players.push(player);
    return rare.gameID;
  }

  #dequeue() {
    this.#pairs.shift();
  }

  peak() {
    if (!this.#isPaired(0)) return null;

    const head = this.#pairs.at(0) || null;
    this.#peakCounter += 1;

    if (this.#peakCounter === 2) {
      this.#peakCounter = 0;
      this.#dequeue();
    }

    return head;
  }
}

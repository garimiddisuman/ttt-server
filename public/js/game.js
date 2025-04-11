class Game {
  constructor(gridSelector, playerSelector) {
    this.gridSelector = gridSelector;
    this.playerSelector = playerSelector;
    this.isPlayerTurn = null;
  }

  #updateCurrentPlayer(currentPlayer) {
    const currentPlayerElement = document.querySelector(this.playerSelector);
    currentPlayerElement.textContent = `Current Player : ${currentPlayer}`;
  }

  #updateBoardUI(board) {
    const boardCells = document.querySelectorAll(".cell");
    const flatBoard = board.flat();

    boardCells.forEach((cell, index) => {
      cell.textContent = flatBoard[index];
    });
  }

  async #fetchGameState() {
    const response = await fetch("/game/state");
    return await response.json();
  }

  async refresh() {
    const gameState = await this.#fetchGameState();
    const { curPlayer, board, turn, isGameOver } = gameState;

    this.#updateCurrentPlayer(curPlayer);
    this.#updateBoardUI(board);
    this.isPlayerTurn = turn;

    if (isGameOver) {
      globalThis.location = "/game/over";
    }

    return { isGameOver };
  }

  #startPollingUntilTurn() {
    const pollingTimerId = setTimeout(async () => {
      const { isGameOver } = await this.refresh();

      if (isGameOver || this.isPlayerTurn) {
        clearTimeout(pollingTimerId);
        return;
      }

      return this.#startPollingUntilTurn();
    }, 1000);
  }

  async #handleCellMark(event) {
    if (event.target.classList.contains("cell")) {
      const [_, row, col] = event.target.className.split(" ");
      const formData = new FormData();
      formData.set("row", +row);
      formData.set("col", +col);

      await fetch("/game/move", { method: "POST", body: formData });
      const { isGameOver } = await this.refresh();

      if (!isGameOver) {
        this.#startPollingUntilTurn();
      }
    }
  }

  async init() {
    const { isGameOver } = await this.refresh();

    if (!this.isPlayerTurn && !isGameOver) this.#startPollingUntilTurn();

    const gameBoard = document.querySelector(this.gridSelector);
    gameBoard.addEventListener("click", (event) => this.#handleCellMark(event));
  }
}

const main = () => {
  const game = new Game("#grid", "#current-player");
  game.init();
};

globalThis.onload = main;

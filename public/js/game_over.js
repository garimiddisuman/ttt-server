const fetchWinningStats = async () => {
  const response = await fetch("/game/result");
  return await response.json();
};

const renderGameStats = (isDraw, winner) => {
  const result = document.querySelector("#result");

  if (isDraw) {
    result.textContent = "Draw ....!";
    return;
  }

  result.textContent = `Congratulations ${winner} ...!`;
};

const handleExit = async () => {
  const response = await fetch("/game/exit");

  if (response.ok) {
    globalThis.location = "/";
  }
};

const handleReplay = async () => {
  const respone = await fetch("/game/replay");

  if (respone.ok) {
    globalThis.location = "/html/waiting.html";
  }
};

const main = async () => {
  const { isDraw, winner } = await fetchWinningStats();
  renderGameStats(isDraw, winner);

  const replay = document.querySelector("#replay");
  const exit = document.querySelector("#exit");
  exit.addEventListener("click", handleExit);
  replay.addEventListener("click", handleReplay);
};

globalThis.onload = main;

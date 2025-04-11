import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { TicTacToe } from "./ttt.js";

const getRegisteredPlayer = (ctx) => {
  const { playerRegistry } = ctx.get("gameInfo");
  const { playerID } = getCookie(ctx);

  return playerRegistry.get(+playerID);
};

export const handlePlayerExit = (ctx) => {
  const { playerRegistry } = ctx.get("gameInfo");
  const { playerID } = getCookie(ctx);
  playerRegistry.delete(+playerID);
  deleteCookie(ctx, "playerID");

  return ctx.text("player exited!");
};

export const handleReplayRequest = (ctx) => {
  const playerData = getRegisteredPlayer(ctx);
  const { gameQueue } = ctx.get("gameInfo");
  delete playerData.ttt;
  playerData.gameID = gameQueue.enqueue(playerData.player);

  return ctx.text("player waiting...");
};

export const fetchGameResult = (ctx) => {
  const { ttt } = getRegisteredPlayer(ctx);
  const isDraw = ttt.isDraw();
  const winner = ttt.getWinner();

  return ctx.json({ isDraw, winner });
};

export const processPlayerMove = async (ctx) => {
  const { row, col } = await ctx.req.parseBody();
  const { ttt, player } = getRegisteredPlayer(ctx);
  const isValidMark = ttt.getCurrentPlayer() === player;

  if (isValidMark) {
    ttt.mark(row, col);
    return ctx.text("cell marked");
  }

  return ctx.text("invalid cell", 400);
};

export const fetchGameState = (ctx) => {
  const { player, ttt } = getRegisteredPlayer(ctx);
  const board = ttt.getBoard();
  const curPlayer = ttt.getCurrentPlayer();
  const turn = player === curPlayer;
  const isGameOver = ttt.isGameOver();

  return ctx.json({ board, curPlayer, turn, isGameOver });
};

export const fetchPlayername = (ctx) => {
  const { player } = getRegisteredPlayer(ctx);

  return ctx.json({ playername: player });
};

const initializeGameInstance = (matchData, playerRegistry) => {
  const ttt = new TicTacToe(...matchData.players);

  for (const [_, player] of playerRegistry) {
    if (player.gameID === matchData.gameID) {
      player.ttt = ttt;
    }
  }
};

export const matchPlayers = (ctx) => {
  const { gameQueue, playerRegistry } = ctx.get("gameInfo");
  const matchData = gameQueue.peak();
  const isMatchFound = Boolean(matchData);
  const { playerID } = getCookie(ctx);
  const hasGameInstanceCreated = playerRegistry.get(+playerID).ttt;

  if (isMatchFound && !hasGameInstanceCreated) {
    initializeGameInstance(matchData, playerRegistry);
  }

  return ctx.json({ isMatchFound });
};

export const handlePlayerJoin = async (ctx) => {
  const { gameQueue, playerRegistry } = ctx.get("gameInfo");
  const { player } = await ctx.req.parseBody();
  const gameID = gameQueue.enqueue(player);
  const playerID = Date.now();
  playerRegistry.set(playerID, { gameID, player });
  setCookie(ctx, "playerID", playerID);

  return ctx.redirect("/html/waiting.html", 303);
};

import { assertEquals, assertFalse } from "assert";
import { describe, it } from "testing";
import { GameQueue } from "../src/queue.js";
import { createApp } from "../src/app.js";
import { TicTacToe } from "../src/ttt.js";

describe("serveStatic", () => {
  const headers = { Cookie: "playerID=1" };
  const playerRegistry = new Map([[1, { player: "suman", gameId: 1 }]]);

  it("Should respond with ok and home page", async () => {
    const app = createApp({ playerRegistry });

    const response = await app.request("/", { headers });
    const _text = await response.text();
    assertEquals(response.status, 200);
    const contentType = response.headers.get("content-type");
    assertEquals(contentType, "text/html; charset=utf-8");
  });
});

describe("fetchusername", () => {
  const headers = { Cookie: "playerID=1" };
  const playerRegistry = new Map([[1, { player: "suman", gameId: 1 }]]);

  it("Should respond with playername in json", async () => {
    const app = createApp({ playerRegistry });

    const response = await app.request("/playername", { headers });

    const { playername } = await response.json();
    assertEquals(response.status, 200);
    const contentType = response.headers.get("content-type");
    assertEquals(contentType, "application/json");
    assertEquals(playername, "suman");
  });
});

describe("matchPlayers", () => {
  const headers = { Cookie: "playerID=1" };
  const playerRegistry = new Map([[1, { player: "suman", gameId: 1 }]]);

  it("Should respond with false when there is no player", async () => {
    const gameQueue = new GameQueue();
    const app = createApp({ gameQueue, playerRegistry });
    const response = await app.request("/findMatch", { headers });
    const { isMatchFound } = await response.json();

    assertEquals(response.status, 200);
    const contentType = response.headers.get("content-type");
    assertEquals(contentType, "application/json");
    assertFalse(isMatchFound);
  });

  it("Should respond with true when there are 2 players", async () => {
    const gameQueue = new GameQueue();
    const app = createApp({ gameQueue, playerRegistry });
    const fd = new FormData();
    fd.set("player", "suman");

    await app.request("/join", { method: "POST", body: fd });
    const response = await app.request("/findMatch", { headers });

    assertEquals(response.status, 200);
    const contentType = response.headers.get("content-type");
    assertEquals(contentType, "application/json");
    assertEquals(playerRegistry.size, 2);
  });
});

describe("handlePlayerJoin", () => {
  const headers = { Cookie: "playerID=1" };
  const playerRegistry = new Map([[1, { player: "suman", gameId: 1 }]]);

  it("Should respond with 303 status code when it redirects", async () => {
    const gameQueue = new GameQueue();
    const app = createApp({ gameQueue, playerRegistry });
    const response = await app.request("/join", { method: "POST", headers });

    assertEquals(response.status, 303);
  });
});

describe("processPlayerMove", () => {
  const headers = { Cookie: "playerID=1" };
  const ttt = new TicTacToe("a", "b");

  it("Should return with status ok for current player", async () => {
    const playerRegistry = new Map([[1, { player: "a", gameId: 1, ttt }]]);
    const gameQueue = new GameQueue();
    const app = createApp({ gameQueue, playerRegistry });

    const fd = new FormData();
    fd.set("row", 0);
    fd.set("col", 1);

    const res = await app.request("/game/move", {
      method: "POST",
      body: fd,
      headers,
    });
    const text = await res.text();
    assertEquals(text, "cell marked");
    assertEquals(res.status, 200);
  });

  it("Should return with status 404 for not current player", async () => {
    const playerRegistry = new Map([[1, { player: "a", gameId: 1, ttt }]]);
    const gameQueue = new GameQueue();
    const app = createApp({ gameQueue, playerRegistry });

    const fd = new FormData();
    fd.set("row", 1);
    fd.set("col", 1);

    const res = await app.request("/game/move", {
      method: "POST",
      body: fd,
      headers,
    });
    const text = await res.text();
    assertEquals(text, "invalid cell");
    assertEquals(res.status, 400);
  });
});

describe("fetchGameState", () => {
  const headers = { Cookie: "playerID=1" };
  const playerRegistry = new Map([
    [1, { player: "suman", gameId: 1, ttt: new TicTacToe() }],
  ]);

  it("Should return with status ok", async () => {
    const gameQueue = new GameQueue();
    const app = createApp({ gameQueue, playerRegistry });

    const res = await app.request("/game/state", { headers });
    const actual = await res.json();
    assertEquals(typeof actual, "object");
    assertEquals(res.status, 200);
  });
});

describe("fetchGameState", () => {
  const headers = { Cookie: "playerID=1" };
  const playerRegistry = new Map([
    [1, { player: "suman", gameId: 1, ttt: new TicTacToe() }],
  ]);

  it("Should return game result with json", async () => {
    const gameQueue = new GameQueue();
    const app = createApp({ gameQueue, playerRegistry });

    const response = await app.request("/game/result", { headers });
    const actual = await response.json();
    assertEquals(typeof actual, "object");
    assertFalse(actual.isDraw);
    assertEquals(response.status, 200);
  });
});

describe("handleReplayRequest", () => {
  const headers = { Cookie: "playerID=1" };
  const playerRegistry = new Map([
    [1, { player: "suman", gameId: 1, ttt: new TicTacToe() }],
  ]);

  it("Should return with ok and shouldn't remove cookie", async () => {
    const gameQueue = new GameQueue();
    const app = createApp({ gameQueue, playerRegistry });
    const response = await app.request("/game/replay", { headers });
    const actual = await response.text();

    assertEquals(playerRegistry.size, 1);
    assertEquals(actual, "player waiting...");
    assertEquals(response.status, 200);
  });
});

describe("handlePlayerExit", () => {
  const headers = { Cookie: "playerID=1" };
  const playerRegistry = new Map([
    [1, { player: "suman", gameId: 1, ttt: new TicTacToe() }],
  ]);

  it("Should return with ok and removes the cookie", async () => {
    const gameQueue = new GameQueue();
    const app = createApp({ gameQueue, playerRegistry });
    const response = await app.request("/game/exit", { headers });
    const actual = await response.text();

    assertEquals(playerRegistry.size, 0);
    assertEquals(actual, "player exited!");
    assertEquals(response.status, 200);
  });
});

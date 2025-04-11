import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/deno";
import { getCookie } from "hono/cookie";
import * as handlers from "./handlers.js";

const authentication = async (ctx, next) => {
  const { playerRegistry } = ctx.get("gameInfo");
  const { playerID } = getCookie(ctx);
  const publicRoutes = new Set(["/", "/assets/css/index.css", "/join"]);

  const isPlayerAuthorized =
    playerRegistry.has(+playerID) || publicRoutes.has(ctx.req.path);

  if (!isPlayerAuthorized) return ctx.redirect("/", 303);

  return await next();
};

const injectContext = (context) => {
  return async (ctx, next) => {
    ctx.set("gameInfo", context);
    return await next();
  };
};

// move game fn into seperate file
const game = () => {
  const app = new Hono();
  app.get("/", serveStatic({ path: "public/html/game.html" }));
  app.get("/state", handlers.fetchGameState);
  app.get("/over", serveStatic({ path: "public/html/game_over.html" }));
  app.post("/move", handlers.processPlayerMove);
  app.get("/result", handlers.fetchGameResult);
  app.get("/replay", handlers.handleReplayRequest);
  app.get("/exit", handlers.handlePlayerExit);

  return app;
};

export const createApp = (context) => {
  const app = new Hono();

  app.use(logger());
  app.use(injectContext(context));
  app.use(authentication);

  app.route("/game", game());

  app.get("/findMatch", handlers.matchPlayers);
  app.get("/playername", handlers.fetchPlayername);
  app.post("/join", handlers.handlePlayerJoin);

  app.get("*", serveStatic({ root: "public" }));

  return app;
};

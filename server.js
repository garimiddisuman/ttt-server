import { createApp } from "./src/app.js";
import { GameQueue } from "./src/queue.js";
import "jsr:@std/dotenv/load";

const main = () => {
  const gameQueue = new GameQueue();
  const playerRegistry = new Map();

  const app = createApp({ gameQueue, playerRegistry });
  const port = Deno.env.get("PORT") || 3000;

  Deno.serve({ port }, app.fetch);
};

main();

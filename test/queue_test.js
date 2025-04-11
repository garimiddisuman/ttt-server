import { assertEquals } from "assert";
import { describe, it } from "testing";
import { GameQueue } from "../src/queue.js";

describe("peak", () => {
  const queue = new GameQueue();

  it("Should return null if there are no pairs", () => {
    assertEquals(queue.peak(), null);
  });

  it("Should return null if there is a single palyer in the head", () => {
    queue.enqueue("a");
    assertEquals(queue.peak(), null);
  });

  it("Should return pairs if there is a pair in the head", () => {
    queue.enqueue("b");
    const actual = queue.peak();

    assertEquals(typeof actual.gameID, "number");
    assertEquals(typeof actual, "object");
    assertEquals(actual.players, ["a", "b"]);
  });
});

describe("enqueue", () => {
  const queue = new GameQueue();

  it("Should return gameId when new player adds", () => {
    const actual = queue.enqueue("a");
    assertEquals(typeof actual, "number");
  });
});

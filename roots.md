## Login routes / Setting cookies

| Method | Route       | Purpose                   | status | response-content         |
| ------ | ----------- | ------------------------- | ------ | ------------------------ |
| GET    | /           | Display Homepage to join  | 200    | html home page           |
| POST   | /join       | To store player name      | 200    | html waiting page        |
| GET    | /findMatch  | To match players          | 200    | json contains boolean    |
| GET    | /playername | To get waiting playername | 200    | json contains playername |

## Game routes

| Method | Route        | Purpose                   | status | response-content      |
| ------ | ------------ | ------------------------- | ------ | --------------------- |
| GET    | /game        | Display game board        | 200    | html game page        |
| POST   | /game/move   | To mark move              | 201    | ----                  |
| GET    | /game/state  | To get game state         | 200    | json                  |
| GET    | /game/over   | To give gameover status   | 303    | redirect("/game/over) |
| GET    | /game/result | To get game winning state | 200    | json                  |
| GET    | /game/replay | To play again             | 200    | json                  |
| GET    | /game/exit   | To exit from game         | 200    | json                  |

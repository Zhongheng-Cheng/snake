# snake

Just a snake game : )

### Algorithms

- **A\* Pathfinding Algorithm**:
  - **Purpose**: Allows the snake to calculate the shortest and safest path to the food.
  - **Implementation**: Combines heuristic-based searching (to predict distances) with Dijkstra's algorithm (to ensure the shortest path), prioritizing nodes based on estimated costs to reach the goal and known path costs.
- **Heuristic Function**:
  - **Manhattan Distance**: Used to estimate the distance from any point on the grid to the food, influencing the decision-making process in path selection.
- **Deadlock Detection and Resolution**:
  - **Strategy**: Implements checks to detect potential deadlocks early and alter the snake's path to prevent game-ending scenarios.
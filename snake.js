const gameArea = document.getElementById('gameArea');
const gridSize = 20;
const gameSize = 500;
let snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }];
let food = { x: 300, y: 300 };
let velocity = { x: 20, y: 0 };

function setup() {
    document.querySelectorAll('.snake').forEach(e => e.remove());
    document.querySelectorAll('.food').forEach(e => e.remove());
    snake.forEach(segment => {
        let snakeElement = document.createElement('div');
        snakeElement.style.left = `${segment.x}px`;
        snakeElement.style.top = `${segment.y}px`;
        snakeElement.classList.add('snake');
        gameArea.appendChild(snakeElement);
    });
    let foodElement = document.createElement('div');
    foodElement.style.left = `${food.x}px`;
    foodElement.style.top = `${food.y}px`;
    foodElement.classList.add('food');
    gameArea.appendChild(foodElement);
}

function moveSnake() {
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        placeFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= gameSize || head.y < 0 || head.y >= gameSize || snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }];
        velocity = { x: 20, y: 0 };
        setup();
    }
}

function placeFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (gameSize / gridSize)) * gridSize;
        y = Math.floor(Math.random() * (gameSize / gridSize)) * gridSize;
    } while (snake.some(segment => segment.x === x && segment.y === y));
    food = { x, y };
    setup();
}

function findPath(start, goal) {
    const openSet = new Set([JSON.stringify(start)]);
    const cameFrom = new Map();

    const gScore = new Map();
    gScore.set(JSON.stringify(start), 0);

    const fScore = new Map();
    fScore.set(JSON.stringify(start), heuristic(start, goal));

    while (openSet.size > 0) {
        let current = [...openSet].reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);
        current = JSON.parse(current);

        if (current.x === goal.x && current.y === goal.y) {
            return reconstructPath(cameFrom, current);
        }

        openSet.delete(JSON.stringify(current));

        getNeighbors(current).forEach(neighbor => {
            if (isCollision(neighbor) || !isInBounds(neighbor)) return;

            const neighborKey = JSON.stringify(neighbor);
            const tentativeGScore = gScore.get(JSON.stringify(current)) + 1;

            if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                cameFrom.set(neighborKey, JSON.stringify(current));
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, gScore.get(neighborKey) + heuristic(neighbor, goal));

                if (!openSet.has(neighborKey)) {
                    openSet.add(neighborKey);
                }
            }
        });
    }

    return []; // Return an empty array if no path is found
}

function heuristic(a, b) {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(position) {
    return [
        { x: position.x + gridSize, y: position.y },
        { x: position.x - gridSize, y: position.y },
        { x: position.x, y: position.y + gridSize },
        { x: position.x, y: position.y - gridSize }
    ].filter(pos => isInBounds(pos) && !isCollision(pos));
}

function reconstructPath(cameFrom, current) {
    let totalPath = [current];
    while (cameFrom.has(JSON.stringify(current))) {
        current = JSON.parse(cameFrom.get(JSON.stringify(current)));
        totalPath.unshift(current);
    }
    return totalPath;
}

function updateVelocity() {
    let path = findPath(snake[0], food);
    if (path.length > 1) {
        velocity = { x: path[1].x - path[0].x, y: path[1].y - path[0].y };
    } else {
        avoidCollision();
    }
}

function avoidCollision() {
    let possibleDirections = [
        { x: gridSize, y: 0 }, { x: -gridSize, y: 0 },
        { x: 0, y: gridSize }, { x: 0, y: -gridSize }
    ].filter(dir => {
        let newPos = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        return !isCollision(newPos) && isInBounds(newPos);
    });

    possibleDirections.sort((a, b) => {
        let futurePosA = { x: snake[0].x + a.x, y: snake[0].y + a.y };
        let futurePosB = { x: snake[0].x + b.x, y: snake[0].y + b.y };
        return countAvailableSpace(futurePosB) - countAvailableSpace(futurePosA);
    });

    if (possibleDirections.length > 0) {
        velocity = { x: possibleDirections[0].x, y: possibleDirections[0].y };
    } else {
        velocity = { x: 0, y: 0 }; // or handle this scenario differently
    }
}

function countAvailableSpace(position) {
    let visited = new Set();
    let stack = [position];
    let count = 0;

    while (stack.length > 0) {
        let current = stack.pop();
        let key = `${current.x},${current.y}`;
        if (!visited.has(key) && isInBounds(current) && !isCollision(current)) {
            visited.add(key);
            count++;
            stack.push({ x: current.x + gridSize, y: current.y });
            stack.push({ x: current.x - gridSize, y: current.y });
            stack.push({ x: current.x, y: current.y + gridSize });
            stack.push({ x: current.x, y: current.y - gridSize });
        }
    }

    return count;
}

function isInBounds(position) {
    return position.x >= 0 && position.x < gameSize && position.y >= 0 && position.y < gameSize;
}

function isCollision(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y) || (position.x === snake[0].x && position.y === snake[0].y);
}

function gameLoop() {
    console.log('Game loop running...');
    updateVelocity();
    console.log(`Velocity: x=${velocity.x}, y=${velocity.y}`);
    moveSnake();
    checkCollision();
    setup();
    setTimeout(gameLoop, 100);
}

// 确保初始化函数在文档完全加载后被调用
document.addEventListener('DOMContentLoaded', function() {
    setup();
    gameLoop();
});
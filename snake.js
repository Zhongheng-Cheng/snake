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
    let openSet = [start];
    let cameFrom = new Map();
    let gScore = new Map();
    let fScore = new Map();

    gScore.set(start, 0);
    fScore.set(start, heuristic(start, goal));

    while (openSet.length > 0) {
        let current = openSet.reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);

        if (current.x === goal.x && current.y === goal.y) {
            return reconstructPath(cameFrom, current);
        }

        openSet = openSet.filter(item => item !== current);
        for (let neighbor of getNeighbors(current)) {
            if (isCollision(neighbor)) continue;
            let tentativeGScore = gScore.get(current) + 1;

            if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, gScore.get(neighbor) + heuristic(neighbor, goal));
                if (!openSet.some(elem => elem.x === neighbor.x && elem.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return [];
}

function heuristic(a, b) {
    // 使用曼哈顿距离作为启发函数
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(position) {
    // 获取四个可能的移动方向
    return [
        { x: position.x + gridSize, y: position.y },
        { x: position.x - gridSize, y: position.y },
        { x: position.x, y: position.y + gridSize },
        { x: position.x, y: position.y - gridSize }
    ].filter(pos => pos.x >= 0 && pos.x < gameSize && pos.y >= 0 && pos.y < gameSize);
}

function reconstructPath(cameFrom, current) {
    let totalPath = [current];
    while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        totalPath.unshift(current);
    }
    return totalPath;
}

function isCollision(position) {
    // 检查位置是否与蛇的身体重合
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

function updateVelocity() {
    let path = findPath(snake[0], food);
    if (path.length > 1) {
        velocity = { x: path[1].x - path[0].x, y: path[1].y - path[0].y };
    }
}

function gameLoop() {
    updateVelocity();
    moveSnake();
    checkCollision();
    setup();
    setTimeout(gameLoop, 100);
}


setup();
gameLoop();

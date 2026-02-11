export const GRID_SIZE = 20;

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function coordKey(point) {
  return `${point.x},${point.y}`;
}

function nextHead(head, direction) {
  const step = DIRECTIONS[direction];
  return { x: head.x + step.x, y: head.y + step.y };
}

function isWall(point, gridSize) {
  return point.x < 0 || point.y < 0 || point.x >= gridSize || point.y >= gridSize;
}

export function randomFoodCell(gridSize, snake, rng = Math.random) {
  const occupied = new Set(snake.map(coordKey));
  const free = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const point = { x, y };
      if (!occupied.has(coordKey(point))) free.push(point);
    }
  }

  if (free.length === 0) return null;
  const index = Math.floor(rng() * free.length);
  return free[index];
}

export function initialState(rng = Math.random) {
  const center = Math.floor(GRID_SIZE / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  return {
    gridSize: GRID_SIZE,
    snake,
    direction: "right",
    queuedDirection: "right",
    food: randomFoodCell(GRID_SIZE, snake, rng),
    score: 0,
    over: false,
  };
}

export function queueDirection(state, direction) {
  if (!DIRECTIONS[direction]) return state;
  if (OPPOSITES[state.direction] === direction) return state;
  return { ...state, queuedDirection: direction };
}

export function tick(state, rng = Math.random) {
  if (state.over) return state;

  const direction =
    OPPOSITES[state.direction] === state.queuedDirection
      ? state.direction
      : state.queuedDirection;

  const head = state.snake[0];
  const newHead = nextHead(head, direction);

  if (isWall(newHead, state.gridSize)) {
    return { ...state, direction, over: true };
  }

  const eating = state.food && newHead.x === state.food.x && newHead.y === state.food.y;
  const bodyToCheck = eating ? state.snake : state.snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some((cell) => cell.x === newHead.x && cell.y === newHead.y);

  if (hitsSelf) {
    return { ...state, direction, over: true };
  }

  const snake = [newHead, ...state.snake];
  if (!eating) snake.pop();

  const score = eating ? state.score + 1 : state.score;
  const food = eating ? randomFoodCell(state.gridSize, snake, rng) : state.food;

  return {
    ...state,
    snake,
    direction,
    queuedDirection: direction,
    food,
    score,
    over: food === null,
  };
}

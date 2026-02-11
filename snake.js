import { initialState, queueDirection, tick } from "./snake-logic.js";

const TICK_MS = 120;

function coordKey(point) {
  return `${point.x},${point.y}`;
}

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const pauseEl = document.getElementById("pause");
const restartEl = document.getElementById("restart");

let state = initialState();
let timer = null;
let isPaused = false;

function render() {
  boardEl.innerHTML = "";

  const snakeCells = new Set(state.snake.map(coordKey));
  const foodKey = state.food ? coordKey(state.food) : null;

  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      const cell = document.createElement("div");
      const key = `${x},${y}`;
      cell.className = "cell";
      if (snakeCells.has(key)) cell.classList.add("snake");
      if (foodKey === key) cell.classList.add("food");
      boardEl.appendChild(cell);
    }
  }

  scoreEl.textContent = `Score: ${state.score}`;
  if (isPaused && !state.over) {
    statusEl.textContent = "Paused. Press Space or Pause to resume.";
  } else if (state.over && state.food === null) {
    statusEl.textContent = "You win. Board is full. Press Restart.";
  } else if (state.over) {
    statusEl.textContent = "Game over. Press Restart.";
  } else {
    statusEl.textContent = "Use arrows or WASD to move.";
  }
  pauseEl.textContent = isPaused ? "Resume" : "Pause";
}

function startLoop() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (isPaused) {
      render();
      return;
    }
    state = tick(state);
    render();
    if (state.over) {
      clearInterval(timer);
      timer = null;
    }
  }, TICK_MS);
}

function restart() {
  state = initialState();
  isPaused = false;
  render();
  startLoop();
}

function togglePause() {
  if (state.over) return;
  isPaused = !isPaused;
  render();
}

function keyToDirection(key) {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return "up";
    case "arrowdown":
    case "s":
      return "down";
    case "arrowleft":
    case "a":
      return "left";
    case "arrowright":
    case "d":
      return "right";
    default:
      return null;
  }
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }
  const direction = keyToDirection(event.key);
  if (!direction) return;
  event.preventDefault();
  state = queueDirection(state, direction);
});

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    state = queueDirection(state, button.dataset.dir);
  });
});

pauseEl.addEventListener("click", togglePause);
restartEl.addEventListener("click", restart);

render();
startLoop();

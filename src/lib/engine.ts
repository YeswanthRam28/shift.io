export type Board = number[][];

export const GRID_SIZE = 4;

export const createEmptyGrid = (): Board => 
  Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

// Simple LCG PRNG for seeded generation
export class RNG {
  private state: number;
  
  constructor(seed: number) {
    this.state = seed ? seed : Math.floor(Math.random() * 2147483647);
  }

  next(): number {
    // glibc LCG
    this.state = (this.state * 1103515245 + 12345) % 2147483648;
    return this.state / 2147483648;
  }
}

export const spawnTile = (board: Board, rng?: RNG): Board => {
  const newBoard = board.map(row => [...row]);
  const emptyCells: [number, number][] = [];
  
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newBoard[r][c] === 0) {
        emptyCells.push([r, c]);
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const rInt = rng ? rng.next() : Math.random();
    const index = Math.floor(rInt * emptyCells.length);
    const [r, c] = emptyCells[index];
    
    const rVal = rng ? rng.next() : Math.random();
    const value = rVal < 0.9 ? 2 : 4;
    
    newBoard[r][c] = value;
    return newBoard;
  }
  
  return newBoard;
};

export const moveBoard = (board: Board, direction: 'up' | 'down' | 'left' | 'right'): { grid: Board, score: number, merged: boolean } => {
  let newGrid = board.map(row => [...row]);
  let score = 0;
  let hasChanged = false;

  const rotate = (g: Board) => {
    const rotated = createEmptyGrid();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        rotated[c][GRID_SIZE - 1 - r] = g[r][c];
      }
    }
    return rotated;
  };

  // Normalize to 'left' move
  let rotations = 0;
  if (direction === 'up') rotations = 3;
  if (direction === 'right') rotations = 2;
  if (direction === 'down') rotations = 1;

  for (let i = 0; i < rotations; i++) newGrid = rotate(newGrid);

  // Move left
  for (let r = 0; r < GRID_SIZE; r++) {
    let row = newGrid[r].filter(cell => cell !== 0);
    const newRow: number[] = [];
    
    for (let i = 0; i < row.length; i++) {
      if (i < row.length - 1 && row[i] === row[i + 1]) {
        newRow.push(row[i] * 2);
        score += row[i] * 2;
        i++;
        hasChanged = true;
      } else {
        newRow.push(row[i]);
      }
    }
    
    while (newRow.length < GRID_SIZE) newRow.push(0);
    
    if (JSON.stringify(newGrid[r]) !== JSON.stringify(newRow)) hasChanged = true;
    newGrid[r] = newRow;
  }

  // Rotate back
  for (let i = 0; i < (4 - rotations) % 4; i++) newGrid = rotate(newGrid);

  return { grid: newGrid, score, merged: hasChanged };
};

export const isGameOver = (board: Board): boolean => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) return false;
      if (c < GRID_SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
      if (r < GRID_SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
};

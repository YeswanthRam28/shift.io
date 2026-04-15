export type Grid = (number | null)[][];

export const GRID_SIZE = 4;

export const createEmptyGrid = (): Grid => 
  Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

export const spawnTile = (grid: Grid): Grid => {
  const newGrid = grid.map(row => [...row]);
  const emptyCells: [number, number][] = [];
  
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid[r][c] === null) {
        emptyCells.push([r, c]);
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  
  return newGrid;
};

export const moveGrid = (grid: Grid, direction: 'up' | 'down' | 'left' | 'right'): { grid: Grid, score: number, merged: boolean } => {
  let newGrid = grid.map(row => [...row]);
  let score = 0;
  let hasChanged = false;

  const rotate = (g: Grid) => {
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
    let row = newGrid[r].filter(cell => cell !== null) as number[];
    const newRow: (number | null)[] = [];
    
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
    
    while (newRow.length < GRID_SIZE) newRow.push(null);
    
    if (JSON.stringify(newGrid[r]) !== JSON.stringify(newRow)) hasChanged = true;
    newGrid[r] = newRow;
  }

  // Rotate back
  for (let i = 0; i < (4 - rotations) % 4; i++) newGrid = rotate(newGrid);

  return { grid: newGrid, score, merged: hasChanged };
};

export const isGameOver = (grid: Grid): boolean => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) return false;
      if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < GRID_SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
};

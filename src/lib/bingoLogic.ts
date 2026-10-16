import { BingoLetter, LETTER_RANGES } from '@/types/bingo';

/**
 * Generates an array of N unique random integers within [min, max] inclusive.
 */
function getRandomUnique(min: number, max: number, count: number): number[] {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) {
    pool.push(i);
  }
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/**
 * Generates a valid 5x5 Bingo Card:
 * - Col 0 (B): 5 numbers in 1–15
 * - Col 1 (I): 5 numbers in 16–30
 * - Col 2 (N): 4 numbers in 31–45, with center row 2 col 2 as 0 (FREE)
 * - Col 3 (G): 5 numbers in 46–60
 * - Col 4 (O): 5 numbers in 61–75
 * Returns a 5x5 2D array: card[row][col]
 */
export function generateBingoCard(): number[][] {
  const bCol = getRandomUnique(LETTER_RANGES.B[0], LETTER_RANGES.B[1], 5);
  const iCol = getRandomUnique(LETTER_RANGES.I[0], LETTER_RANGES.I[1], 5);
  const nCol = getRandomUnique(LETTER_RANGES.N[0], LETTER_RANGES.N[1], 4);
  const gCol = getRandomUnique(LETTER_RANGES.G[0], LETTER_RANGES.G[1], 5);
  const oCol = getRandomUnique(LETTER_RANGES.O[0], LETTER_RANGES.O[1], 5);

  const card: number[][] = Array(5)
    .fill(null)
    .map(() => Array(5).fill(0));

  for (let r = 0; r < 5; r++) {
    card[r][0] = bCol[r];
    card[r][1] = iCol[r];
    // Column N has center FREE at [2][2]
    if (r < 2) {
      card[r][2] = nCol[r];
    } else if (r === 2) {
      card[r][2] = 0; // FREE SPACE
    } else {
      card[r][2] = nCol[r - 1];
    }
    card[r][3] = gCol[r];
    card[r][4] = oCol[r];
  }

  return card;
}

/**
 * Creates default daubed matrix: all false except center [2][2] which is true (FREE)
 */
export function createInitialDaubedMatrix(): boolean[][] {
  const daubed: boolean[][] = Array(5)
    .fill(null)
    .map(() => Array(5).fill(false));
  daubed[2][2] = true; // FREE space is automatically marked
  return daubed;
}

export interface WinningPattern {
  name: string;
  type: 'row' | 'column' | 'diagonal' | 'corners' | 'blackout';
  cells: [number, number][]; // [row, col] coordinates
  numbers: number[];
}

export interface VerificationResult {
  hasBingo: boolean;
  winningPatterns: WinningPattern[];
  uncalledDaubs: number[];
  calledCount: number;
  totalDaubed: number;
}

/**
 * Verifies whether a card's daubed spots (or called numbers) form a legitimate BINGO!
 * A cell counts as active if it is either the FREE space (0) or has been both daubed AND called.
 */
export function verifyBingoCard(
  card: number[][],
  daubed: boolean[][],
  calledNumbers: number[]
): VerificationResult {
  const calledSet = new Set(calledNumbers);
  const winningPatterns: WinningPattern[] = [];
  const uncalledDaubs: number[] = [];

  let totalDaubed = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (daubed[r][c]) {
        totalDaubed++;
        const num = card[r][c];
        if (num !== 0 && !calledSet.has(num)) {
          uncalledDaubs.push(num);
        }
      }
    }
  }

  // Helper to test if a cell is validly marked (either FREE space or called)
  const isCellValid = (r: number, c: number): boolean => {
    const num = card[r][c];
    if (num === 0) return true; // Center FREE space
    return daubed[r][c] && calledSet.has(num);
  };

  // 1. Check all 5 Rows
  for (let r = 0; r < 5; r++) {
    let rowMatch = true;
    for (let c = 0; c < 5; c++) {
      if (!isCellValid(r, c)) {
        rowMatch = false;
        break;
      }
    }
    if (rowMatch) {
      winningPatterns.push({
        name: `Row ${r + 1}`,
        type: 'row',
        cells: [
          [r, 0],
          [r, 1],
          [r, 2],
          [r, 3],
          [r, 4],
        ],
        numbers: [card[r][0], card[r][1], card[r][2], card[r][3], card[r][4]],
      });
    }
  }

  // 2. Check all 5 Columns
  const letterMap: BingoLetter[] = ['B', 'I', 'N', 'G', 'O'];
  for (let c = 0; c < 5; c++) {
    let colMatch = true;
    for (let r = 0; r < 5; r++) {
      if (!isCellValid(r, c)) {
        colMatch = false;
        break;
      }
    }
    if (colMatch) {
      winningPatterns.push({
        name: `Column ${letterMap[c]}`,
        type: 'column',
        cells: [
          [0, c],
          [1, c],
          [2, c],
          [3, c],
          [4, c],
        ],
        numbers: [card[0][c], card[1][c], card[2][c], card[3][c], card[4][c]],
      });
    }
  }

  // 3. Diagonal \ (top-left to bottom-right)
  let diag1Match = true;
  for (let i = 0; i < 5; i++) {
    if (!isCellValid(i, i)) {
      diag1Match = false;
      break;
    }
  }
  if (diag1Match) {
    winningPatterns.push({
      name: 'Diagonal (Top-Left to Bottom-Right)',
      type: 'diagonal',
      cells: [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ],
      numbers: [card[0][0], card[1][1], card[2][2], card[3][3], card[4][4]],
    });
  }

  // 4. Diagonal / (top-right to bottom-left)
  let diag2Match = true;
  for (let i = 0; i < 5; i++) {
    if (!isCellValid(i, 4 - i)) {
      diag2Match = false;
      break;
    }
  }
  if (diag2Match) {
    winningPatterns.push({
      name: 'Diagonal (Top-Right to Bottom-Left)',
      type: 'diagonal',
      cells: [
        [0, 4],
        [1, 3],
        [2, 2],
        [3, 1],
        [4, 0],
      ],
      numbers: [card[0][4], card[1][3], card[2][2], card[3][1], card[4][0]],
    });
  }

  // 5. Four Corners
  if (isCellValid(0, 0) && isCellValid(0, 4) && isCellValid(4, 0) && isCellValid(4, 4)) {
    winningPatterns.push({
      name: 'Four Corners',
      type: 'corners',
      cells: [
        [0, 0],
        [0, 4],
        [4, 0],
        [4, 4],
      ],
      numbers: [card[0][0], card[0][4], card[4][0], card[4][4]],
    });
  }

  return {
    hasBingo: winningPatterns.length > 0,
    winningPatterns,
    uncalledDaubs,
    calledCount: calledNumbers.length,
    totalDaubed,
  };
}

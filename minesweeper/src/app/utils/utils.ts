export function IsValidPosition(i: number, j: number, board: number[][]) {
  if(i >= 0 && i < board.length) {
    if(j>= 0 && j < board[i].length) {
      return true;
    }
  }
  return false;
}

export function PrettyLog(board: number[][]) {
  console.log(board.map(a => a.join(' ')).join('\n'));
}

export function RandInt(high: number) {
  return Math.floor(Math.random() * high);
}
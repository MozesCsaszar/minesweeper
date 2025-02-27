This application is a recreation of the famous Minesweeper game, with added tools to combat the forced guesses that can arise in a game. It is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The game is also hosted on [GitHub Pages](https://pages.github.com/), so feel free to try it out by clicking [here](https://mozescsaszar.github.io/minesweeper/).

## Features
This implementation of Minesweeper allows the user to play on five different preset difficulty levels, which change the size and mine density of the game: beginner, intermediate, expert, master and grandmaster. Additionally, the game parameters can be customized in the "custom" difficulty mode.

The game supports the standard operations: 
* Opening cells by left clicking on any one of them.
* Flagging a cell as a mine with a right-click.
* Chording by clicking on an opened cell with a number on it to open all surrounding cells that are not flagged if there are exactly as many cells flagged as the number of the field chorded. The cells that would potentially be opened are signified by an animation when holding down the chording.
* The number of flags remaining is displayed on the upper left part of the board.
* A timer is present in the upper right part of the board, measuring time spent on the current game from the first click in seconds. 
* A new game can be generated with the button between the flag counter and the timer. 

Additionally, the game supports the following two features to combat randomness: guessing and flag guessing and a few quality of life ones:
* Guessing allows the user to click on any cell. If it contains a mine, it will be flagged, otherwise it will be opened. This guarantees that a move will not result in a loss, no matter what the content of the cell is. It should be used to advance the board state when there are no more moves for which the result can be inferred by logic. To use this tool, click the checkbox next to the "Guesses" label, on the top left corner of the map. This will use up one charge of the ability on the next click on a cell to be opened. To see the remaining charges, look at the number on the right of the checkbox.
* Flag guessing allows the user to click on a cell that has been flagged as a mine. If the cell does not contain a mine, the game is lost. Otherwise, a number will appear on the flag that shows the number of mines in the 8 cells surrounding the flagged cell (the cell itself is excluded). This tool is useful when a flag guess results in unambiguously revealing the state of a cell, or when cell counting is performed. Chording is also supported on flags that have already been guessed (contain a number). Simply click on them to chord the neighboring cells as normal. Each use on a non-guessed flagged cell removes one charge of the tool. To see the remaining charges, look at the number on the right of the checkbox.
* Opening of all four corner cells with a right-click on the regenerate game button. 
* The four corners of the game are guaranteed to not contain mines.
* To cancel any started cell operation by holding down a mouse button, simply move the mouse away from the cell where the operation was started before releasing the mouse button.

## Getting Started Locally
First, clone the git repository:
```bash
git clone https://github.com/MozesCsaszar/minesweeper.git
```

Open the minesweeper folder from the cloned repo, then install the npm dependencies: 
```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000/minesweeper](http://localhost:3000/minesweeper) with a browser to access the website.

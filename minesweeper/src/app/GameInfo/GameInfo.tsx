import React, { FC, useEffect, useState } from 'react';
import styles from './GameInfo.module.css';
import { openCorners, regenerateGame } from '../reducers/gameSlice';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';
import { createTooltip } from '../utils/componentGenerators';
import { Button } from '@mui/material';


const mapState = (state: RootState) => ({
  mines_remaining: state.game.mines_remaining,
  lost: state.game.lost,
  won: state.game.won,
  mines: state.game.mines,
  rows: state.game.rows,
  cols: state.game.cols,
  guesses: state.game.guesses,
  flagGuesses: state.game.flagGuesses,
  movesMade: state.game.movesMade
})

const mapDispatch = {
  regenerateGame, openCorners
}

const connector = connect(mapState, mapDispatch);


const GameInfo: FC<ConnectedProps<typeof connector>> = (props) => {
  function padValue(value: number, len: number) {
    const s: string = String(value);
    const l = len - s.length;
    return '0'.repeat(l < 0 ? 0 : l) + s;
  }

  const [time, setTime] = useState(0);

  const padLenght = 4;
  const gameEnded = props.won || props.lost;
  const noMovesMade = props.movesMade == 0;

  // count the time
  useEffect(() => {
    if (!gameEnded) {
      if (!noMovesMade) {
        let t = 0;
        const int = setInterval(() => {
          t++;
          setTime(t);
        },
          1000
        );

        return () => { clearInterval(int) };
      }
      else {
        setTime(0);
      }
    }
    else if (noMovesMade) {
      setTime(0);
    }
  }, [noMovesMade, gameEnded])

  return (
    <div className={styles.GameInfo}>
      {createTooltip('The number of flags left to be placed.',
        <div className={styles.MinesRemaining}>{padValue(props.mines_remaining, padLenght)}</div>, 'bottom', 650)}
      {createTooltip('This button can be used to regenerate the game. Alternatively, the middle mouse button can be pressed anywhere on the game for the same purpose.' +
        ' To open all 4 corners on the board, right-click it. It also displays the current state of the game. If the button shows the text "Defeat",' +
        ' the game is lost. If the text is "Victory", then it is won. Otherwise, the game is still in progress.',
        <Button className={`${styles.Regenerate} Button`}
          onContextMenu={() => props.openCorners()}
          onClick={() => props.regenerateGame(undefined)}>
          {props.lost ? 'Defeat' : (props.won ? 'Victory' : '⭮')}
        </Button>,
        'bottom', 650
      )}
      {createTooltip('The timer of the game. This shows the number of seconds elapsed from the first move made until the game ended or now, if it is still in progress.',
        <div className={styles.Timer}>{padValue(time, padLenght)}</div>, 'bottom', 650)}
    </div>
  );
}

export default connector(GameInfo);

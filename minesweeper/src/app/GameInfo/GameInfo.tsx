import React, { FC, useEffect, useState } from 'react';
import styles from './GameInfo.module.css';
import { GameParams, generateGame, openCorners } from '../reducers/gameSlice';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';
import { createTooltip } from '../utils/componentGenerators';


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
  generateGame, openCorners
}

const connector = connect(mapState, mapDispatch);


interface GameInfoProps extends ConnectedProps<typeof connector> {

}

const GameInfo: FC<GameInfoProps> = (props) => {
  function padValue(value: number, len: number) {
    let s: string = String(value);
    let l = len - s.length;
    return '0'.repeat(l < 0 ? 0 : l) + s;
  }

  const [time, setTime] = useState(0);

  const padLenght = 4;
  const gameEnded = props.won || props.lost;

  // count the time
  useEffect(() => {
    if (!gameEnded) {
      if (props.movesMade != 0) {
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
    else if (props.movesMade == 0) {
      setTime(0);
    }
  }, [props.movesMade == 0, gameEnded])

  return (
    <div className={styles.GameInfo}>
      {createTooltip('The number of flags left to be placed.',
        <div className={styles.MinesRemaining}>{padValue(props.mines_remaining, padLenght)}</div>, 'bottom')}
      {createTooltip('This button can be used to regenerate the game. To open all 4 corners on the board, right-click it. It also displays the current state of the game. If the button shows the text "Defeat", the game is lost. If the text is "Victory", then it is won. Otherwise, the game is still in progress.',
        <button className={`${styles.Regenerate} Button`}
          onContextMenu={() => props.openCorners({})}
          onClick={() => props.generateGame({ rows: props.rows, cols: props.cols, mines: props.mines, flagGuesses: props.flagGuesses, guesses: props.guesses })}>
          {props.lost ? 'Defeat' : (props.won ? 'Victory' : '⭮')}
        </button>,
        'bottom'
      )}
      {createTooltip('The timer of the game. This shows the number of seconds elapsed from the first move made until the game ended or now, if it is still in progress.',
        <div className={styles.Timer}>{padValue(time, padLenght)}</div>, 'bottom')}
    </div>
  );
}

export default connector(GameInfo);

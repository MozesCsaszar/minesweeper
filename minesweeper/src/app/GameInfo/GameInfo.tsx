import React, { FC } from 'react';
import styles from './GameInfo.module.css';
import { GameParams, generateGame, openCorners } from '../reducers/gameSlice';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';


const mapState = (state: RootState) => ({
  mines_remaining: state.game.mines_remaining,
  lost: state.game.lost,
  won: state.game.won,
  mines: state.game.mines,
  rows: state.game.rows,
  cols: state.game.cols,
  guesses: state.game.flagGuesses,
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

  const padLenght = 4;

  return (
    <div className={styles.GameInfo}>
      <div className={styles.MinesRemaining}>{padValue(props.mines_remaining, padLenght)}</div>
      <button className={`${styles.Regenerate} Button`}
        onContextMenu={() => props.openCorners({})}
        onClick={() => props.generateGame({ rows: props.rows, cols: props.cols, mines: props.mines, flagGuesses: 3, guesses: 1 })}>
        {props.lost ? 'Defeat' : (props.won ? 'Victory' : '⭮')}
      </button>
      <div className={styles.Timer}>{padValue(0, padLenght)}</div>
    </div>
  );
}

export default connector(GameInfo);

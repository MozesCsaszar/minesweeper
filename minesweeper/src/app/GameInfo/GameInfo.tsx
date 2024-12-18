import React, { FC } from 'react';
import styles from './GameInfo.module.css';
import { GameState } from '../page';

interface GameInfoProps {
  regenerate: Function,
  openCorners: Function,
  gameState: GameState

}

const GameInfo: FC<GameInfoProps> = ({ openCorners, regenerate, gameState }) => {
  function padValue(value: number, len: number) {
    let s: string = String(value);
    let l = len - s.length;
    return '0'.repeat(l < 0 ? 0 : l) + s;
  }

  const padLenght = 4;

  return (
    <div className={styles.GameInfo}>
      <div className={styles.MinesRemaining}>{padValue(gameState.mines_remaining, padLenght)}</div>
      <button className={`${styles.Regenerate} Button`} onContextMenu={() => openCorners()} onClick={() => { regenerate() }}>{gameState.lost ? 'Defeat' : (gameState.won ? 'Victory' : '⭮')}</button>
      <div className={styles.Timer}>{padValue(0, padLenght)}</div>
    </div>
  );
}

export default GameInfo;

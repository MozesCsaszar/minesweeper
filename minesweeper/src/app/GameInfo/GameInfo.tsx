import React, { FC } from 'react';
import styles from './GameInfo.module.css';
import { GameState } from '../page';

interface GameInfoProps {
  regenerate: Function,
  gameState: GameState

}

const GameInfo: FC<GameInfoProps> = ({ regenerate, gameState }) => (
  <div className={styles.GameInfo}>
    <div className={styles.MinesRemaining}>{gameState.mines_remaining}</div>
    <button className={`${styles.Regenerate} Button`} onClick={() => { regenerate() }}>{gameState.lost ? 'Defeat' : (gameState.won ? 'Victory' : 'Regenerate')}</button>
    <div className={styles.Timer}>0</div>
  </div>
);

export default GameInfo;

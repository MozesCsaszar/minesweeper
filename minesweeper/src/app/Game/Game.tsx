'use client';

import React, { FC, useEffect } from 'react';
import Row from '../Row/Row';
import styles from './Game.module.css';
import GameInfo from '../GameInfo/GameInfo';
import BoardControl, { Difficulties } from '../BoardControl/BoardControl';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { chordField, flagField, generateGame, clickField, guessField, chordGuessedField, setChording, setOpening, resetOpeningChording, regenerateGame } from '../reducers/gameSlice';
import GameTools from '../GameTools/GameTools';

const mapState = (state: RootState) => ({
  game: state.game
})

const mapDispatch = {
  flagField, clickField, chordField,
  generateGame, guessField,
  chordGuessedField, setOpening, setChording,
  resetOpeningChording, regenerateGame
}

const connector = connect(mapState, mapDispatch);

const Game: FC<ConnectedProps<typeof connector>> = (props) => {
  function gameEnded() {
    return props.game.won || props.game.lost;
  }

  // initialize the game the first time around
  useEffect(() => {
    props.generateGame(Difficulties.beginner!)
  }, []);

  const rowElements = [];

  for (let i = 0; i < props.game.rows; i++) {
    rowElements.push(<Row key={`row-${i}`}
      guessedSlice={props.game.flagGuessed[i]} guessField={props.guessField} boardSlice={props.game.board[i]}
      chording={props.game.chording} opening={props.game.opening}
      hiddenSlice={props.game.hidden[i]} flaggedSlice={props.game.flagged[i]} gameEnded={gameEnded()}
      mistakesSlice={props.game.mistakes[i]} row={i} chordGuessedField={props.chordGuessedField}
      clickField={props.clickField} flagField={props.flagField} chordField={props.chordField}
      setOpening={props.setOpening} setChording={props.setChording}
    />)
  }

  // TODO: Style this a bit better
  return (
    <div className={`${styles.Game} flex flex-row h-[100%]`} onContextMenu={(e) => e.preventDefault()}
      onMouseUp={() => props.resetOpeningChording(undefined)} onAuxClick={(event) => { if (event.button === 1) { event.preventDefault(); props.regenerateGame(undefined); return false; } }}>
      {/* Controls and Tools */}
      <div className='Panel GameOptions flex flex-col basis-[200px] fixed z-10 p-1'>
        {<GameTools />}
        {<BoardControl />}
      </div>
      {/* Board */}
      <div className='flex flex-col relative left-[228px]'>
        {<GameInfo />}
        <div className={styles.Rows}>
          {rowElements}
        </div>
      </div>
    </div>
  );

}
export default connector(Game);

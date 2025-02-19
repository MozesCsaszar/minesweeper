'use client';

import React, { FC, useEffect } from 'react';
import Row from '../Row/Row';
import styles from './Game.module.css';
import * as _ from 'lodash';
import GameInfo from '../GameInfo/GameInfo';
import BoardControl from '../BoardControl/BoardControl';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { chordField, flagField, generateGame, clickField, guessField, chordGuessedField } from '../reducers/gameSlice';
import GameTools from '../GameTools/GameTools';

const mapState = (state: RootState) => ({
  game: state.game
})

const mapDispatch = {
  flagField, clickField, chordField,
  generateGame, guessField,
  chordGuessedField
}

const connector = connect(mapState, mapDispatch);

interface GameProps extends ConnectedProps<typeof connector> { }

const Game: FC<GameProps> = (props) => {
  function gameEnded() {
    return props.game.won || props.game.lost;
  }

  // initialize the game the first time around
  useEffect(() => {
    props.generateGame({
      rows: props.game.rows, cols: props.game.cols, mines:
        props.game.mines, flagGuesses: 3, guesses: 1
    })
  }, []);

  let rowElements = [];

  for (let i = 0; i < props.game.rows; i++) {
    rowElements.push(<Row key={`row-${i}`}
      guessedSlice={props.game.flagGuessed[i]} guessField={props.guessField} boardSlice={props.game.board[i]}
      hiddenSlice={props.game.hidden[i]} flaggedSlice={props.game.flagged[i]} gameEnded={gameEnded()}
      mistakesSlice={props.game.mistakes[i]} row={i} chordGuessedField={props.chordGuessedField}
      clickField={props.clickField} flagField={props.flagField} chordField={props.chordField}
    />)
  }

  // TODO: Style this a bit better
  return (
    <div onContextMenu={(e) => e.preventDefault()} className={`${styles.Game} flex flex-row`}>
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

import React, { ChangeEvent, FC } from 'react';
import styles from './NumericInput.module.css';

interface NumericInputProps {
  min: number,
  max: number,
  value: number,
  setValue: Function,
  label: string,
}

const NumericInput: FC<NumericInputProps> = ({ label, min, max, value, setValue }) => {
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    let v = Number(e.target.value);

    setValue(v);
  }

  return (
    <div className={styles.NumericInput}>
      <label>
        {`${label}: `}<input type='text' inputMode='numeric' name={label} value={value} onChange={handleInputChange}></input>
      </label>
    </div>
  );
}

export default NumericInput;

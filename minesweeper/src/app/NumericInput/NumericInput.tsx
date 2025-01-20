import React, { ChangeEvent, FC } from 'react';
import styles from './NumericInput.module.css';

interface NumericInputProps {
  min?: number,
  max?: number,
  value: number,
  setValue?: Function,
  label: string,
  disabled?: boolean
}

const NumericInput: FC<NumericInputProps> = ({ label, min, max, value, setValue, disabled }) => {
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    let v = Number(e.target.value);

    setValue?.(v);
  }

  return (
    <div className={`${styles.NumericInput} flex flex-row`}>
      <label>
        {`${label}: `}
      </label>
      <input className='ml-auto' disabled={disabled} type='text' inputMode='numeric' name={label} value={value} onChange={handleInputChange}></input>
    </div>
  );
}

export default NumericInput;

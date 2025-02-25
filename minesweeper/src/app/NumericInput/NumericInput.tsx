import React, { ChangeEvent, FC } from 'react';
import styles from './NumericInput.module.css';

interface NumericInputProps {
  value: number,
  setValue?: (s: string) => void,
  label: string,
  disabled?: boolean
}

const NumericInput: FC<NumericInputProps> = ({ label, value, setValue, disabled }) => {
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;

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

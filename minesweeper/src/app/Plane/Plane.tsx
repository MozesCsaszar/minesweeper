import React, { FC } from 'react';
import styles from './Plane.module.css';

interface PlaneProps {
  layer: number
}

const Plane: FC<PlaneProps> = () => (
  <div className={styles.Plane}>
    Plane Component
  </div>
);

export default Plane;

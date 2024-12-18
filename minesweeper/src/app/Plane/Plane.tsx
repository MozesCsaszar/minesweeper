import React, { FC } from 'react';
import styles from './Plane.module.css';

interface PlaneProps {}

const Plane: FC<PlaneProps> = () => (
  <div className={styles.Plane}>
    Plane Component
  </div>
);

export default Plane;

'use client';

import Game from "./Game/Game";
import * as _ from 'lodash';
import 'react';
import { StyledEngineProvider } from '@mui/material/styles';

export default function Home() {

  return (
    <StyledEngineProvider injectFirst>
      <Game />
    </StyledEngineProvider>
  );
}

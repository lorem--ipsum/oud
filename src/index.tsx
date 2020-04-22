import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Oud } from './app/app';
import registerServiceWorker from './registerServiceWorker';

import './index.css';

ReactDOM.render(
  <Oud deaf exampleIndex={4} width={200} height={200} />,
  document.getElementById('root') as HTMLElement,
);
registerServiceWorker();

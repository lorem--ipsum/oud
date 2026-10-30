import { createRoot } from 'react-dom/client';

import { Oud } from './app/app';

import './index.scss';

createRoot(document.getElementById('root') as HTMLElement).render(<Oud exampleIndex={window.location.hash ? undefined : 0} />);

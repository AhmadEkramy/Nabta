import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { fetchVersesFromAPI, populateCompleteQuran, populateCompleteQuranFull, populateQuranDatabase, testAPIResponse } from './utils/quranAPI';
import { seedQuranData } from './utils/seedQuranData';
import { testQuranFunctions } from './utils/testQuranFunctions';

// Make functions available globally for testing
(window as any).seedQuranData = seedQuranData;
(window as any).testQuranFunctions = testQuranFunctions;
(window as any).populateQuranDatabase = populateQuranDatabase;
(window as any).populateCompleteQuran = populateCompleteQuran;
(window as any).fetchVersesFromAPI = fetchVersesFromAPI;
(window as any).testAPIResponse = testAPIResponse;
(window as any).populateCompleteQuranFull = populateCompleteQuranFull;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

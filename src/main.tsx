import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { fetchVersesFromAPI, populateCompleteQuran, populateCompleteQuranFull, populateQuranDatabase, testAPIResponse } from './utils/quranAPI';
import { seedQuranData } from './utils/seedQuranData';
import { testQuranFunctions } from './utils/testQuranFunctions';
import { 
  populateBibleDatabase, 
  populateSampleBible, 
  fetchBibleVersesFromAPI, 
  fetchBibleChapter,
  addBibleVerseManually,
  uploadBibleVersesBatch,
  populateBibleWithArabic,
  uploadBibleFromJSONFiles,
  uploadBibleFromJSONData
} from './utils/bibleAPI';

// Make functions available globally for testing
(window as any).seedQuranData = seedQuranData;
(window as any).testQuranFunctions = testQuranFunctions;
(window as any).populateQuranDatabase = populateQuranDatabase;
(window as any).populateCompleteQuran = populateCompleteQuran;
(window as any).fetchVersesFromAPI = fetchVersesFromAPI;
(window as any).testAPIResponse = testAPIResponse;
(window as any).populateCompleteQuranFull = populateCompleteQuranFull;

// Make Bible functions available globally for console access
(window as any).populateBibleDatabase = populateBibleDatabase;
(window as any).populateSampleBible = populateSampleBible;
(window as any).fetchBibleVersesFromAPI = fetchBibleVersesFromAPI;
(window as any).fetchBibleChapter = fetchBibleChapter;
(window as any).addBibleVerseManually = addBibleVerseManually;
(window as any).uploadBibleVersesBatch = uploadBibleVersesBatch;
(window as any).populateBibleWithArabic = populateBibleWithArabic;
(window as any).uploadBibleFromJSONFiles = uploadBibleFromJSONFiles;
(window as any).uploadBibleFromJSONData = uploadBibleFromJSONData;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import { useContext } from 'react';
import { CircleContext } from '../contexts/CircleContext';

export function useCircle() {
  const context = useContext(CircleContext);
  if (context === undefined) {
    throw new Error('useCircle must be used within a CircleProvider');
  }
  return context;
}

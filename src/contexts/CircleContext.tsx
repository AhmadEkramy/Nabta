import React, { createContext, useState } from 'react';
import { Circle } from '../types';

interface CircleContextType {
  activeCircle: Circle | null;
  setActiveCircle: (circle: Circle | null) => void;
}

export const CircleContext = createContext<CircleContextType | undefined>(undefined);

export function CircleProvider({ children }: { children: React.ReactNode }) {
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);

  const value = {
    activeCircle,
    setActiveCircle,
  };

  return (
    <CircleContext.Provider value={value}>
      {children}
    </CircleContext.Provider>
  );
}



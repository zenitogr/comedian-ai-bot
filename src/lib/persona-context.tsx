import { createContext, useContext, ReactNode } from 'react';
import type { PersonaKey } from './personas';

interface PersonaContextType {
  currentPersona: PersonaKey;
  changePersona: (persona: PersonaKey) => void;
}

export const PersonaContext = createContext<PersonaContextType>({
  currentPersona: 'default',
  changePersona: () => {},
});

interface PersonaProviderProps {
  children: ReactNode;
  value: PersonaContextType;
}

export function PersonaProvider({ children, value }: PersonaProviderProps) {
  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
} 
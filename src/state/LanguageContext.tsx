import React, { createContext, useContext, useState } from 'react';
import { LANGUAGES, Language, LanguageCode } from '../domain/language';

interface LanguageContextValue {
  language: Language;
  setLanguageCode: (code: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState<LanguageCode>('TAMIL');
  const language = LANGUAGES.find((entry) => entry.code === code) ?? LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguageCode: setCode }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

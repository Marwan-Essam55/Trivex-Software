import { createContext, useContext, useEffect, type ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir', 'ltr');
    html.setAttribute('lang', 'en');
  }, []);

  return (
    <LanguageContext.Provider value={{ language: 'en', setLanguage: () => {} }}>
      {children}
    </LanguageContext.Provider>
  );
}

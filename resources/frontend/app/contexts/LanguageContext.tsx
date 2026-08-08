import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import idTranslations from '../locales/id.json';

// Top 20 Most Spoken Languages
export type LanguageCode = string;
export type LanguagePreference = string;

interface LanguageContextType {
  language: LanguagePreference;
  resolvedLanguage: LanguageCode;
  setLanguage: (lang: LanguagePreference) => void;
  translations: any;
  loading: boolean;
}

const SUPPORTED_LANGUAGES: LanguageCode[] = ['id', 'en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'ru', 'pt', 'ur', 'de', 'ja', 'tr', 'vi', 'ko', 'it', 'th', 'nl', 'pl'];

function detectSystemLanguage(): LanguageCode {
  const browserLang = navigator.language?.toLowerCase() || 'id';
  
  // Exact match first (e.g. 'ja', 'ko')
  const exact = SUPPORTED_LANGUAGES.find(l => browserLang === l);
  if (exact) return exact;

  // Prefix match (e.g. 'en-US' -> 'en', 'zh-CN' -> 'zh', 'pt-BR' -> 'pt')
  const prefix = browserLang.split('-')[0] as LanguageCode;
  if (SUPPORTED_LANGUAGES.includes(prefix)) return prefix;

  // Default to Indonesian
  return 'id';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguagePreference>(() => {
    if (typeof window === 'undefined') return 'id';
    const stored = localStorage.getItem('bayu-lang') as LanguagePreference | null;
    return stored || 'id';
  });

  const [resolvedLanguage, setResolvedLanguage] = useState<LanguageCode>('id');
  const [translations, setTranslations] = useState<any>(idTranslations);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let resolved: LanguageCode;
    if (language === 'system') {
      resolved = detectSystemLanguage();
    } else {
      resolved = language;
    }
    setResolvedLanguage(resolved);
    localStorage.setItem('bayu-lang', language);
    document.documentElement.setAttribute('lang', resolved);
    document.documentElement.dir = 'ltr';
  }, [language]);

  // Load translations from Backend Translation API
  useEffect(() => {
    if (resolvedLanguage === 'id') {
      setTranslations(idTranslations);
      return;
    }

    setLoading(true);
    
    // Fetch locally bundled json file from frontend locales
    import(`../locales/${resolvedLanguage}.json`)
      .then((module) => {
        setTranslations(module.default);
      })
      .catch((err) => {
        console.warn(`Translation file for ${resolvedLanguage} not found. Falling back to Indonesian.`);
        setTranslations(idTranslations);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [resolvedLanguage]);

  useEffect(() => {
    if (language !== 'system') return;

    const handleLanguageChange = () => {
      setResolvedLanguage(detectSystemLanguage());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, [language]);

  const setLanguage = (newLang: LanguagePreference) => {
    setLanguageState(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, resolvedLanguage, setLanguage, translations, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { SUPPORTED_LANGUAGES };

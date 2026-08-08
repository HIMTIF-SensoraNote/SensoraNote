import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import idTranslations from '../locales/id.json';

export type LanguageCode = 'id' | 'en' | 'en-GB' | 'ja' | 'ko' | 'zh' | 'zh-TW' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'ur' | 'hi' | 'tr' | 'ar' | 'ms' | 'bn' | 'vi' | 'fa' | 'it' | 'th' | 'pa' | 'sw' | 'nl' | 'pl' | 'uk' | 'ro' | 'cs' | 'el' | 'hu' | 'sv' | 'fi' | 'da' | 'tl' | 'my' | 'km' | 'lo' | 'ne' | 'si' | 'he' | 'am' | 'zu' | 'af';
export type LanguagePreference = LanguageCode | 'system';

interface LanguageContextType {
  language: LanguagePreference;
  resolvedLanguage: LanguageCode;
  setLanguage: (lang: LanguagePreference) => void;
  translations: any;
  loading: boolean;
}

const SUPPORTED_LANGUAGES: LanguageCode[] = ['id', 'en', 'en-GB', 'ja', 'ko', 'zh', 'zh-TW', 'es', 'fr', 'de', 'pt', 'ru', 'ur', 'hi', 'tr', 'ar', 'ms', 'bn', 'vi', 'fa', 'it', 'th', 'pa', 'sw', 'nl', 'pl', 'uk', 'ro', 'cs', 'el', 'hu', 'sv', 'fi', 'da', 'tl', 'my', 'km', 'lo', 'ne', 'si', 'he', 'am', 'zu', 'af'];

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
    
    // Set global UI direction to LTR so the layout never breaks.
    // Text rendering and input direction will be handled by CSS/Unicode bidirectionality.
    document.documentElement.dir = 'ltr';
  }, [language]);

  // Load translations dynamically when resolvedLanguage changes
  useEffect(() => {
    if (resolvedLanguage === 'id') {
      setTranslations(idTranslations);
      return;
    }

    setLoading(true);
    import(`../locales/${resolvedLanguage}.json`)
      .then((module) => {
        setTranslations(module.default);
      })
      .catch((err) => {
        console.error(`Failed to load translations for ${resolvedLanguage}:`, err);
        setTranslations(idTranslations);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [resolvedLanguage]);

  // Listen for system language changes when set to 'system'
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

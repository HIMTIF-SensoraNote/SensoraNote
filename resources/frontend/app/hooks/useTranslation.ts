import { useLanguage, type LanguageCode } from '../contexts/LanguageContext';
import idTranslations from '../locales/id.json';

/**
 * Get a nested value from an object by dot-separated key
 * e.g. getNestedValue(obj, 'nav.home') -> obj.nav.home
 */
function getNestedValue(obj: Record<string, any>, key: string): any {
  return key.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') return acc[part];
    return undefined;
  }, obj as any);
}

/**
 * Custom hook that provides the translation function `t(key)`
 * 
 * Usage:
 *   const { t } = useTranslation();
 *   <h1>{t('nav.home')}</h1>  // "Beranda" or "Home" depending on language
 */
export function useTranslation() {
  const { resolvedLanguage, translations } = useLanguage();

  const t = (key: string, variables?: Record<string, any>): any => {
    // Try the current language first
    let value = getNestedValue(translations, key);
    
    // Fallback to Indonesian (default)
    if (value === undefined) {
      value = getNestedValue(idTranslations, key);
    }

    // If key doesn't exist anywhere, return the key itself
    if (value === undefined) return key;

    // Perform variable interpolation if it's a string
    if (typeof value === 'string' && variables) {
      Object.keys(variables).forEach((varKey) => {
        value = value.replace(new RegExp(`\\{\\{${varKey}\\}\\}`, 'g'), String(variables[varKey]));
      });
    }

    return value;
  };

  return { t, language: resolvedLanguage };
}

import { useLocalStorage } from './useLocalStorage';
import { TRANSLATIONS } from '../constants/translations';

export function useTranslation() {
  const [language] = useLocalStorage('language', 'en');
  
  const t = (key: string): string => {
    const translations = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  return { t, language };
}
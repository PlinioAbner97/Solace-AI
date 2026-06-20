import { createContext, useContext, useState, useEffect } from 'react';
import { t as translate } from './translations';

const LanguageContext = createContext(null);

function detectDefaultLang() {
  const saved = localStorage.getItem('solace_lang');
  if (saved === 'en' || saved === 'es') return saved;
  // Detect from browser
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectDefaultLang());

  useEffect(() => {
    localStorage.setItem('solace_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang) => setLangState(newLang);
  const toggleLang = () => setLangState(prev => (prev === 'en' ? 'es' : 'en'));

  const t = (key, vars) => translate(lang, key, vars);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

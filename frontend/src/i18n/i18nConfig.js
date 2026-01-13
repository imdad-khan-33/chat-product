import en from './en.json';
import ur from './ur.json';
import ps from './ps.json';

const i18n = {
  en,
  ur,
  ps
};

export const getTranslation = (key, language = 'en') => {
  const keys = key.split('.');
  let value = i18n[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return value || key;
};

export const useTranslation = (language = 'en') => {
  return {
    t: (key) => getTranslation(key, language),
  };
};

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './locales/en/common.json';
import library from './locales/en/library.json';

// One namespace per feature module (matches src/features/<module>) so each
// module's strings stay isolated and modules can be converted incrementally
// — see i18n-PROGRESS.md for which namespaces exist vs. are still pending.
export const defaultNS = 'common';

export const resources = {
  en: {
    common,
    library,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;

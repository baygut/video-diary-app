import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import tr from './locales/tr/translation.json';

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';
const supportedLanguage = deviceLanguage === 'tr' ? 'tr' : 'en';

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, tr: { translation: tr } },
  lng: supportedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { z } from 'zod'; // ✅ Import Zod

import enCommon from '@/locales/en/common.json';
import enWizard from '@/locales/en/wizard.json';
import enMedicine from '@/locales/en/medicine.json';
import enProfile from '@/locales/en/profile.json';

import faCommon from '@/locales/fa/common.json';
import faWizard from '@/locales/fa/wizard.json';
import faMedicine from '@/locales/fa/medicine.json';
import faProfile from '@/locales/fa/profile.json';

z.config({
    customError: (issue) => {
        const message = issue.message;

        // If the error message is a string (our translation key), translate it
        if (typeof message === 'string') {
            return i18n.t(message, { defaultValue: message });
        }

        // Otherwise, fall back to Zod's default English message
        return undefined;
    }
});

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: enCommon, wizard: enWizard, medicine: enMedicine, profile: enProfile },
            fa: { common: faCommon, wizard: faWizard, medicine: faMedicine, profile: faProfile },
        },
        fallbackLng: 'en',
        supportedLngs: ['en', 'fa'],
        nonExplicitSupportedLngs: true,
        defaultNS: 'common',
        ns: ['common', 'wizard', 'medicine', 'profile'],
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'meds-reminder-i18nextLng',
        },
    });

export default i18n;
import { useEffect, type PropsWithChildren } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import i18n from '@/lib/i18n'; // ✅ Import i18n

export function LanguageProvider({ children }: PropsWithChildren) {
    const language = useSettingsStore((s) => s.settings.language);

    useEffect(() => {
        const root = window.document.documentElement;

        // Update HTML attributes for Tailwind CSS RTL/LTR and Fonts
        root.lang = language;
        root.dir = language === 'fa' ? 'rtl' : 'ltr';

        // ✅ Sync i18next language with Zustand store
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language]);

    return <>{children}</>;
}
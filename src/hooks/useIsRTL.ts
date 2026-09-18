import { useSettingsStore } from "@/stores/useSettingsStore";

export function useIsRTL() {
    const language = useSettingsStore((s) => s.settings.language);
    const rtlLanguages = ["fa", "ar", "he", "ur"]; // Add any future RTL languages here
    return rtlLanguages.includes(language);
}
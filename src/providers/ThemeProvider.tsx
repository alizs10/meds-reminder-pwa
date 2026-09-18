import { useLayoutEffect, type ReactNode } from "react"; // ✅ Changed to useLayoutEffect
import { useSettingsStore } from "@/stores/useSettingsStore";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const theme = useSettingsStore((s) => s.settings?.theme);

    // ✅ useLayoutEffect fires synchronously after all DOM mutations but BEFORE the browser paints
    useLayoutEffect(() => {
        if (!theme) return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const applyTheme = () => {
            const isDark = theme === "dark" || (theme === "system" && mediaQuery.matches);
            document.documentElement.classList.toggle("dark", isDark);
        };

        // Apply immediately
        applyTheme();

        // Listen for system theme changes
        mediaQuery.addEventListener("change", applyTheme);

        return () => {
            mediaQuery.removeEventListener("change", applyTheme);
        };
    }, [theme]);

    return <>{children}</>;
}
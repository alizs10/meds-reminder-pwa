import { useState, type ReactNode } from "react";
import { HeaderContext, type HeaderConfig } from "./headerContext";

// ✅ This file ONLY exports a component. Fast Refresh works perfectly.
export function HeaderProvider({ children }: { children: ReactNode }) {
    const [header, setHeader] = useState<HeaderConfig | null>(null);

    return (
        <HeaderContext.Provider value={{ header, setHeader }}>
            {children}
        </HeaderContext.Provider>
    );
}
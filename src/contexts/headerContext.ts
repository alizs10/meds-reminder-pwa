import { createContext, type ReactNode } from "react";

export interface HeaderConfig {
    title: string;
    icon?: ReactNode;
    action?: ReactNode;
    trailingAction?: ReactNode; // ✅ Added for the right-side action
}

export interface HeaderContextType {
    header: HeaderConfig | null;
    setHeader: (config: HeaderConfig | null) => void;
}

export const HeaderContext = createContext<HeaderContextType | undefined>(undefined);
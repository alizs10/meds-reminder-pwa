import { createContext, type ReactNode } from "react";

export interface HeaderConfig {
    title: string;
    icon?: ReactNode;
    action?: ReactNode;
}

export interface HeaderContextType {
    header: HeaderConfig | null;
    setHeader: (config: HeaderConfig | null) => void;
}

// This is a value, not a component. Fast Refresh ignores files without components.
export const HeaderContext = createContext<HeaderContextType | undefined>(undefined);
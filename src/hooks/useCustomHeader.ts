import { useEffect } from "react";
import { useHeader } from "@/hooks/useHeader"; // ✅ Changed import path
import type { HeaderConfig } from "@/contexts/headerContext";

export function useCustomHeader(config: HeaderConfig | null) {
    const { setHeader } = useHeader();

    useEffect(() => {
        setHeader(config);
        return () => setHeader(null);
    }, [config, setHeader]);
}
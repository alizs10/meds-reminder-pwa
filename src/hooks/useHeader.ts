import { useContext } from "react";
import { HeaderContext } from "@/contexts/headerContext"; // ✅ Import from the value file

export function useHeader() {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error("useHeader must be used within HeaderProvider");
    }
    return context;
}
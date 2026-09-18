import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/util";

type FontWeight = "thin" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold";

type PredefinedVariant = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

interface TypographyProps {
    // 🎯 Accepts predefined names OR dynamic strings like "8-12-16" or "16-32-8"
    variant?: PredefinedVariant | string;
    weight?: FontWeight;
    as?: ElementType;
    className?: string;
    children?: ReactNode;
}

// 🎯 The predefined variants are now just aliases for the dynamic scale!
const PREDEFINED_SCALES: Record<PredefinedVariant, string> = {
    xxs: "8-10",
    xs: "12-14",
    sm: "12-14",
    md: "14-16",
    lg: "16-18",
    xl: "20-24",
    "2xl": "24-30",
    "3xl": "30-36",
};

const weightClasses: Record<FontWeight, string> = {
    thin: "font-thin", light: "font-light", normal: "font-normal",
    medium: "font-medium", semibold: "font-semibold", bold: "font-bold", extrabold: "font-extrabold",
};

const defaultWeights: Record<PredefinedVariant, FontWeight> = {
    xxs: "normal", xs: "normal", sm: "normal", md: "normal", lg: "medium",
    xl: "semibold", "2xl": "bold", "3xl": "extrabold",
};

// 🎯 The Magic Parser: Converts "8-12-16" into CSS variables
function parseDynamicSizes(input: string): React.CSSProperties {
    const parts = input.split("-");
    const vars = ["--size-base", "--size-sm", "--size-md", "--size-lg", "--size-xl", "--size-2xl"];

    const styles: Record<string, string> = {};
    parts.forEach((val, i) => {
        if (i < vars.length) {
            styles[vars[i]] = `${val}px`;
        }
    });
    return styles;
}

export function Typography({
    variant = "md",
    weight,
    as,
    className,
    children,
}: TypographyProps) {
    // 1. Resolve variant to a dynamic string (e.g., "xs" -> "8-12-16")
    const scaleString = PREDEFINED_SCALES[variant as PredefinedVariant] ?? variant;

    // 2. Parse it into CSS variables
    const sizeStyles = parseDynamicSizes(scaleString);

    // 3. Determine default weight
    const resolvedWeight = weight ?? (defaultWeights[variant as PredefinedVariant] || "normal");

    // 4. Safe HTML tag defaults
    const isBlockVariant = ["md", "lg", "xl", "2xl", "3xl"].includes(variant);
    const Component = as ?? (isBlockVariant ? "p" : "span");

    return (
        <Component
            // 🎯 We apply the 'responsive-text' class and inject the dynamic styles
            className={cn("responsive-text", weightClasses[resolvedWeight], className)}
            style={sizeStyles}
        >
            {children}
        </Component>
    );
}
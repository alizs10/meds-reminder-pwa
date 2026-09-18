import { cn } from "@/lib/util";
import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Controls the shimmer animation speed.
     */
    duration?: number;
}

export default function Skeleton({
    className,
    duration = 1.5,
    style,
    ...props
}: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "relative overflow-hidden rounded-3xl app_container app_gradient app-blur",
                className
            )}
            style={{
                ...style,
                "--skeleton-duration": `${duration}s`,
            } as React.CSSProperties}
            {...props}
        >
            <div
                className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_var(--skeleton-duration)_ease-in-out_infinite] bg-linear-to-r from-transparent via-white dark:via-white/10 to-transparent"
            />
        </div>
    );
}
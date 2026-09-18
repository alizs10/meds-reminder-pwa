import { cn } from '@/lib/util';
import React, { type HTMLAttributes } from 'react';
import { Typography } from './Typography';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The visual style of the badge.
     */
    variant?: 'default' | 'secondary' | 'destructive' | 'warning' | 'success' | 'outline' | 'ghost' | 'ghost-destructive' | 'ghost-warning';

    /**
     * The size of the badge. Automatically adjusts padding, gap, dot size, and typography.
     */
    size?: 'xs' | 'sm' | 'md' | 'lg';

    /**
     * Optional dot indicator for status badges.
     */
    withDot?: boolean;

    children: React.ReactNode;
}

// 🌟 Configuration map mathematically aligned with Typography scales
const SIZE_CONFIG = {
    xs: {
        container: "px-2 py-0.75 gap-1", // 8px horiz, 2px vert, 4px gap
        dot: "size-1",                    // 4px dot
        typography: "xxs" as const,
    },

    sm: {
        container: "px-2.5 py-1 gap-1", // 10px horiz, 4px vert, 4px gap
        dot: "size-1.5",                 // 6px dot
        typography: "xs" as const,
    },

    md: {
        container: "px-3.5 py-1.5 gap-1.5", // 14px horiz, 6px vert, 6px gap
        dot: "size-2",                       // 8px dot
        typography: "sm" as const,
    },

    lg: {
        container: "px-4 py-2 gap-2", // 16px horiz, 8px vert, 8px gap
        dot: "size-2.5",              // 10px dot
        typography: "md" as const,
    },
} as const;

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = 'default', size = 'md', withDot = false, children, ...props }, ref) => {
        const config = SIZE_CONFIG[size];

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-full transition-colors",
                    "focus:outline-none focus:ring-0",
                    config.container,
                    {
                        // Semantic Variants
                        "app_container app_gradient app-blur bg-primary/30! text-primary": variant === 'default',
                        "app_container app_gradient app-blur bg-muted/30! text-muted-foreground": variant === 'secondary',
                        "app_container app_gradient app-blur bg-destructive/30! text-destructive": variant === 'destructive',
                        "app_container app_gradient app-blur bg-warning/30! text-warning": variant === 'warning',
                        "app_container app_gradient app-blur bg-success/30! text-success": variant === 'success',
                        "bg-transparent border border-border text-foreground": variant === 'outline',
                        "bg-transparent text-foreground": variant === 'ghost',
                        "bg-transparent text-destructive": variant === 'ghost-destructive',
                        "bg-transparent text-warning": variant === 'ghost-warning',
                    },
                    className
                )}
                {...props}
            >
                {withDot && (
                    <span
                        className={cn(
                            "rounded-full shrink-0",
                            config.dot,
                            {
                                "bg-primary": variant === 'default',
                                "bg-muted-foreground": variant === 'secondary' || variant === 'outline' || variant === 'ghost',
                                "bg-destructive": variant === 'destructive' || variant === 'ghost-destructive',
                                "bg-warning": variant === 'warning' || variant === 'ghost-warning',
                                "bg-success": variant === 'success',
                            }
                        )}
                    />
                )}

                <Typography
                    variant={config.typography}
                    weight="medium"
                    className="leading-none tracking-wide whitespace-nowrap"
                >
                    {children}
                </Typography>
            </div>
        );
    }
);

Badge.displayName = 'Badge';
export default Badge;
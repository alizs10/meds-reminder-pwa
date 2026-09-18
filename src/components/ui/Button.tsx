import type {
    ButtonHTMLAttributes,
    ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { Button as BaseButton } from "@base-ui/react/button";
import { IconLoader } from "@tabler/icons-react";

import { cn } from "../../lib/util";

export type ButtonVariant =
    | "primary"
    | "primary-active"
    | "ghost"
    | "success"
    | "success-active"
    | "destructive"
    | "destructive-active"
    | "ghost-warning"
    | "ghost-destructive"
    | "ghost-success"
    | "warning"
    | "none";

type ButtonSize =
    | "icon"
    | "icon-sm"
    | "icon-xs"
    | "xs"
    | "sm"
    | "md"
    | "lg";

type SharedProps = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    className?: string;
    children?: ReactNode;
};

type LinkButtonProps = SharedProps & {
    href: string;
    disabled?: never;
};

type NativeButtonProps = SharedProps &
    ButtonHTMLAttributes<HTMLButtonElement> & {
        href?: never;
    };

type ButtonProps = LinkButtonProps | NativeButtonProps;

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "bg-gradient-to-b from-background/30 to-background/60 app-blur text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_20px_rgba(255,255,255,0.16)] hover:to-primary/10 dark:hover:to-primary/30",
    "primary-active":
        "bg-gradient-to-b from-background/30 to-primary/10 dark:to-primary/30 app-blur text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_20px_rgba(255,255,255,0.16)] hover:to-primary/20 dark:hover:to-primary/40",
    ghost:
        "bg-gradient-to-b from-transparent to-transparent hover:from-secondary/30 hover:to-background/60 hover:app-blur hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] hover:dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_20px_rgba(255,255,255,0.16)] text-foreground",
    success:
        "bg-gradient-to-b from-background/30 to-background/60 app-blur text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_20px_rgba(255,255,255,0.16)] hover:to-success/10 dark:hover:to-success/30",
    "success-active":
        "bg-gradient-to-b from-background/30 to-success/20 dark:to-success-30 app-blur text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_20px_rgba(255,255,255,0.16)] hover:to-success/30 dark:hover:to-success/40",
    destructive:
        "bg-gradient-to-b from-background/30 to-background/60 app-blur text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_20px_rgba(255,255,255,0.16)] hover:to-destructive/10 dark:hover:to-destructive/30",
    "destructive-active":
        "bg-gradient-to-b from-background/30 to-destructive/20 dark:to-destructive-30 app-blur text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_20px_rgba(255,255,255,0.16)] hover:to-destructive/30 dark:hover:to-destructive/40",
    "ghost-destructive":
        "bg-none hover:bg-gradient-to-b from-background/30 to-destructive/20 dark:to-destructive/30 hover:app-blur border-t border-transparent hover:border-border hover:to-destructive/30 dark:hover:to-destructive/40",

    "ghost-warning":
        "bg-none hover:bg-gradient-to-b from-background/30 to-warning/20 dark:to-warning/30 hover:app-blur border-t border-transparent hover:border-border hover:to-warning/30 dark:hover:to-warning/40",

    "ghost-success":
        "bg-none hover:bg-gradient-to-b from-background/30 to-success/20 dark:to-success/30 hover:app-blur border-t border-transparent hover:border-border hover:to-success/30 dark:hover:to-success/40",

    warning:
        "bg-gradient-to-b from-background/30 to-background/60 app-blur text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_20px_rgba(255,255,255,0.16)] hover:to-warning/30 dark:hover:to-warning/40",
    none: "",
};

const sizeClasses: Record<ButtonSize, string> = {
    icon: "h-14 min-h-14 aspect-square",
    "icon-sm": "h-10 aspect-square",
    "icon-xs": "h-6 aspect-square",
    sm: "h-9 px-5 text-xs",
    xs: "h-6 px-2 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-12 px-8 text-base",
};

export default function Button(props: ButtonProps) {
    const {
        leftIcon,
        rightIcon,
        loading,
        variant = "primary",
        size = "sm",
        className,
        children,
        ...rest
    } = props;

    const classes = cn(
        "relative z-0 inline-flex items-center justify-center gap-x-2 rounded-3xl font-medium",
        "transition-all duration-200 ease-out",
        "active:opacity-80 active:scale-90",
        "disabled:grayscale-100 disabled:pointer-event-none disabled:text-foreground/30",
        variantClasses[variant],
        sizeClasses[size],
        className,
    );

    const content = loading ? (
        <IconLoader className="size-4 animate-spin" />
    ) : (
        <>
            {leftIcon}
            {children}
            {rightIcon}
        </>
    );

    if ("href" in props && props.href) {
        return (
            <Link to={props.href} className={classes}>
                {content}
            </Link>
        );
    }

    return (
        <BaseButton
            {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
            disabled={loading || props.disabled}
            className={classes}
            focusableWhenDisabled={!!loading}
        >
            {content}
        </BaseButton>
    );
}
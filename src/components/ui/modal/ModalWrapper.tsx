import {
    type ReactNode,
    useEffect,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/util";

interface ModalProps {
    children: ReactNode;
    open: boolean;
    onClose: () => void;
    onExited?: () => void;
    className?: string;
}

const ANIMATION_DURATION = 250;

export default function ModalWrapper({
    children,
    open,
    onClose,
    onExited,
    className,
}: ModalProps) {
    const [mounted, setMounted] = useState(open);
    const [isVisible, setIsVisible] = useState(false);

    // ✅ FIX 1: Synchronize state during the RENDER phase.
    // This is the officially recommended way to adjust state based on props 
    // without triggering the "cascading renders" effect warning.
    if (open && !mounted) {
        setMounted(true);
    }
    if (!open && isVisible) {
        setIsVisible(false);
    }

    // ✅ FIX 2: Only handle ASYNC side effects in the effect.
    // No synchronous setState calls here!
    useEffect(() => {
        if (open) {
            // Wait for the next frame to trigger the enter animation 
            // so the browser paints the initial hidden state first.
            const raf = requestAnimationFrame(() => {
                setIsVisible(true);
            });
            return () => cancelAnimationFrame(raf);
        } else {
            // Wait for the exit animation to finish, then unmount.
            // (Calling setState inside a setTimeout callback is perfectly allowed).
            const timeout = setTimeout(() => {
                setMounted(false);
                onExited?.();
            }, ANIMATION_DURATION);

            return () => clearTimeout(timeout);
        }
    }, [open, onExited]);

    // Handle body scroll lock (Syncing with an external system: the DOM)
    useEffect(() => {
        if (!mounted) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mounted]);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999]">
            <div
                aria-hidden="true"
                onClick={open ? onClose : undefined}
                className={cn(
                    "absolute inset-0 bg-black/60",
                    "transition-opacity duration-[250ms] ease-out",
                    isVisible ? "opacity-100" : "opacity-0",
                    !open && "pointer-events-none",
                )}
            />

            <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
                <div
                    className={cn(
                        "pointer-events-auto w-full max-w-lg",
                        "transform-gpu will-change-transform",
                        "transition-transform duration-[250ms] ease-out",
                        isVisible ? "translate-y-0" : "translate-y-full",
                    )}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className={cn(
                            "w-full rounded-t-3xl bg-secondary outline-none",
                            className,
                        )}
                    >
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="h-1.5 w-12 rounded-full bg-foreground/20" />
                        </div>

                        <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto px-5 pb-5 scrollbar-none">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
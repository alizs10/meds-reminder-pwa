import { Field } from '@base-ui/react/field';
import { Input as BaseInput } from '@base-ui/react/input';
import React, { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/util';
import { Typography } from '@/components/ui/Typography';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    children?: React.ReactNode;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ error, children, className, ...props }, ref) => {
        return (
            // Field.Root manages the validation state for all children
            <Field.Root invalid={!!error} className="flex flex-col gap-y-0.5 h-full">
                <div className="relative overflow-clip h-full">
                    <BaseInput
                        ref={ref}
                        {...props}
                        className={cn(
                            "shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_0_20px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_0_20px_rgba(255,255,255,0.16)]",
                            "bg-background/50 app-blur flex-1 w-full rounded-3xl px-5 py-3",
                            "focus:ring-0 focus:outline-0 text-sm text-foreground placeholder:text-foreground",
                            "transition-colors duration-200 appearance-none",
                            "[&::-webkit-calendar-picker-indicator]:hidden",
                            "[&::-webkit-calendar-picker-indicator]:appearance-none",
                            "data-invalid:border-destructive data-invalid:text-destructive",
                            "border-border text-foreground",
                            className
                        )}
                    />
                    {children}
                </div>

                {/* Your existing visual error rendering, controlled by the string prop */}
                {error && (
                    <Typography variant="xs" className="text-destructive mt-1">
                        {error}
                    </Typography>
                )}
            </Field.Root>
        );
    }
);

TextInput.displayName = 'TextInput';
export default TextInput;
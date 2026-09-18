import { cn } from "@/lib/util";
import Button from "./Button";
import { IconCheck } from "@tabler/icons-react";
import { Typography } from "./Typography";

export interface ColorOption<T extends string = string> {
    id: T;
    className?: string;
    style?: React.CSSProperties;
    gradientStyle?: React.CSSProperties;
    label?: string;
    checkColor?: string;
}

interface ColorPickerProps<T extends string = string> {
    options: ColorOption<T>[];
    selectedId: T;
    onSelect: (id: T) => void;
}

export default function ColorPicker<T extends string = string>({ options, selectedId, onSelect }: ColorPickerProps<T>) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {options.map((option) => {
                const isSelected = selectedId === option.id;

                // ✅ Special rendering for "none" option
                if (option.id === "none") {
                    return (
                        <Button
                            key={option.id}
                            size="sm"
                            variant={isSelected ? "primary-active" : "primary"}
                            type="button"
                            onClick={() => onSelect(option.id)}
                            aria-label={option.label || "No color"}
                            aria-pressed={isSelected}
                            className="w-full px-3" // Matches capsule height
                        >
                            <Typography variant="xs" weight="medium" className={cn(
                                "whitespace-nowrap",
                                isSelected ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {option.label}
                            </Typography>
                        </Button>
                    );
                }

                // Standard capsule rendering
                return (
                    <Button
                        key={option.id}
                        size="sm"
                        variant={isSelected ? "primary-active" : "primary"}
                        type="button"
                        onClick={() => onSelect(option.id)}
                        aria-label={option.label || `Select ${option.id}`}
                        aria-pressed={isSelected}
                        className="w-full px-3"
                    >
                        <div
                            className={cn(
                                "relative aspect-2/1 h-5 rounded-full overflow-hidden flex-center shadow-sm ring-1 ring-black/5 dark:ring-white/10",
                                option.className
                            )}
                            style={option.style}
                        >
                            <div className="absolute inset-y-0 end-0 w-1/2 bg-background/40" />
                            <div className="absolute inset-y-0 start-1/2 w-px -translate-x-1/2 bg-white/40 dark:bg-white/15 z-10" />
                            {isSelected && (
                                <IconCheck
                                    className={cn("size-4 drop-shadow-md z-20", option.checkColor || "text-white")}
                                    strokeWidth={3}
                                />
                            )}
                        </div>
                    </Button>
                );
            })}
        </div>
    );
}
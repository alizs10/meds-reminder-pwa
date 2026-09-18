import { Select } from "@base-ui/react/select";
import Button from "../ui/Button";
import type { ReactNode } from "react";
import { Typography } from "./Typography";
import { IconChevronDown } from "@tabler/icons-react";

export interface DropdownProps<T extends string | number> {
    value: T;
    options: readonly { label: string; value: T }[];
    onValueChange?: (value: T) => void;
    placeholder?: string;
    triggerVariant?: "primary" | "ghost";
    hideLabel?: boolean;
    icon?: ReactNode
}

export default function Dropdown<T extends string | number>({
    value,
    options,
    onValueChange,
    placeholder = "Select...",
    triggerVariant = "primary",
    hideLabel = false,
    icon
}: DropdownProps<T>) {
    const selectedOption = options.find(
        (opt) => String(opt.value) === String(value)
    );

    const displayLabel = selectedOption
        ? selectedOption.label
        : placeholder;

    return (
        <Select.Root<T>
            value={value}
            onValueChange={(newValue) => {
                if (newValue === null) return;

                const matchedOption = options.find(
                    (opt) => String(opt.value) === String(newValue)
                );

                if (matchedOption) {
                    onValueChange?.(matchedOption.value);
                }
            }}
        >
            <Select.Trigger
                render={
                    <Button
                        variant={triggerVariant}
                        size={hideLabel ? "icon-sm" : "sm"}
                        className="h-full py-0"
                        rightIcon={
                            !icon ? <Select.Icon className="transition-transform duration-200 data-popup-open:rotate-180">
                                <IconChevronDown className="size-4" />
                            </Select.Icon>

                                :
                                icon
                        }
                    />
                }
            >
                {!hideLabel && (
                    <Typography
                        variant="xs"
                        weight="medium"
                        className="text-nowrap"
                    >
                        {displayLabel}
                    </Typography>
                )}
            </Select.Trigger>

            <Select.Portal>
                <Select.Positioner
                    side="bottom"
                    align="end"
                    sideOffset={4}
                    alignItemWithTrigger={false}
                >
                    <Select.Popup
                        className="
                w-fit
                min-w-30
                max-h-60
                overflow-y-auto
                scrollbar-hide
                app_container
                app_gradient
                app-blur
                z-9999
                px-2
                py-1.5
                space-y-0.5
                rounded-3xl
                flex
                flex-col
            "
                    >
                        {options.map((option) => (
                            <Select.Item
                                key={String(option.value)}
                                value={option.value}
                                render={
                                    <Button
                                        variant={
                                            String(value) === String(option.value)
                                                ? "primary-active"
                                                : "ghost"
                                        }
                                        size="sm"
                                        className="h-auto py-1 px-4 gap-x-1 min-w-0 justify-start w-full"
                                    >
                                        <Select.ItemText>
                                            <Typography
                                                variant="xs"
                                                weight="medium"
                                                className="w-full text-start text-nowrap"
                                            >
                                                {option.label}
                                            </Typography>
                                        </Select.ItemText>
                                    </Button>
                                }
                            />
                        ))}
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    );
}
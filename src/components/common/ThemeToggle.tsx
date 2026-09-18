import { useState } from "react";
import { IconSun, IconMoon, IconDeviceDesktop, IconChevronUp, IconChevronDown } from "@tabler/icons-react";

import Button from "../ui/Button";
import { useSettingsStore } from "@/stores/useSettingsStore";
import useClickOutside from "@/hooks/useClickOutside";

export default function ThemeToggle() {
    const theme = useSettingsStore((s) => s.settings.theme);
    const update = useSettingsStore((s) => s.update);

    const [open, setOpen] = useState(false);

    const containerRef = useClickOutside(() => setOpen(false));

    return (
        <div
            ref={containerRef}
            className="p-1 app_container app_gradient app-blur flex-row-center gap-x-1 relative z-50"
        >
            {/* Desktop Buttons */}

            <Button
                onClick={() => update({ theme: "light" })}
                size="icon-sm"
                variant="ghost"
                className={theme === "light" ? "" : "hidden"}
            >
                <IconSun className="size-5" />
            </Button>

            <Button
                onClick={() => update({ theme: "dark" })}
                size="icon-sm"
                variant="ghost"
                className={theme === "dark" ? "" : "hidden"}
            >
                <IconMoon className="size-5" />
            </Button>

            <Button
                onClick={() => update({ theme: "system" })}
                size="icon-sm"
                variant="ghost"
                className={theme === "system" ? "" : "hidden"}
            >
                <IconDeviceDesktop className="size-5" />
            </Button>

            {/* Mobile Dropdown Toggle */}

            <Button
                onClick={() => setOpen((prev) => !prev)}
                size="icon-sm"
                variant="ghost"
            >
                {open ? (
                    <IconChevronUp className="size-5" />
                ) : (
                    <IconChevronDown className="size-5" />
                )}
            </Button>

            {/* Mobile Dropdown Menu */}

            {open && (
                <ul className="flex flex-col gap-y-0.5 p-1 absolute top-full right-0 w-fit h-fit app_container bg-background mt-1 z-99">

                    <Button
                        onClick={() => {
                            update({ theme: "light" });
                            setOpen(false);
                        }}
                        size="icon-sm"
                        variant={
                            theme === "light"
                                ? "primary-active"
                                : "ghost"
                        }
                    >
                        <IconSun className="size-5" />
                    </Button>

                    <Button
                        onClick={() => {
                            update({ theme: "dark" });
                            setOpen(false);
                        }}
                        size="icon-sm"
                        variant={
                            theme === "dark"
                                ? "primary-active"
                                : "ghost"
                        }
                    >
                        <IconMoon className="size-5" />
                    </Button>

                    <Button
                        onClick={() => {
                            update({ theme: "system" });
                            setOpen(false);
                        }}
                        size="icon-sm"
                        variant={
                            theme === "system"
                                ? "primary-active"
                                : "ghost"
                        }
                    >
                        <IconDeviceDesktop className="size-5" />
                    </Button>

                </ul>
            )}
        </div>
    );
}
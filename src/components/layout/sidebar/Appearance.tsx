import Button from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function Appearance() {
    const { t } = useTranslation("common");
    const theme = useSettingsStore((s) => s.settings.theme);
    const update = useSettingsStore((s) => s.update);

    return (
        <div className="px-5 flex flex-col gap-y-2">
            <Typography variant="md" weight="semibold">
                {t("settings.appearance")}
            </Typography>

            <div className="app_container app_gradient app-blur p-1 flex-row-center">
                <Button
                    onClick={() => update({ theme: "light" })}
                    className="flex-1"
                    size="sm"
                    variant={theme === "light" ? "primary-active" : "ghost"}
                >
                    <IconSun className="size-5" />
                </Button>

                <Button
                    onClick={() => update({ theme: "dark" })}
                    className="flex-1"
                    size="sm"
                    variant={theme === "dark" ? "primary-active" : "ghost"}
                >
                    <IconMoon className="size-5" />
                </Button>

                <Button
                    onClick={() => update({ theme: "system" })}
                    className="flex-1"
                    size="sm"
                    variant={theme === "system" ? "primary-active" : "ghost"}
                >
                    <IconDeviceDesktop className="size-5" />
                </Button>
            </div>
        </div>
    );
}
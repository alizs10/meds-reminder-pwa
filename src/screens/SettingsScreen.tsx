import { IconArrowLeft, IconArrowRight, IconDeviceDesktop, IconMoon, IconSettings, IconSun } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";

import Button from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useSettingsStore, type WeekStartDay } from "@/stores/useSettingsStore";
import { cn } from "@/lib/util";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useIsRTL } from "@/hooks/useIsRTL";
import { useCustomHeader } from "@/hooks/useCustomHeader";
import DataBackup from "./SettingsScreen/components/DataBackup";
import ResetData from "./SettingsScreen/components/ResetData";

export default function SettingsScreen() {
    const { t } = useTranslation('common');
    const isRTL = useIsRTL();

    const settings = useSettingsStore((s) => s.settings);
    const updateSettings = useSettingsStore((s) => s.update);

    const dateLocale = settings.language === "fa" ? faIR : enUS;

    const settingsScreenHeader = useMemo(() => ({
        title: t("settings.title"),
        icon: <IconSettings className="size-5" />,
        action: <Link className="h-full" to="/">
            <Button className="h-full" size="icon-sm" variant="primary">
                {isRTL ? (<IconArrowRight className="size-5" />) : (<IconArrowLeft className="size-5" />)}
            </Button>
        </Link>
    }), [isRTL, t]);

    useCustomHeader(settingsScreenHeader);

    return (
        <div className="h-full min-h-0 overflow-y-auto px-5 py-20 flex flex-col gap-y-6 scrollbar-none overscroll-y-none">
            <div className="flex flex-col gap-y-4">

                {/* THEME */}
                <div className="flex flex-col gap-y-3 p-5 app_container app_gradient app-blur">
                    <Typography variant="lg" weight="semibold">
                        {t("settings.appearance")}
                    </Typography>
                    <div className="grid grid-cols-3 gap-1">
                        <Button type="button" variant={settings.theme === "light" ? "primary-active" : "primary"} size="sm" onClick={() => updateSettings({ theme: "light" })} leftIcon={<IconSun className="size-3.5 min-w-3.5" />}>
                            <Typography variant="xs" weight="medium">{t("settings.light")}</Typography>
                        </Button>
                        <Button type="button" variant={settings.theme === "dark" ? "primary-active" : "primary"} size="sm" onClick={() => updateSettings({ theme: "dark" })} leftIcon={<IconMoon className="size-3.5 min-w-3.5" />}>
                            <Typography variant="xs" weight="medium">{t("settings.dark")}</Typography>
                        </Button>
                        <Button type="button" variant={settings.theme === "system" ? "primary-active" : "primary"} size="sm" onClick={() => updateSettings({ theme: "system" })} leftIcon={<IconDeviceDesktop className="size-3.5 min-w-3.5" />}>
                            <Typography variant="xs" weight="medium">{t("settings.system")}</Typography>
                        </Button>
                    </div>
                </div>

                {/* LANGUAGE */}
                <div className="flex flex-col gap-y-3 p-5 app_container app_gradient app-blur">
                    <Typography variant="lg" weight="semibold">
                        {t("settings.language")}
                    </Typography>
                    <div className="grid grid-cols-2 gap-1">
                        <Button type="button" variant={settings.language === "en" ? "primary-active" : "primary"} size="sm" onClick={() => updateSettings({ language: "en" })}
                        // leftIcon={<img className="size-5 min-w-5" src="/flags/us.svg" />}
                        >
                            <Typography variant="xs" weight="medium">English</Typography>
                        </Button>
                        <Button type="button" variant={settings.language === "fa" ? "primary-active" : "primary"} size="sm" onClick={() => updateSettings({ language: "fa" })}
                        //  leftIcon={<img className="size-5 min-w-5" src="/flags/iran.svg" />}
                        >
                            <Typography variant="xs" weight="medium">پارسی</Typography>
                        </Button>
                    </div>
                </div>

                {/* WEEK STARTS ON */}
                <div className="flex flex-col gap-y-3 p-5 app_container app_gradient app-blur">
                    <Typography variant="lg" weight="semibold">
                        {t("settings.weekStartsOn")}
                    </Typography>
                    <div className="flex gap-0 p-1.5 rounded-3xl app_container app_gradient app-blur">
                        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                            const date = new Date(2023, 0, 1 + dayIndex);
                            const label = format(date, "EEEEEE", { locale: dateLocale });
                            return (
                                <Button
                                    key={dayIndex}
                                    type="button"
                                    onClick={() => updateSettings({ weekStartsOn: dayIndex as WeekStartDay })}
                                    variant={settings.weekStartsOn === dayIndex ? 'primary-active' : 'ghost'}
                                    className="flex flex-col gap-1 flex-1 h-auto py-2 px-0"
                                >
                                    <Typography
                                        variant="xs"
                                        weight="medium"
                                        className={cn(
                                            "uppercase",
                                            settings.weekStartsOn === dayIndex ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {label}
                                    </Typography>
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <DataBackup />

                {/* ✅ RESET DATA */}
                <ResetData />
            </div>
        </div>
    );
}
import Button from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useTranslation } from "react-i18next";

export default function Language() {
    const { t } = useTranslation("common");
    const language = useSettingsStore((s) => s.settings.language);
    const update = useSettingsStore((s) => s.update);

    return (
        <div className="px-5 flex flex-col gap-y-2">
            <Typography variant="md" weight="semibold">
                {t("settings.language")}
            </Typography>

            <div className="app_container app_gradient app-blur p-1 flex-row-center">
                <Button
                    onClick={() => update({ language: "en" })}
                    className="flex-1"
                    size="sm"
                    variant={language === "en" ? "primary-active" : "ghost"}
                // leftIcon={<img className="size-5 min-w-5" src="/flags/us.svg" />}
                >
                    <Typography variant="sm" weight="medium">English</Typography>
                </Button>

                <Button
                    onClick={() => update({ language: "fa" })}
                    className="flex-1"
                    size="sm"
                    variant={language === "fa" ? "primary-active" : "ghost"}
                // leftIcon={<img className="size-5 min-w-5" src="/flags/iran.svg" />}
                >
                    <Typography variant="sm" weight="medium">پارسی</Typography>
                </Button>
            </div>
        </div>
    );
}
import { Typography } from "@/components/ui/Typography";
import { useTranslation } from "react-i18next";

export default function EmptyState() {
    const { t } = useTranslation("common");
    return (
        <div className="app_container app_gradient app-blur p-6 flex-center mt-8">
            <Typography variant="sm" className="text-muted-foreground">
                {t("home.noMeds")}
            </Typography>
        </div>
    );
}
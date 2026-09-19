import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { IconDownload, IconUpload, IconCheck, IconAlertCircle } from "@tabler/icons-react";

import Button from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { exportUserData, importUserData } from "@/lib/backup";
import { useProfileStore } from "@/stores/useProfileStore";
import { toast } from "@/stores/useToastStore";

export default function DataBackup() {
    const { t } = useTranslation("common");
    const profile = useProfileStore((s) => s.profile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        try {
            await exportUserData(profile?.name);
            toast(t("backup.exportSuccess"), <IconCheck className="size-4 text-success" />);
        } catch (error) {
            console.error("Export failed:", error);
            toast(t("backup.exportError"), <IconAlertCircle className="size-4 text-destructive" />);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await importUserData(file);
            toast(t("backup.importSuccess"), <IconCheck className="size-4 text-success" />);

            // Delay reload so the user can see the success toast
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error("Import failed:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            toast(t("backup.importError", { message }), <IconAlertCircle className="size-4 text-destructive" />);
        } finally {
            // Reset input so the user can import the exact same file again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="flex flex-col gap-y-3 p-5 app_container app_gradient app-blur">
            <Typography variant="lg" weight="semibold">
                {t("backup.title")}
            </Typography>

            <Typography variant="sm" className="text-muted-foreground">
                {t("backup.description")}
            </Typography>

            <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button
                    leftIcon={<IconDownload className="size-4" />}
                    variant="primary"
                    onClick={handleExport}
                    size="md"
                    className="flex-1 py-2.5"
                >
                    <Typography variant="sm" weight="medium">
                        {t("backup.export")}
                    </Typography>
                </Button>

                <Button
                    leftIcon={<IconUpload className="size-4" />}
                    variant="primary"
                    onClick={handleImportClick}
                    size="md"
                    className="flex-1 py-2.5"
                >
                    <Typography variant="sm" weight="medium">
                        {t("backup.import")}
                    </Typography>
                </Button>
            </div>

            <input
                type="file"
                accept=".json,application/json"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
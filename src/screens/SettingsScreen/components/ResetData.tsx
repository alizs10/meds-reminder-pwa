import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconTrash, IconAlertTriangle } from "@tabler/icons-react";

import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/Dialog";
import { Typography } from "@/components/ui/Typography";
import { db } from "@/db";
import { toast } from "@/stores/useToastStore";

const LOCAL_STORAGE_KEYS = ['meds-reminder-app', 'meds-reminder-settings'];

async function clearAllData() {
    // 1. Wipe IndexedDB
    await db.transaction('rw', [db.profile, db.medicines, db.logs, db.settings], async () => {
        await db.profile.clear();
        await db.medicines.clear();
        await db.logs.clear();
        await db.settings.clear();
    });

    // 2. Wipe LocalStorage flags
    LOCAL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
}

export default function ResetData() {
    const { t } = useTranslation("common");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = async () => {
        setIsResetting(true);
        try {
            await clearAllData();
            toast(t("reset.success"), <IconTrash className="size-4 text-destructive" />);

            // Delay reload so the user can see the success toast
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error("Reset failed:", error);
            toast(t("reset.error"), <IconAlertTriangle className="size-4 text-destructive" />);
            setIsResetting(false);
            setIsDialogOpen(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-y-3 p-5 app_container app_gradient app-blur">
                <Typography variant="lg" weight="semibold">
                    {t("reset.title")}
                </Typography>

                <Typography variant="sm" className="text-muted-foreground">
                    {t("reset.description")}
                </Typography>

                <Button
                    leftIcon={<IconTrash className="size-4" />}
                    variant="destructive"
                    onClick={() => setIsDialogOpen(true)}
                    size="md"
                    className="mt-2"
                    disabled={isResetting}
                >
                    <Typography variant="sm" weight="medium">
                        {isResetting ? t("reset.resetting") : t("reset.button")}
                    </Typography>
                </Button>
            </div>

            <ConfirmDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onCancel={() => setIsDialogOpen(false)}
                onConfirm={handleReset}
                title={t("reset.confirmTitle")}
                description={t("reset.confirmDescription")}
                confirmText={t("reset.confirm")}
                cancelText={t("actions.cancel")}
                confirmVariant="destructive-active"
                confirmIcon={<IconTrash className="size-4" />}
            />
        </>
    );
}
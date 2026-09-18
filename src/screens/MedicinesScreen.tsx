import Dropdown from "@/components/ui/Dropdown";
import { Typography } from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import MedicineCard from "@/components/medicines/MedicineCard";
// ✅ Import the two separate modals
import AddMedicineModal from "@/components/medicines/AddMedicineModal";
import EditMedicineModal from "@/components/medicines/EditMedicineModal";
import ConfirmDialog from "@/components/ui/Dialog";
import Skeleton from "@/components/ui/Skeleton";
import TextInput from "@/components/ui/TextInput";

import { useMedicineStore } from "@/stores/useMedicineStore";
import type { Medicine } from "@/db";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsRTL } from "@/hooks/useIsRTL";
import { useCustomHeader } from "@/hooks/useCustomHeader";

import {
    IconPlus,
    IconPill,
    IconArrowLeft,
    IconSearch,
    IconX,
    IconArrowRight,
    IconFilter
} from "@tabler/icons-react";

export default function MedicinesScreen() {
    const { t } = useTranslation("medicine");
    const { t: tCommon } = useTranslation("common");
    const isRTL = useIsRTL();

    const medicines = useMedicineStore((s) => s.medicines);
    const isLoading = useMedicineStore((s) => s.isLoading);
    const deleteMedicine = useMedicineStore((s) => s.deleteMedicine);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
    const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(null);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

    const handleAdd = () => { setEditingMedicine(null); setIsModalOpen(true); };
    const handleEdit = (medicine: Medicine) => { setEditingMedicine(medicine); setIsModalOpen(true); };

    const handleDeleteConfirm = async () => {
        if (deletingMedicine) {
            await deleteMedicine(deletingMedicine.id!);
            setDeletingMedicine(null);
        }
    };

    const medicinesScreenHeader = useMemo(() => ({
        title: t("title"),
        icon: <IconPill className="size-5" />,
        action: <Link className="h-full" to="/">
            <Button className="h-full" size="icon-sm" variant="primary">
                {isRTL ? (<IconArrowRight className="size-5" />) : (<IconArrowLeft className="size-5" />)}
            </Button>
        </Link>
    }), [isRTL, t]);

    useCustomHeader(medicinesScreenHeader);

    const filterOptions = [
        { label: t("all"), value: "all" },
        { label: t("active"), value: "active" },
        { label: t("paused"), value: "paused" },
    ] as const;

    const filteredMedicines = medicines
        .filter(m => {
            if (filter === "active") return m.isActive;
            if (filter === "paused") return !m.isActive;
            return true;
        })
        .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="h-full min-h-0 overflow-y-auto py-20 flex flex-col gap-y-4 scrollbar-none overflow-clip px-5">
            <div className="flex-row-center gap-2">
                <div className="relative flex-1">
                    <TextInput
                        placeholder={t("search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="ps-12 pe-10"
                    >
                        <IconSearch className="absolute inset-s-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                    </TextInput>

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="absolute inset-e-3 top-1/2 -translate-y-1/2 size-7 flex-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
                            aria-label={t("clearSearch")}
                        >
                            <IconX className="size-4" />
                        </button>
                    )}
                </div>

                <Dropdown
                    value={filter}
                    options={filterOptions}
                    onValueChange={(val) => setFilter(val)}
                    triggerVariant="primary"
                    icon={<IconFilter className="size-4" />}
                />
            </div>

            <div className="flex-center-between">
                <Typography variant="md" weight="semibold" className="text-muted-foreground">
                    {filteredMedicines.length} {filteredMedicines.length === 1 ? t("medicine_singular") : t("medicine_plural")}
                </Typography>

                <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<IconPlus className="size-4" />}
                    onClick={handleAdd}
                >
                    <Typography variant="sm" weight="medium">
                        {tCommon("actions.add")}
                    </Typography>
                </Button>
            </div>

            {isLoading ? (
                <div className="app_container app_gradient app-blur h-fit flex flex-col">
                    <Skeleton className="h-24 w-full rounded-none" />
                    <Skeleton className="h-24 w-full rounded-none" />
                </div>
            ) : filteredMedicines.length === 0 ? (
                <div className="app_container app_gradient app-blur flex-center h-fit flex-col text-center gap-y-4 py-12 px-4">
                    {medicines.length === 0 ? (
                        <>
                            <div className="size-16 rounded-full bg-primary/10 flex-center">
                                <IconPill className="size-8 text-primary" />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Typography variant="lg" weight="semibold">{t("noMedicines")}</Typography>
                                <Typography variant="sm" className="text-muted-foreground">{t("addFirst")}</Typography>
                            </div>
                            <Button variant="primary" size="md" onClick={handleAdd} leftIcon={<IconPlus className="size-4" />} className="rounded-full">{t("add")}</Button>
                        </>
                    ) : (
                        <>
                            <IconSearch className="size-12 text-muted-foreground" />
                            <Typography variant="md" className="text-muted-foreground">{t("noMatch")}</Typography>
                            <Button variant="ghost" size="sm" onClick={() => setSearch("")}>{t("clearSearch")}</Button>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex-1 min-h-0 flex flex-col">
                    <div className="h-fit max-h-full overflow-y-auto scrollbar-none app_container app_gradient app-blur">
                        {filteredMedicines.map((med) => (
                            <MedicineCard
                                key={med.id}
                                medicine={med}
                                onEdit={handleEdit}
                                onDelete={setDeletingMedicine}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ✅ Conditionally render Add vs Edit Modal */}
            {isModalOpen && !editingMedicine && (
                <AddMedicineModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
            )}
            {isModalOpen && editingMedicine && (
                <EditMedicineModal
                    open={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingMedicine(null); }}
                    medicine={editingMedicine}
                />
            )}

            <ConfirmDialog
                open={!!deletingMedicine}
                onClose={() => setDeletingMedicine(null)}
                onCancel={() => setDeletingMedicine(null)}
                onConfirm={handleDeleteConfirm}
                title={`${tCommon("actions.delete")} ${deletingMedicine?.name}?`}
                description={t("deleteDescription")}
                confirmText={tCommon("actions.delete")}
                cancelText={tCommon("actions.cancel")}
                confirmVariant="destructive"
            />
        </div>
    );
}
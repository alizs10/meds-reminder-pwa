import type { Medicine } from "@/db";
import { MEDICINE_COLORS } from "@/lib/constants/medicineColors";
import { medicineFormSchema, type MedicineFormData } from "@/lib/schemas";
import { useMedicineStore } from "@/stores/useMedicineStore";
import { toast } from "@/stores/useToastStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconCalendar, IconCheck, IconClock, IconPill, IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import ColorPicker from "../ui/ColorPicker";
import CustomSlider from "../ui/CustomSlider";
import DatePickerInput from "../ui/DatePickerInput";
import ModalHeader from "../ui/modal/ModalHeader";
import ModalWrapper from "../ui/modal/ModalWrapper";
import TextInput from "../ui/TextInput";
import { Typography } from "../ui/Typography";
import { EN_INSTRUCTION_OPTIONS, getTranslatedInstruction } from "@/lib/constants/medicineInstructionOptions";
import { addHours, format, parse } from "date-fns";

interface EditMedicineModalProps {
    open: boolean;
    onClose: () => void;
    medicine: Medicine;
}

export default function EditMedicineModal({ open, onClose, medicine }: EditMedicineModalProps) {
    const { t } = useTranslation("medicine");
    const { t: tCommon } = useTranslation("common");

    const updateMedicine = useMedicineStore((s) => s.updateMedicine);

    const form = useForm<MedicineFormData>({
        resolver: zodResolver(medicineFormSchema),
        mode: "onChange",
        defaultValues: {
            name: "", dosage: "", color: "none", schedule: [{ time: "08:00" }], instructions: "",
            startDate: new Date().toISOString().split("T")[0], endDate: "", isActive: true,
            repeatType: "daily", repeatInterval: 2,
        },
    });

    const { fields, append, remove } = useFieldArray({ control: form.control, name: "schedule" });
    const isSaving = form.formState.isSubmitting;
    const watchedInstructions = form.watch("instructions");
    const watchedRepeatType = form.watch("repeatType");
    const watchedRepeatInterval = form.watch("repeatInterval");
    const translatedOptions = t("options", { returnObjects: true }) as string[];

    const lastAppendTime = useRef(0);
    const handleAppendTime = (e: React.MouseEvent) => {
        e.stopPropagation();
        const now = Date.now();
        if (now - lastAppendTime.current < 500) return;
        lastAppendTime.current = now;

        const currentSchedule = form.getValues("schedule") || [];
        const currentCount = currentSchedule.length;
        const lastTime = currentSchedule[currentCount - 1]?.time || "08:00";
        const hoursToAdd = 24 / (currentCount + 1);

        let baseDate = parse(lastTime, "HH:mm", new Date(1970, 0, 1));
        if (isNaN(baseDate.getTime())) baseDate = parse("08:00", "HH:mm", new Date(1970, 0, 1));

        append({ time: format(addHours(baseDate, hoursToAdd), "HH:mm") });
    };

    useEffect(() => {
        if (open) {
            const scheduleData = medicine?.schedule && medicine.schedule.length > 0
                ? medicine.schedule.map(t => ({ time: t })) : [{ time: "08:00" }];

            form.reset({
                name: medicine?.name || "", dosage: medicine?.dosage || "", schedule: scheduleData,
                color: medicine?.color || "none",
                instructions: medicine?.instructions || "",
                startDate: medicine?.startDate || new Date().toISOString().split("T")[0],
                endDate: medicine?.endDate || "", isActive: medicine?.isActive ?? true,
                repeatType: medicine?.repeatType || "daily",
                repeatInterval: medicine?.repeatInterval || 2,
            });
        }
    }, [open, medicine, form]);

    const handleInstructionChipClick = (enOption: string) => {
        const currentValue = form.getValues("instructions");
        form.setValue("instructions", currentValue === enOption ? "" : enOption, { shouldValidate: true });
    };

    const onSubmit = async (data: MedicineFormData) => {
        try {
            const payload = {
                name: data.name, dosage: data.dosage,
                color: data.color || "none",
                schedule: data.schedule.map(s => s.time),
                instructions: data.instructions || undefined,
                startDate: data.startDate, endDate: data.endDate || undefined,
                isActive: medicine.isActive,
                repeatType: data.repeatType,
                repeatInterval: data.repeatType === "custom" ? data.repeatInterval : undefined,
            };

            await updateMedicine(medicine.id!, payload);
            toast(tCommon("toast.saved"), <IconCheck className="size-4 text-success" />);
            onClose();
        } catch (error) {
            console.error(error);
            toast(tCommon("toast.error"));
        }
    };

    const translatedColors = MEDICINE_COLORS.map(c => ({
        ...c, label: c.id === "none" ? t("noColor") : c.label
    }));

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <ModalHeader title={t("edit")} onClose={onClose} />

                <div className="flex flex-col gap-y-5">
                    <section className="flex flex-col gap-y-2.5">
                        <div className="flex items-center gap-1.5 px-0.5">
                            <IconPill className="size-4 text-primary" />
                            <Typography variant="sm" weight="semibold">{t("details")}</Typography>
                        </div>
                        <div className="flex flex-col gap-y-1">
                            <Typography variant="xs" weight="medium" className="text-muted-foreground px-1">{t("name")} <span className="text-destructive">*</span></Typography>
                            <TextInput {...form.register("name")} placeholder={t("namePlaceholder")} error={form.formState.errors.name?.message ? t(form.formState.errors.name.message) : undefined} className="py-2.5 text-sm" enterKeyHint="next" />
                        </div>
                        <div className="flex flex-col gap-y-1">
                            <Typography variant="xs" weight="medium" className="text-muted-foreground px-1">{t("dosage")} <span className="text-destructive">*</span></Typography>
                            <TextInput {...form.register("dosage")} placeholder={t("dosagePlaceholder")} error={form.formState.errors.dosage?.message ? t(form.formState.errors.dosage.message) : undefined} className="py-2.5 text-sm" enterKeyHint="done" />
                        </div>
                        <div className="flex flex-col gap-y-1.5 pt-1">
                            <Typography variant="xs" weight="medium" className="text-muted-foreground px-1">{t("color")}</Typography>
                            <Controller name="color" control={form.control} render={({ field }) => (<ColorPicker options={translatedColors} selectedId={field.value || "none"} onSelect={field.onChange} />)} />
                        </div>
                    </section>

                    <section className="flex flex-col gap-y-2.5">
                        <div className="flex items-center gap-1.5 px-0.5">
                            <IconClock className="size-4 text-primary" />
                            <Typography variant="sm" weight="semibold">{t("schedule")}</Typography>
                        </div>
                        <div className="flex flex-col gap-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <TextInput type="time" {...form.register(`schedule.${index}.time`)} className="dir-ltr py-2.5 text-sm" enterKeyHint="done" />
                                    </div>
                                    {fields.length > 1 && (
                                        <Button type="button" variant="ghost-destructive" size="icon-sm" onClick={() => remove(index)} className="shrink-0">
                                            <IconTrash className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="primary-active" size="sm" onClick={handleAppendTime} leftIcon={<IconPlus className="size-3.5" />}>
                                <Typography variant="xs" weight="medium">{t("addTime")}</Typography>
                            </Button>
                        </div>
                    </section>

                    <section className="flex flex-col gap-y-2.5">
                        <div className="flex items-center gap-1.5 px-0.5">
                            <IconRefresh className="size-4 text-primary" />
                            <Typography variant="sm" weight="semibold">{t("frequency")}</Typography>
                        </div>
                        <Controller
                            name="repeatType"
                            control={form.control}
                            render={({ field }) => (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {(["daily", "everyOtherDay", "weekly", "custom"] as const).map((type) => (
                                        <Button
                                            key={type}
                                            type="button"
                                            variant={field.value === type ? "primary-active" : "primary"}
                                            size="sm"
                                            onClick={() => {
                                                field.onChange(type);
                                                if (type === "custom" && !form.getValues("repeatInterval")) {
                                                    form.setValue("repeatInterval", 2, { shouldValidate: true });
                                                }
                                            }}
                                        >
                                            <Typography variant="xs" weight="medium">{t(`repeat_${type}`)}</Typography>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        />
                        {watchedRepeatType === "custom" && (
                            <div className="flex flex-col gap-2 pt-1">
                                <Typography variant="sm" weight="medium" className="text-center text-primary">
                                    {t("every_x_days", { count: watchedRepeatInterval || 2 })}
                                </Typography>
                                <Controller
                                    name="repeatInterval"
                                    control={form.control}
                                    render={({ field }) => (
                                        <CustomSlider value={field.value || 2} onChange={field.onChange} min={2} max={31} step={1} />
                                    )}
                                />
                            </div>
                        )}
                    </section>

                    <section className="flex flex-col gap-y-2">
                        <Typography variant="xs" weight="medium" className="text-muted-foreground px-1">{t("instructions")} <span className="font-normal">({t("optional")})</span></Typography>
                        <div className="flex flex-wrap gap-1.5 px-0.5">
                            {translatedOptions.map((option, idx) => {
                                const enOption = EN_INSTRUCTION_OPTIONS[idx];
                                return (
                                    <Button key={enOption} type="button" onClick={() => handleInstructionChipClick(enOption)}
                                        variant={watchedInstructions === enOption ? "primary-active" : "primary"}>
                                        {option}
                                    </Button>
                                );
                            })}
                        </div>
                        <Controller name="instructions" control={form.control} render={({ field }) => {
                            const isPredefined = EN_INSTRUCTION_OPTIONS.includes(field.value || "");
                            const displayValue = isPredefined ? getTranslatedInstruction(field.value || "") : (field.value || "");
                            return (
                                <TextInput placeholder={t("customInst")} value={displayValue} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} className="py-2.5 text-sm" enterKeyHint="done" />
                            );
                        }} />
                    </section>

                    <section className="flex flex-col gap-y-2.5">
                        <div className="flex items-center gap-1.5 px-0.5">
                            <IconCalendar className="size-4 text-primary" />
                            <Typography variant="sm" weight="semibold">{t("duration")}</Typography>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-y-1">
                                <Typography variant="xs" weight="medium" className="text-muted-foreground px-1">{t("startDate")}</Typography>
                                <Controller name="startDate" control={form.control} render={({ field }) => (<DatePickerInput value={field.value} onChange={field.onChange} placeholder={t("startDatePlaceholder")} error={form.formState.errors.startDate?.message ? t(form.formState.errors.startDate.message) : undefined} />)} />
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Typography variant="xs" weight="medium" className="text-muted-foreground px-1">{t("endDate")} <span className="font-normal">({t("optional")})</span></Typography>
                                <Controller name="endDate" control={form.control} render={({ field }) => (<DatePickerInput value={field.value} onChange={field.onChange} minDate={form.watch("startDate")} placeholder={t("endDatePlaceholder")} error={form.formState.errors.endDate?.message ? t(form.formState.errors.endDate.message) : undefined} />)} />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="pt-2 pb-1">
                    <Button type="submit" variant="primary" size="md" className="w-full h-11" loading={isSaving}>
                        <Typography variant="sm" weight="bold">{t("save")}</Typography>
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    );
}
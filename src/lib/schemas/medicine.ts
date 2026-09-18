import { z } from "zod";

const medicineFormSchemaBase = z.object({
    name: z.string().min(1, "medicine:errors.nameRequired").trim(),
    dosage: z.string().min(1, "medicine:errors.dosageRequired").trim(),
    color: z.string(),
    schedule: z
        .array(
            z.object({
                time: z.string()
                    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "medicine:errors.invalidTime")
                    .transform((val) => val.substring(0, 5)),
            })
        )
        .min(1, "medicine:errors.scheduleRequired"),
    instructions: z.string().trim().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "medicine:errors.startDateRequired"),
    endDate: z.string().refine(val => val === "" || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "medicine:errors.invalidEndDate",
    }),
    isActive: z.boolean(),
    // ✅ Updated enum
    repeatType: z.enum(["daily", "everyOtherDay", "weekly", "custom"]),
    repeatInterval: z.number().min(2).max(31).optional(),
});

export const medicineFormSchema = medicineFormSchemaBase.refine((data) => {
    if (data.endDate && data.startDate && data.endDate < data.startDate) {
        return false;
    }
    return true;
}, {
    message: "medicine:errors.endDateBeforeStart",
    path: ["endDate"],
}).refine((data) => {
    if (data.repeatType === "custom" && (!data.repeatInterval || data.repeatInterval < 2 || data.repeatInterval > 31)) {
        return false;
    }
    return true;
}, {
    message: "medicine:errors.invalidRepeatInterval",
    path: ["repeatInterval"],
});

export type MedicineFormData = z.infer<typeof medicineFormSchemaBase>;
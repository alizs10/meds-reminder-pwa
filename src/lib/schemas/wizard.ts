import { z } from "zod";

export const wizardSchema = z.object({
    name: z.string().min(1, "wizard:errors.nameRequired").trim(),
    birthdate: z.string().refine((val) => {
        if (!val) return false;
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }, "wizard:errors.pastDate"),
    language: z.enum(["en", "fa"]),
    theme: z.enum(["light", "dark", "system"]),
    // ✅ FIX: Removed .default(6) to prevent react-hook-form input/output type mismatch.
    // The default value of 6 is already provided in the useForm defaultValues.
    weekStartsOn: z.number().min(0).max(6),
});

export type WizardFormValues = z.infer<typeof wizardSchema>;
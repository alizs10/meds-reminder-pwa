import { z } from "zod";

export const profileSchema = z.object({
    name: z.string().min(1, "profile.errors.nameRequired").max(50, "profile.errors.nameTooLong"),
    birthdate: z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
    }, "profile.errors.invalidBirthdate"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
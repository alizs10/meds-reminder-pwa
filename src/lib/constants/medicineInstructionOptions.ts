import i18n from "@/lib/i18n";

export const EN_INSTRUCTION_OPTIONS = ["Before food", "After food", "With food", "Before sleep", "Empty stomach"];

export const getTranslatedInstruction = (inst: string) => {
    // ✅ Use the global i18n instance directly instead of the React hook.
    // We must explicitly use the "medicine:" namespace prefix here since 
    // we are outside the context of a `useTranslation('medicine')` hook.
    const translatedInstructions = i18n.t("medicine:options", { returnObjects: true }) as string[];

    const idx = EN_INSTRUCTION_OPTIONS.indexOf(inst);
    if (idx !== -1) return translatedInstructions[idx];

    // Fallback to the raw string for custom typed instructions
    return inst;
};
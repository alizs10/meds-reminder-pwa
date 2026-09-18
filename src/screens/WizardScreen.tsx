import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconArrowRight, IconCheck, IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";

import Button from "@/components/ui/Button";
import DatePickerInput from "@/components/ui/DatePickerInput";
import TextInput from "@/components/ui/TextInput";
import { Typography } from "@/components/ui/Typography";
import { wizardSchema, type WizardFormValues } from "@/lib/schemas";
import { useAppStore } from "@/stores/useAppStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { useSettingsStore, type WeekStartDay } from "@/stores/useSettingsStore";
import { toast } from "@/stores/useToastStore";
import { useIsRTL } from "@/hooks/useIsRTL";
import { cn } from "@/lib/util";

export default function WizardScreen() {
  const { t } = useTranslation('wizard');
  const isRTL = useIsRTL()
  const navigate = useNavigate();
  const setSetupComplete = useAppStore((state) => state.setSetupComplete);
  const updateSettings = useSettingsStore((state) => state.update);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      birthdate: "",
      language: "en",
      theme: "system",
      weekStartsOn: 6,
    },
  });

  const selectedLanguage = watch("language");
  const selectedTheme = watch("theme");
  const selectedWeekStart = watch("weekStartsOn");

  const dateLocale = selectedLanguage === "fa" ? faIR : enUS;

  useEffect(() => {
    updateSettings({
      theme: selectedTheme,
      language: selectedLanguage,
      weekStartsOn: selectedWeekStart as WeekStartDay // ✅ Cast to fix TS error
    });
  }, [selectedTheme, selectedLanguage, selectedWeekStart, updateSettings]);


  const onSubmit = async (data: WizardFormValues) => {
    try {
      await updateProfile({
        name: data.name,
        birthdate: data.birthdate,
      });

      // ✅ Cast to fix TS error and await the async update
      await updateSettings({
        theme: data.theme,
        language: data.language,
        weekStartsOn: data.weekStartsOn as WeekStartDay
      });

      setSetupComplete(true);

      toast(t("common:toast.welcome"), <IconCheck className="size-4 text-success" />);
      navigate("/");
    } catch (error) {
      console.error("Failed to save setup:", error);
      toast(t("common:toast.setupFailed"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-full min-h-0 overflow-y-auto px-5 pt-6 pb-16 flex flex-col gap-y-2 scrollbar-none overscroll-y-none"
    >
      <div className="mb-4 flex flex-col gap-y-1">
        <Typography variant="xl" weight="bold" className="tracking-tight">
          {t("welcomeTitle")}
        </Typography>
        <Typography variant="sm" className="text-muted-foreground">
          {t("welcomeSubtitle")}
        </Typography>
      </div>

      <div className="flex flex-col gap-y-4">
        {/* PROFILE SECTION */}
        <div className="flex flex-col gap-y-3 p-5 app_container app_gradient app-blur">
          <Typography variant="lg" weight="semibold">
            {t("profileSection")}
          </Typography>

          <div className="flex flex-col gap-y-1.5">
            <Typography variant="sm" weight="medium" className="text-muted-foreground px-1">
              {t("nameLabel")}
            </Typography>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  placeholder={t("namePlaceholder")}
                  error={errors.name?.message ? t(errors.name.message) : undefined}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-y-1.5">
            <Typography variant="sm" weight="medium" className="text-muted-foreground px-1">
              {t("birthdateLabel")}
            </Typography>
            <Controller
              name="birthdate"
              control={control}
              render={({ field }) => (
                <DatePickerInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("birthdatePlaceholder")}
                  error={errors.birthdate?.message ? t(errors.birthdate.message) : undefined}
                />
              )}
            />
          </div>
        </div>

        {/* PREFERENCES SECTION */}
        <div className="flex flex-col gap-y-3 p-5 app_container app_gradient app-blur">
          <Typography variant="lg" weight="semibold">
            {t("preferencesSection")}
          </Typography>

          {/* Language */}
          <div className="flex flex-col gap-y-2">
            <Typography variant="sm" weight="medium" className="text-muted-foreground px-1">
              {t("languageLabel")}
            </Typography>
            <div className="grid grid-cols-2 gap-1">
              <Button type="button" variant={selectedLanguage === "en" ? "primary-active" : "primary"} size="sm" onClick={() => setValue("language", "en", { shouldValidate: true })} leftIcon={<img className="size-5 min-w-5" src="/flags/us.svg" />}>
                <Typography variant="xs" weight="medium">English</Typography>
              </Button>
              <Button type="button" variant={selectedLanguage === "fa" ? "primary-active" : "primary"} size="sm" onClick={() => setValue("language", "fa", { shouldValidate: true })} leftIcon={<img className="size-5 min-w-5" src="/flags/iran.svg" />}>
                <Typography variant="xs" weight="medium">پارسی</Typography>
              </Button>
            </div>
          </div>

          {/* Theme */}
          <div className="flex flex-col gap-y-2 mt-2">
            <Typography variant="sm" weight="medium" className="text-muted-foreground px-1">
              {t("themeLabel")}
            </Typography>
            <div className="grid grid-cols-3 gap-1">
              <Button type="button" variant={selectedTheme === "light" ? "primary-active" : "primary"} size="sm" onClick={() => setValue("theme", "light", { shouldValidate: true })} leftIcon={<IconSun className="size-3.5 min-w-3.5" />}>
                <Typography variant="xs" weight="medium">{t("light")}</Typography>
              </Button>
              <Button type="button" variant={selectedTheme === "dark" ? "primary-active" : "primary"} size="sm" onClick={() => setValue("theme", "dark", { shouldValidate: true })} leftIcon={<IconMoon className="size-3.5 min-w-3.5" />}>
                <Typography variant="xs" weight="medium">{t("dark")}</Typography>
              </Button>
              <Button type="button" variant={selectedTheme === "system" ? "primary-active" : "primary"} size="sm" onClick={() => setValue("theme", "system", { shouldValidate: true })} leftIcon={<IconDeviceDesktop className="size-3.5 min-w-3.5" />}>
                <Typography variant="xs" weight="medium">{t("system")}</Typography>
              </Button>
            </div>
          </div>

          {/* ✅ NEW: Week Starts On */}
          <div className="flex flex-col gap-y-2 mt-2">
            <Typography variant="sm" weight="medium" className="text-muted-foreground px-1">
              {t("weekStartsOnLabel")}
            </Typography>
            <div className="flex gap-0 p-1.5 rounded-3xl app_container app_gradient app-blur">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                // Jan 1, 2023 was a Sunday (0)
                const date = new Date(2023, 0, 1 + dayIndex);
                const label = format(date, "EEEEEE", { locale: dateLocale });
                return (
                  <Button
                    key={dayIndex}
                    type="button"
                    onClick={() => setValue("weekStartsOn", dayIndex as WeekStartDay, { shouldValidate: true })}
                    variant={selectedWeekStart === dayIndex ? 'primary-active' : 'ghost'}
                    className="flex flex-col gap-1 flex-1 h-auto py-2 px-0"
                  >
                    <Typography
                      variant="xs"
                      weight="medium"
                      className={cn(
                        "uppercase",
                        selectedWeekStart === dayIndex ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </Typography>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="mt-auto pt-6">
        <Button
          type="submit"
          className="w-full"
          variant="primary-active"
          size="lg"
          disabled={isSubmitting || !isValid}
          rightIcon={isRTL ? <IconArrowLeft className="size-5" /> : <IconArrowRight className="size-5" />}
        >
          <Typography variant="md" weight="semibold">
            {isSubmitting ? t("settingUp") : t("getStarted")}
          </Typography>
        </Button>
      </div>
    </form>
  );
}
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/Dialog";
import ImageCropper from "@/components/ui/ImageCropper";
import TextInput from "@/components/ui/TextInput";
import DatePickerInput from "@/components/ui/DatePickerInput";
import { Typography } from "@/components/ui/Typography";
import Skeleton from "@/components/ui/Skeleton";
import { useProfileStore } from "@/stores/useProfileStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconArrowRight, IconCheck, IconPencil, IconPhotoPlus, IconTrash, IconUser } from "@tabler/icons-react";
// ✅ Added useCallback
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "@/stores/useToastStore";
import { profileSchema, type ProfileFormValues } from "@/lib/schemas";
import { useTranslation } from "react-i18next";
import { useIsRTL } from "@/hooks/useIsRTL";
import { useCustomHeader } from "@/hooks/useCustomHeader";
import { cn } from "@/lib/util";

const getDefaultBirthdate = () => {
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 25);
    return defaultDate.toISOString().split('T')[0];
};

export default function ProfileScreen() {
    const { t } = useTranslation("profile");
    const { t: tCommon } = useTranslation("common");
    const isRTL = useIsRTL();

    const { profile, avatarUrl, isLoading, isInitialized, updateProfile, calculateAge } = useProfileStore();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, control, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        values: {
            name: profile?.name || "",
            birthdate: profile?.birthdate
                ? profile.birthdate.split('T')[0]
                : getDefaultBirthdate(),
        },
    });

    // ✅ FIX: Wrapped in useCallback to stabilize the reference for useMemo
    const onSubmit = useCallback(async (data: ProfileFormValues) => {
        try {
            const birthdateISO = new Date(data.birthdate).toISOString();
            await updateProfile({ name: data.name, birthdate: birthdateISO });
            toast(tCommon("toast.saved"), <IconCheck className="size-4 text-success" />);
        } catch (error) {
            console.error("Failed to save profile:", error);
        }
    }, [updateProfile, tCommon]);

    const profileScreenHeader = useMemo(() => ({
        title: t("title"),
        icon: <IconUser className="size-5" />,
        action: (
            <Link className="h-full" to="/">
                <Button className="h-full" size="icon-sm" variant="primary">
                    {isRTL ? (<IconArrowRight className="size-5" />) : (<IconArrowLeft className="size-5" />)}
                </Button>
            </Link>
        ),
        // ✅ Added Save Button to trailingAction. 
        // It only renders when the form has unsaved changes (isDirty).
        trailingAction: isDirty ? (
            <Button
                className="h-full"
                size="icon-sm"
                variant="primary"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
            >
                <IconCheck className="size-5" />
            </Button>
        ) : null
    }), [isRTL, t, isDirty, isLoading, handleSubmit, onSubmit]);

    useCustomHeader(profileScreenHeader);

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleAvatarSave = async (croppedFile: File) => {
        try {
            await updateProfile({ avatar: croppedFile });
            toast(tCommon("toast.saved"), <IconCheck className="size-4 text-success" />);
        } catch (error) {
            console.error("Failed to save avatar:", error);
        }
    };

    const handleEditAvatar = () => {
        if (!profile?.avatar) return;
        const file = new File([profile.avatar], "avatar.webp", { type: profile.avatar.type || "image/webp" });
        setSelectedFile(file);
    };

    const handleDeleteConfirm = async () => {
        try {
            await updateProfile({ avatar: null });
            toast(tCommon("toast.deleted"), <IconTrash className="size-4 text-destructive" />);
        } catch (error) {
            console.error("Failed to delete avatar:", error);
        }
        setIsDeleteModalOpen(false);
    };

    const age = calculateAge();
    const hasAvatar = !!profile?.avatar;

    if (!isInitialized) {
        return (
            <div className="mt-8 flex flex-col gap-6 pb-8 px-5">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="size-32 rounded-full!" />
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-11 w-full rounded-xl" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-xl mt-2" />
                </div>
            </div>
        );
    }

    return (
        <div className="py-20 flex flex-col gap-6 px-5">
            <div className="flex flex-col items-center gap-4">
                <div className="relative group flex flex-col items-end">
                    <div className={`size-32 ${avatarUrl ? "" : "app_container rounded-full! app_gradient app-blur"} relative`}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="size-full object-cover rounded-full outline-4 outline-muted" />
                        ) : (
                            <div className="rounded-full size-full flex items-center justify-center">
                                <IconUser className="size-12 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {hasAvatar ? (
                        <div className={cn(
                            "-mt-8 flex-row-center app_container app_gradient app-blur",
                            isRTL ? "-translate-x-1/3" : "translate-x-1/3",
                        )}>
                            <Button size="icon-sm" variant="none" className="pointer-events-auto" onClick={(e) => { e.stopPropagation(); handleEditAvatar(); }} aria-label="Edit avatar">
                                <IconPencil className="size-4 text-warning" />
                            </Button>
                            <div className="w-px h-6 bg-border"></div>
                            <Button size="icon-sm" variant="none" className="pointer-events-auto" onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }} aria-label="Delete avatar">
                                <IconTrash className="size-4 text-destructive" />
                            </Button>
                        </div>
                    ) : (
                        <Button size="icon-sm" variant="success" className="pointer-events-auto -mt-8" onClick={() => fileInputRef.current?.click()} aria-label="Add avatar">
                            <IconPhotoPlus className="size-4 text-success" />
                        </Button>
                    )}
                </div>

                <div className="text-center">
                    <Typography variant="lg" weight="bold">{profile?.name || t("yourName")}</Typography>
                    {age !== null && (
                        <Typography variant="sm" className="text-muted-foreground">{age} {t("yearsOld")}</Typography>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Typography variant="sm" weight="medium">{t("name")}</Typography>
                    <TextInput {...register("name")} placeholder={t("namePlaceholder")} error={errors.name?.message ? t(errors.name.message) : undefined} />
                </div>

                <div className="flex flex-col gap-2">
                    <Typography variant="sm" weight="medium">{t("birthdate")}</Typography>
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
                    {age !== null && (
                        <Typography variant="xs" className="text-muted-foreground">{t("age")}: {age} {t("yearsOld")}</Typography>
                    )}
                </div>

                {/* ✅ Removed the large Save Changes button from the bottom of the form */}
            </form>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />

            <ImageCropper open={!!selectedFile} file={selectedFile} onClose={() => setSelectedFile(null)} onSave={handleAvatarSave} aspectRatio="1:1" />

            <ConfirmDialog
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t("removeAvatar")}
                description={t("removeAvatarDesc")}
                confirmText={tCommon("actions.delete")}
                cancelText={tCommon("actions.cancel")}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteModalOpen(false)}
                confirmVariant="destructive-active"
                confirmIcon={<IconTrash className="size-4" />}
            />
        </div>
    );
}
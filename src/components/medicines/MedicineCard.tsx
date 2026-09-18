import { type Medicine } from "@/db";
import useClickOutside from "@/hooks/useClickOutside";
import { useIsRTL } from "@/hooks/useIsRTL";
import { MEDICINE_COLORS } from "@/lib/constants/medicineColors";
import { getTranslatedInstruction } from "@/lib/constants/medicineInstructionOptions";
import { cn } from "@/lib/util";
import { useMedicineStore } from "@/stores/useMedicineStore";
import { toast } from "@/stores/useToastStore";
// ✅ Added IconCalendar
import { IconCalendar, IconChevronDown, IconClock, IconPencil, IconPlayerPause, IconPlayerPlay, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useDrag } from "@use-gesture/react";
// ✅ Added date-fns imports
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { Typography } from "../ui/Typography";

interface MedicineCardProps {
    medicine: Medicine;
    onEdit: (medicine: Medicine) => void;
    onDelete: (medicine: Medicine) => void;
}

const ACTION_WIDTH = 160;

export default function MedicineCard({ medicine, onEdit, onDelete }: MedicineCardProps) {
    // ✅ Added i18n to detect language for date formatting
    const { t, i18n } = useTranslation("medicine");
    const { t: tCommon } = useTranslation("common");

    const hookIsRTL = useIsRTL();
    const isRTL = hookIsRTL || (typeof document !== 'undefined' && document.documentElement.dir === 'rtl');

    const togglePause = useMedicineStore((s) => s.togglePauseMedicine);

    const startX = useRef(0);
    const [x, setX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const hasDragged = useRef(false);

    const closeActions = () => {
        if (x !== 0) {
            setX(0);
            startX.current = 0;
        }
    };

    const containerRef = useClickOutside(closeActions);

    // ✅ Native Shamsi/Gregorian Date Formatter
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        // Appending T00:00:00 prevents timezone shifting when parsing YYYY-MM-DD
        const date = new Date(dateStr + "T00:00:00");

        if (i18n.language === "fa") {
            return new Intl.DateTimeFormat("fa-IR", {
                year: "numeric",
                month: "short",
                day: "numeric",
                calendar: "persian",
            }).format(date);
        }
        return format(date, "MMM d, yyyy", { locale: enUS });
    };

    const bind = useDrag(({ active, movement: [mx], velocity: [vx] }) => {
        if (active && Math.abs(mx) > 5) hasDragged.current = true;

        setIsDragging(active);

        const deltaX = mx;
        let currentX = startX.current + deltaX;

        if (active) {
            if (isRTL) {
                if (currentX < 0) currentX = currentX * 0.2;
                else currentX = Math.min(ACTION_WIDTH, currentX);
            } else {
                if (currentX > 0) currentX = currentX * 0.2;
                else currentX = Math.max(-ACTION_WIDTH, currentX);
            }
            setX(currentX);
        } else {
            let finalX = 0;
            if (isRTL) {
                if (vx < -0.2 || currentX > ACTION_WIDTH / 2) finalX = ACTION_WIDTH;
            } else {
                if (vx < -0.2 || currentX < -ACTION_WIDTH / 2) finalX = -ACTION_WIDTH;
            }
            setX(finalX);
            startX.current = finalX;
        }
    }, {
        axis: 'x',
        threshold: 5,
        pointer: { touch: true },
        eventOptions: { passive: true },
    });

    const bindings = bind();

    const formatSchedule = (schedule: string[]) => {
        if (!schedule || schedule.length === 0) return t("noSchedule");
        return schedule.join(" - ");
    };

    const formatRepeat = () => {
        const type = medicine.repeatType || "daily";
        if (type === "custom") {
            return t("every_x_days", { count: medicine.repeatInterval || 1 });
        }
        return t(`repeat_${type}`);
    };

    const handleCardClick = () => {
        if (hasDragged.current) return;

        if (x !== 0) {
            setX(0);
            startX.current = 0;
        } else {
            setIsExpanded(prev => !prev);
        }
    };

    const handleTogglePause = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const wasActive = medicine.isActive;
        await togglePause(medicine.id!);

        if (wasActive) {
            toast(t("pausedToast"), <IconPlayerPause className="size-4 text-warning" />);
        } else {
            toast(t("resumedToast"), <IconPlayerPlay className="size-4 text-success" />);
        }
    };

    const selectedColor = MEDICINE_COLORS.find(c => c.id === medicine.color) || MEDICINE_COLORS[0];

    return (
        <div
            ref={containerRef}
            className="relative border-b border-border/50 last:border-b-0 overflow-hidden min-h-fit"
        >
            {(medicine.color && medicine.color !== "none") && (
                <div
                    style={selectedColor.style}
                    className={`absolute top-4 bottom-4 w-1 rounded-full ${isRTL ? 'right-0' : 'left-0'}`}
                />
            )}

            <div
                {...bindings}
                onPointerDown={(e) => {
                    hasDragged.current = false;
                    bindings.onPointerDown?.(e);
                }}
                style={{
                    transform: `translateX(${x}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                    willChange: 'transform',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                }}
                className="flex cursor-grab active:cursor-grabbing"
            >
                {/* Main Content */}
                <div
                    className="w-full shrink-0 px-5 py-4 flex flex-col cursor-pointer"
                    onClick={handleCardClick}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Typography variant="md" weight="bold" className={`truncate ${medicine.isActive ? "" : "text-muted-foreground line-through"}`}>
                                {medicine.name}
                            </Typography>
                            <Badge size="xs" variant="outline" className={cn(
                                "border-foreground",
                                isRTL && "dir-rtl"
                            )}>
                                {medicine.dosage}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {!medicine.isActive && (
                                <Badge variant="warning" size="xs" withDot>
                                    {t("paused")}
                                </Badge>
                            )}
                            <IconChevronDown
                                className={cn(
                                    "size-5 text-muted-foreground transition-transform duration-200 ease-out",
                                    isExpanded && "rotate-180"
                                )}
                            />
                        </div>
                    </div>

                    <div className={cn(
                        "grid transition-all duration-200 ease-in-out",
                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}>
                        <div className="overflow-hidden min-h-0">
                            <div className="flex flex-col gap-2 mt-3">
                                <div className="flex items-center gap-x-2 text-primary">
                                    <IconClock className="size-3.5" />
                                    <Typography variant="sm" weight="medium">
                                        {formatSchedule(medicine.schedule)}
                                    </Typography>
                                </div>

                                <div className="flex items-center gap-x-2 text-success">
                                    <IconRefresh className="size-3.5" />
                                    <Typography variant="sm" weight="medium">
                                        {formatRepeat()}
                                    </Typography>
                                </div>

                                {/* ✅ NEW: Start & End Date Row */}
                                <div className="flex items-center gap-x-1.5 text-muted-foreground">
                                    <IconCalendar className="size-3.5" />
                                    <Typography variant="sm">
                                        {formatDate(medicine.startDate)}
                                        {" "}
                                        {t("to")}
                                        {" "}
                                        {medicine.endDate ? formatDate(medicine.endDate) : t("ongoing")}
                                    </Typography>
                                </div>

                                {medicine.instructions && (
                                    <Typography variant="xs" className="text-muted-foreground">
                                        {getTranslatedInstruction(medicine.instructions)}
                                    </Typography>
                                )}


                            </div>
                        </div>
                    </div>
                </div>

                {/* Swipe Actions */}
                <div className={cn(
                    "w-40 shrink-0 flex-center gap-x-2 relative",
                    "ltr:pe-2 rtl:ps-2"
                )}>
                    <Button
                        size="icon-sm"
                        variant={medicine.isActive ? "warning" : "success"}
                        onClick={handleTogglePause}
                        aria-label={medicine.isActive ? t("pause") : t("resume")}
                    >
                        {medicine.isActive ? <IconPlayerPause className="size-5" /> : <IconPlayerPlay className="size-5" />}
                    </Button>
                    <Button
                        size="icon-sm"
                        variant="primary"
                        onClick={(e) => { e.stopPropagation(); onEdit(medicine); }}
                        aria-label={tCommon("actions.edit")}
                    >
                        <IconPencil className="size-5" />
                    </Button>
                    <Button
                        size="icon-sm"
                        variant="destructive"
                        onClick={(e) => { e.stopPropagation(); onDelete(medicine); }}
                        aria-label={tCommon("actions.delete")}
                    >
                        <IconTrash className="size-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
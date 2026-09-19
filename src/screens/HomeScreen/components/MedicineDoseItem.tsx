import Badge from "@/components/ui/Badge";
import { Typography } from "@/components/ui/Typography";
import { useIsRTL } from "@/hooks/useIsRTL";
import { MEDICINE_COLORS } from "@/lib/constants/medicineColors";
import { cn } from "@/lib/util";
import { IconArrowBackUp, IconCheck } from "@tabler/icons-react";
import { useDrag } from "@use-gesture/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import type { MedicineDoseItemProps } from "../types";
import { getTranslatedInstruction } from "@/lib/constants/medicineInstructionOptions";

const REVEAL_DELAY = 400;
const SCALE_DELAY = 300;

export default function MedicineDoseItem({
    medicine,
    time,
    dateStr,
    status = "taken",
    showAction = false,
    takenAt,
    currentToday, // ✅ Added
    onTake,
    onUndo,
}: MedicineDoseItemProps) {
    const { t, i18n } = useTranslation("common");
    const isRTL = useIsRTL();
    const selectedColor = MEDICINE_COLORS.find((color) => color.id === medicine.color) || MEDICINE_COLORS[0];
    const instructionsText = getTranslatedInstruction(medicine.instructions || "");

    const isTaken = status === "taken";
    const isMissed = status === "missed";
    const isNext = status === "next";

    const containerRef = useRef<HTMLDivElement>(null);
    const startX = useRef(0);
    const [x, setX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
    const [fullWidth, setFullWidth] = useState(0);

    const isTakeAction = !isTaken;

    const allowedDirection = isTaken
        ? (isRTL ? "left" : "right")
        : (isRTL ? "right" : "left");

    const isAllowedLeft = allowedDirection === "left";
    const showPanelFirst = !isAllowedLeft;

    useEffect(() => {
        if (containerRef.current) {
            setFullWidth(containerRef.current.offsetWidth);
        }
    }, []);

    // ✅ Smart Date Formatter
    const formatTakenAt = (isoString: string) => {
        const date = new Date(isoString);
        const now = currentToday || new Date();

        // Strip time to compare pure calendar days
        const logDate = new Date(date);
        logDate.setHours(0, 0, 0, 0);

        const nowDate = new Date(now);
        nowDate.setHours(0, 0, 0, 0);

        const diffTime = nowDate.getTime() - logDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        let datePart;
        if (diffDays === 0) {
            datePart = t("home.today");
        } else if (diffDays === 1) {
            datePart = t("home.yesterday");
        } else {
            if (i18n.language === "fa") {
                // Shamsi date without year (e.g., "۲۸ شهریور")
                datePart = new Intl.DateTimeFormat("fa-IR", {
                    month: "long",
                    day: "numeric",
                    calendar: "persian",
                }).format(date);
            } else {
                // Gregorian date without year (e.g., "Sep 19")
                datePart = format(date, "MMM d", { locale: enUS });
            }
        }

        // Format time (e.g., "14:30" or "۱۴:۳۰")
        const timeFormatted = i18n.language === "fa"
            ? new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date)
            : format(date, "HH:mm", { locale: enUS });

        // Use Persian comma for RTL, standard comma for LTR
        const separator = i18n.language === "fa" ? "، " : ", ";
        return `${datePart}${separator}${timeFormatted}`;
    };

    // ... [bind, getSwipeHint, getTrackTransform, renderFeedbackPanel remain exactly the same] ...
    // (Omitted for brevity, keep your existing logic for them)

    const bind = useDrag(
        ({ active, movement: [mx], velocity: [vx] }) => {
            if (!showAction || isCompleting) return;

            setIsDragging(active);

            const deltaX = mx;
            let currentX = startX.current + deltaX;

            if (active) {
                if (allowedDirection === "right") {
                    if (currentX < 0) currentX = currentX * 0.2;
                    else currentX = Math.min(fullWidth, currentX);
                } else {
                    if (currentX > 0) currentX = currentX * 0.2;
                    else currentX = Math.max(-fullWidth, currentX);
                }
                setX(currentX);
            } else {
                const absVx = Math.abs(vx);

                const isCorrectDirection = allowedDirection === "right" ? currentX > 0 : currentX < 0;
                const shouldTrigger = isCorrectDirection && (absVx > 0.3 || Math.abs(currentX) > fullWidth / 3);

                if (shouldTrigger) {
                    const targetX = allowedDirection === "right" ? fullWidth : -fullWidth;
                    setX(targetX);
                    startX.current = targetX;
                    setIsCompleting(true);
                    setExitDirection(targetX > 0 ? "right" : "left");

                    setTimeout(() => {
                        if (!isTaken && onTake) {
                            onTake(medicine.id!, dateStr, time);
                        } else if (isTaken && onUndo) {
                            onUndo(medicine.id!, dateStr, time);
                        }
                    }, REVEAL_DELAY + SCALE_DELAY);
                } else {
                    setX(0);
                    startX.current = 0;
                }
            }
        },
        {
            axis: "x",
            threshold: 5,
            pointer: { touch: true },
            eventOptions: { passive: true },
        }
    );

    const getSwipeHint = () => {
        if (!showAction) return null;

        if (isTaken) {
            return isRTL ? t("home.swipeLeftToUndo") : t("home.swipeRightToUndo");
        } else {
            return isRTL ? t("home.swipeRightToTake") : t("home.swipeLeftToTake");
        }
    };

    const getTrackTransform = () => {
        if (fullWidth === 0) return isAllowedLeft ? 0 : -50;
        const progress = (x / fullWidth) * 50;
        return isAllowedLeft ? progress : -50 + progress;
    };

    const progress = fullWidth === 0 ? 0 : Math.abs(x) / fullWidth;
    const feedbackScale = isCompleting ? 1 : Math.max(0, Math.min(progress * 1.3, 1));

    const renderFeedbackPanel = () => (
        <div
            className={cn(
                "w-1/2 shrink-0 flex-center rounded-3xl app_container app_gradient app-blur",
                isTakeAction
                    ? "bg-success"
                    : "bg-warning"
            )}
        >
            <motion.div
                initial={false}
                animate={{
                    scale: feedbackScale,
                    opacity: 1
                }}
                transition={{ ease: "linear" }}
                className="flex flex-col items-center gap-2"
            >
                {isTakeAction ? (
                    <IconCheck className="size-12 text-white" strokeWidth={2} />
                ) : (
                    <IconArrowBackUp className="size-12 text-white" strokeWidth={2} />
                )}
            </motion.div>
        </div>
    );

    return (
        <motion.div
            layout
            initial={false}
            animate={{
                scale: isCompleting ? 0 : 1,
            }}
            dir="ltr"
            exit={{
                opacity: 0,
                scale: 0,
                x: exitDirection === "right" ? 200 : exitDirection === "left" ? -200 : 0,
            }}
            transition={{
                layout: { type: "spring", stiffness: 500, damping: 50 },
                scale: { duration: 0.3, ease: "easeInOut", delay: REVEAL_DELAY / 1000 },
                opacity: { duration: 0.3, delay: REVEAL_DELAY / 1000 },
                x: { duration: 0.3, delay: REVEAL_DELAY / 1000 }
            }}
            className=""
        >
            <div
                ref={containerRef}
                className="relative overflow-hidden rounded-3xl"
            >
                <div
                    {...bind()}
                    dir="ltr"
                    style={{
                        width: '200%',
                        transform: `translateX(${getTrackTransform()}%)`,
                        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
                        willChange: 'transform',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                    }}
                    className="flex cursor-grab active:cursor-grabbing"
                >
                    {showPanelFirst && renderFeedbackPanel()}

                    <div className="w-1/2 shrink-0">
                        <div
                            className={cn(
                                "relative app_container app_gradient app-blur flex flex-row items-center gap-3 px-5 h-32 max-h-32 min-h-32",
                                isRTL && "flex-row-reverse",
                                isTaken && !isCompleting && "grayscale-75 dark:grayscale-80",
                            )}
                        >

                            {(medicine.color && medicine.color !== "none") && (
                                <div
                                    style={selectedColor.style}
                                    className={cn(
                                        "inset-y-8 absolute left-0 w-1 rounded-full",
                                        isRTL && "right-0 left-auto"
                                    )}
                                />
                            )}

                            <div className={cn(
                                "min-w-0 flex-1 flex flex-col gap-y-2",
                                isRTL && "items-end text-right"
                            )}>
                                <div className={cn(
                                    "flex flex-row items-center gap-x-2",
                                    isRTL && "flex-row-reverse"
                                )}>
                                    <Typography
                                        variant="xl"
                                        weight="bold"
                                        className={cn("truncate", isTaken && "text-muted-foreground line-through")}
                                    >
                                        {medicine.name}
                                    </Typography>
                                    <Badge size="xs" variant="outline" className={cn(
                                        "border-foreground",
                                        isRTL && "dir-rtl"
                                    )}>
                                        {medicine.dosage}
                                    </Badge>
                                </div>

                                <div className={cn(
                                    "flex items-center gap-2 text-foreground",
                                    isRTL && "flex-row-reverse"
                                )}>
                                    <Typography variant="md" weight="medium" className="">
                                        {time}
                                    </Typography>
                                    {takenAt && (
                                        <>
                                            <span className="text-xs w-3 h-0.5 min-w-3 bg-foreground rounded-full" />
                                            {/* ✅ Replaced inline format with smart formatter */}
                                            <Typography variant="xs" className="text-foreground text-nowrap">
                                                {t("home.loggedAt")} {formatTakenAt(takenAt)}
                                            </Typography>
                                        </>
                                    )}
                                </div>

                                {!isTaken && instructionsText && (
                                    <Typography variant="xs" className="text-muted-foreground">
                                        {instructionsText}
                                    </Typography>
                                )}
                            </div>

                            {showAction && !isCompleting && (
                                <div className={cn(
                                    "flex flex-col items-end text-end gap-1 max-w-1/3",
                                    isRTL && "items-start text-start"
                                )}>
                                    {isNext && (
                                        <Badge variant="warning">
                                            {t("home.next")}
                                        </Badge>
                                    )}
                                    {isMissed && (
                                        <Badge variant="destructive">
                                            {t("home.missed")}
                                        </Badge>
                                    )}
                                    <Typography variant="xs" className="text-foreground text-wrap opacity-75">
                                        {getSwipeHint()}
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </div>

                    {!showPanelFirst && renderFeedbackPanel()}
                </div>
            </div>
        </motion.div>
    );
}
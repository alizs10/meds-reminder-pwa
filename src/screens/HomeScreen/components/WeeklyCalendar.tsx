import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/util";
import { addDays, isSameDay, subDays } from "date-fns";
import { Typography } from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { useDrag } from "@use-gesture/react";
import { motion } from "framer-motion";
import { useIsRTL } from "@/hooks/useIsRTL";
import { useSettingsStore } from "@/stores/useSettingsStore"; // ✅ Added to check language

interface WeeklyCalendarProps {
    weekDates: Date[];
    selectedDate: Date;
    currentToday: Date;
    onSelectDate: (date: Date) => void;
    getShortDayLabel: (date: Date) => string;
    getDateLabel: (date: Date) => string;
}

export default function WeeklyCalendar({
    weekDates,
    selectedDate,
    currentToday,
    onSelectDate,
    getShortDayLabel,
    getDateLabel,
}: WeeklyCalendarProps) {
    const isRTL = useIsRTL();
    const language = useSettingsStore((s) => s.settings.language);
    const isFa = language === "fa"; // ✅ Check if language is Farsi

    const [weekIndex, setWeekIndex] = useState(1);
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const viewportRef = useRef<HTMLDivElement>(null);
    const [slideWidth, setSlideWidth] = useState(0);
    const [isReady, setIsReady] = useState(false);

    const weeks = useMemo(() => {
        const prevWeek = weekDates.map((d) => subDays(d, 7));
        const nextWeek = weekDates.map((d) => addDays(d, 7));
        return isRTL ? [nextWeek, weekDates, prevWeek] : [prevWeek, weekDates, nextWeek];
    }, [weekDates, isRTL]);

    useLayoutEffect(() => {
        const el = viewportRef.current;
        if (!el) return;

        const update = () => setSlideWidth(el.offsetWidth);
        update();

        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setIsReady(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);
    const [prevWeeks, setPrevWeeks] = useState(weeks);

    if (selectedDate !== prevSelectedDate || weeks !== prevWeeks) {
        setPrevSelectedDate(selectedDate);
        setPrevWeeks(weeks);
        const idx = weeks.findIndex((week) => week.some((d) => isSameDay(d, selectedDate)));
        if (idx !== -1) {
            setWeekIndex(idx);
        }
    }

    const bind = useDrag(
        ({ active, movement: [mx], velocity: [vx], direction: [dx] }) => {
            setIsDragging(active);

            if (active) {
                let x = mx;
                const atStart = weekIndex === 0;
                const atEnd = weekIndex === 2;

                const pullingOut = (atStart && mx > 0) || (atEnd && mx < 0);
                if (pullingOut) x = mx * 0.3;
                setDragX(x);
            } else {
                const threshold = 50;

                const revealRight = mx < -threshold || (dx === -1 && vx > 0.5);
                const revealLeft = mx > threshold || (dx === 1 && vx > 0.5);

                if (revealRight) setWeekIndex((i) => Math.min(2, i + 1));
                else if (revealLeft) setWeekIndex((i) => Math.max(0, i - 1));

                setDragX(0);
            }
        },
        {
            axis: "x",
            filterTaps: true,
            pointer: { touch: true },
        },
    );

    const gap = 8;
    const targetX = -weekIndex * (slideWidth - gap / 2) + dragX;

    return (
        <div dir="ltr" className="sticky top-0 z-40 mx-5 overflow-clip rounded-3xl app_container app_gradient app-blur">
            <div className="overflow-clip">
                <div ref={viewportRef} className="p-1.5 pb-2 overflow-x-clip rounded-3xl" {...bind()}>
                    <motion.div
                        className="flex-row-center gap-x-2 w-full"
                        initial={false}
                        animate={{ x: targetX }}
                        transition={
                            isDragging || !isReady
                                ? { duration: 0 }
                                : { type: "spring", stiffness: 320, damping: 32 }
                        }
                        style={{ touchAction: "pan-y" }}
                    >
                        {weeks.map((week, weekIdx) => {
                            const displayWeek = isRTL ? [...week].reverse() : week;

                            return (
                                <div key={weekIdx} className="w-full shrink-0 flex gap-0">
                                    {displayWeek.map((date) => {
                                        const isSelected = isSameDay(date, selectedDate);
                                        const isTodayDate = isSameDay(date, currentToday);

                                        // ✅ FIX: Use Shamsi day number for Farsi, Gregorian for English
                                        const dayNumber = isFa
                                            ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' }).format(date)
                                            : getDateLabel(date);

                                        return (
                                            <Button
                                                key={date.toISOString()}
                                                onClick={() => onSelectDate(date)}
                                                variant={isSelected ? 'primary-active' : 'ghost'}
                                                className="flex flex-col gap-1 flex-1 h-auto py-2 px-0"
                                            >
                                                <Typography
                                                    variant="xs"
                                                    weight="medium"
                                                    className={cn(
                                                        "uppercase",
                                                        isSelected ? "text-primary" : "text-muted-foreground",
                                                        isRTL && "dir-rtl"
                                                    )}
                                                >
                                                    {getShortDayLabel(date)}
                                                </Typography>
                                                <Typography
                                                    variant="md"
                                                    weight="bold"
                                                    className={cn(
                                                        isSelected ? "text-primary" : "text-foreground"
                                                    )}
                                                >
                                                    {dayNumber}
                                                </Typography>
                                                {isTodayDate && !isSelected && (
                                                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Pagination Dots */}
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex justify-center gap-0.5">
                    {[0, 1, 2].map((i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setWeekIndex(i)}
                            className={cn(
                                "h-1 rounded-full transition-all duration-300",
                                i === weekIndex ? "w-3 bg-primary" : "w-1 bg-muted-foreground/30"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { addDays, format, isBefore, isSameDay, parse, startOfWeek } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import { useMedicineStore } from "@/stores/useMedicineStore";
import { useLogStore } from "@/stores/useLogStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { Medicine } from "@/db";
import type { DoseListItem, DoseStatus, LogListItem } from "./types";

export function useMedicineSchedule() {
    const { t, i18n } = useTranslation("common");
    const dateLocale = i18n.language === "fa" ? faIR : enUS;

    const medicines = useMedicineStore((s) => s.medicines);
    const isMedsLoading = useMedicineStore((s) => s.isLoading);

    const logs = useLogStore((s) => s.logs);
    const logDose = useLogStore((s) => s.logDose);
    const unlogDose = useLogStore((s) => s.unlogDose);
    const isLogsLoading = useLogStore((s) => s.isLoading);

    const weekStartsOn = useSettingsStore((s) => s.settings.weekStartsOn);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const [nowTick, setNowTick] = useState(() => Date.now());

    // 1. Foreground interval + Visibility API for background tabs
    useEffect(() => {
        const interval = setInterval(() => setNowTick(Date.now()), 30_000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setNowTick(Date.now());
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // 2. Derive the actual current "Today" strictly from the ticking clock
    const currentToday = useMemo(() => {
        const d = new Date(nowTick);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [nowTick]);

    // 3. Generate week dates based on the ACTUAL current today.
    const weekDates = useMemo(() => {
        const weekStart = startOfWeek(currentToday, { weekStartsOn });
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [currentToday, weekStartsOn]);

    // 4. Adjust state during the render phase (React 19 pattern)
    const [prevToday, setPrevToday] = useState(currentToday);

    if (currentToday.getTime() !== prevToday.getTime()) {
        setPrevToday(currentToday);

        const wasViewingOldToday = isSameDay(selectedDate, prevToday);
        const isStillVisible = weekDates.some(d => isSameDay(d, selectedDate));

        // If the user was watching the day that just became yesterday, 
        // OR if their selected day scrolled off the visible calendar strip, snap to the new today.
        if (wasViewingOldToday || !isStillVisible) {
            setSelectedDate(currentToday);
        }
    }

    const isLoading = isMedsLoading || isLogsLoading;

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [selectedDate]);

    const scheduleData = useMemo(() => {
        const now = new Date(nowTick);
        now.setSeconds(0, 0);

        const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

        const isTodaySelected = isSameDay(selectedDate, currentToday);
        const isPastSelected = isBefore(selectedDate, currentToday);

        const getDayLabel = (date: Date): string => {
            if (isSameDay(date, currentToday)) return t("home.today");
            if (isSameDay(date, addDays(currentToday, 1))) return t("home.tomorrow");
            if (isSameDay(date, addDays(currentToday, -1))) return t("home.yesterday");
            return format(date, "EEEE", { locale: dateLocale });
        };

        const getShortDayLabel = (date: Date): string => {
            return format(date, "EEEEEE", { locale: dateLocale });
        };

        const getDateLabel = (date: Date): string => {
            return format(date, "d", { locale: dateLocale });
        };

        const isMedicineScheduledForDate = (
            medicine: Medicine,
            dateStr: string,
            isPastDate: boolean,
            isTodayDate: boolean
        ): boolean => {
            if (medicine.startDate > dateStr) return false;
            if (medicine.endDate && medicine.endDate < dateStr) return false;
            if (!isPastDate && !isTodayDate && !medicine.isActive) return false;
            if (isTodayDate && !medicine.isActive) return false;

            const repeatType = medicine.repeatType || "daily";
            if (repeatType === "daily") return true;

            const startDate = new Date(medicine.startDate + "T00:00:00");
            const currentDate = new Date(dateStr + "T00:00:00");

            const diffTime = currentDate.getTime() - startDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) return false;

            switch (repeatType) {
                case "everyOtherDay":
                    return diffDays % 2 === 0;
                case "weekly":
                    return diffDays % 7 === 0;
                case "custom": {
                    const interval = medicine.repeatInterval || 1;
                    return diffDays % interval === 0;
                }
                default:
                    return true;
            }
        };

        const processMedicineForSelectedDate = (medicine: Medicine): DoseListItem[] => {
            if (!isMedicineScheduledForDate(medicine, selectedDateStr, isPastSelected, isTodaySelected)) {
                return [];
            }

            return medicine.schedule.map((time) => {
                const isTaken = logs.some(
                    (log) => log.medicineId === medicine.id && log.date === selectedDateStr && log.time === time
                );

                let status: DoseStatus = "upcoming";

                if (isTaken) {
                    status = "taken";
                } else if (isTodaySelected) {
                    const doseTime = parse(time, "HH:mm", selectedDate);
                    status = isBefore(doseTime, now) ? "missed" : "upcoming";
                } else if (isPastSelected) {
                    status = "missed";
                }

                return { medicine, time, status };
            });
        };

        const logsForSelectedDay = logs
            .filter((log) => log.status === "taken" && log.date === selectedDateStr)
            .map((log) => {
                const medicine = medicines.find((med) => med.id === log.medicineId);
                return medicine ? { log, medicine } : null;
            })
            .filter(Boolean) as LogListItem[];

        logsForSelectedDay.sort((a, b) => {
            const timeCompare = a.log.time.localeCompare(b.log.time);
            if (timeCompare !== 0) return timeCompare;
            return new Date(a.log.createdAt).getTime() - new Date(b.log.createdAt).getTime();
        });

        const allScheduledItems: DoseListItem[] = [];
        medicines.forEach((medicine) => {
            allScheduledItems.push(...processMedicineForSelectedDate(medicine));
        });

        const missedForSelectedDay = allScheduledItems
            .filter((item) => item.status === "missed")
            .sort((a, b) => a.time.localeCompare(b.time));

        const upcomingItems = allScheduledItems
            .filter((item) => item.status === "upcoming")
            .sort((a, b) => a.time.localeCompare(b.time));

        let nextForSelectedDay: DoseListItem[] = [];
        let laterForSelectedDay: DoseListItem[];

        // ✅ FIX: Only single out the "next" dose if the user is viewing TODAY.
        if (isTodaySelected) {
            const nextTimeStr = upcomingItems.length > 0 ? upcomingItems[0].time : null;

            nextForSelectedDay = nextTimeStr
                ? upcomingItems
                    .filter((item) => item.time === nextTimeStr)
                    .map((item) => ({ ...item, status: "next" as DoseStatus }))
                : [];

            laterForSelectedDay = nextTimeStr
                ? upcomingItems.filter((item) => item.time !== nextTimeStr)
                : upcomingItems;
        } else {
            // ✅ For future days, all doses are just "upcoming" and should be rendered together
            // in the "Upcoming" section (which is always visible in the UI).
            laterForSelectedDay = upcomingItems;
        }

        return {
            selectedDateStr,
            isTodaySelected,
            weekDates,
            selectedDate,
            currentToday,
            getDayLabel,
            getShortDayLabel,
            getDateLabel,
            logsForSelectedDay,
            missedForSelectedDay,
            nextForSelectedDay,
            laterForSelectedDay,
        };
    }, [medicines, logs, selectedDate, currentToday, t, dateLocale, weekDates, nowTick]);

    return {
        ...scheduleData,
        isLoading,
        scrollContainerRef,
        setSelectedDate,
        logDose,
        unlogDose,
    };
}
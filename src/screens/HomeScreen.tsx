import { useTranslation } from "react-i18next";
import WeeklyCalendar from "./HomeScreen/components/WeeklyCalendar";
import ScheduleSection from "./HomeScreen/components/ScheduleSection";
import HomeSkeleton from "./HomeScreen/components/HomeSkeleton";
import EmptyState from "./HomeScreen/components/EmptyState";
import { useMedicineSchedule } from "./HomeScreen/useMedicineSchedule";

export default function HomeScreen() {
    const { t } = useTranslation("common");
    const {
        selectedDateStr,
        isTodaySelected,
        weekDates,
        selectedDate,
        getShortDayLabel,
        getDateLabel,
        logsForSelectedDay,
        missedForSelectedDay,
        nextForSelectedDay,
        laterForSelectedDay,
        isLoading,
        scrollContainerRef,
        setSelectedDate,
        logDose,
        unlogDose,
        currentToday
    } = useMedicineSchedule();

    const hasData =
        logsForSelectedDay.length > 0 ||
        missedForSelectedDay.length > 0 ||
        nextForSelectedDay.length > 0 ||
        laterForSelectedDay.length > 0;

    return (
        <div ref={scrollContainerRef} className="h-full min-h-0 overflow-y-auto scrollbar-none overscroll-y-none py-20">
            <WeeklyCalendar
                weekDates={weekDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                getShortDayLabel={getShortDayLabel}
                getDateLabel={getDateLabel}
                currentToday={currentToday} // ✅ Added
            />

            <div className="flex flex-col gap-y-0.5 px-5 py-4">
                {isLoading ? (
                    <HomeSkeleton />
                ) : (
                    <>
                        {/* 1. Missed Section */}
                        <ScheduleSection
                            title={t("home.missed")}
                            variant="destructive"
                            dateStr={selectedDateStr}
                            items={missedForSelectedDay}
                            showAction
                            onTake={logDose}
                            onUndo={unlogDose}
                        />

                        {/* 2. Next Section — ✅ Now visible for ANY day with upcoming items */}
                        <ScheduleSection
                            title={t("home.next")}
                            variant="warning"
                            dateStr={selectedDateStr}
                            items={nextForSelectedDay}
                            showAction
                            onTake={logDose}
                            onUndo={unlogDose}
                        />

                        {/* 3. Later / Upcoming Section */}
                        <ScheduleSection
                            title={isTodaySelected ? t("home.restOfToday") : t("home.upcoming")}
                            dateStr={selectedDateStr}
                            items={laterForSelectedDay}
                            showAction
                            onTake={logDose}
                            onUndo={unlogDose}
                        />

                        {/* 4. Logs Section */}
                        <ScheduleSection
                            title={t("home.logs")}
                            variant="secondary"
                            dateStr={selectedDateStr}
                            items={logsForSelectedDay}
                            isLogs
                            showAction
                            onUndo={unlogDose}
                        />

                        {!hasData && <EmptyState />}
                    </>
                )}
            </div>
        </div>
    );
}
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
        currentToday, // ✅ Make sure this is destructured
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
                currentToday={currentToday}
                onSelectDate={setSelectedDate}
                getShortDayLabel={getShortDayLabel}
                getDateLabel={getDateLabel}
            />

            <div className="flex flex-col gap-y-0.5 px-5 py-4">
                {isLoading ? (
                    <HomeSkeleton />
                ) : (
                    <>
                        <ScheduleSection
                            title={t("home.missed")}
                            variant="destructive"
                            dateStr={selectedDateStr}
                            items={missedForSelectedDay}
                            showAction
                            currentToday={currentToday} // ✅ Added
                            onTake={logDose}
                            onUndo={unlogDose}
                        />

                        {isTodaySelected && (
                            <ScheduleSection
                                title={t("home.next")}
                                variant="warning"
                                dateStr={selectedDateStr}
                                items={nextForSelectedDay}
                                showAction
                                currentToday={currentToday} // ✅ Added
                                onTake={logDose}
                                onUndo={unlogDose}
                            />
                        )}

                        <ScheduleSection
                            title={isTodaySelected ? t("home.restOfToday") : t("home.upcoming")}
                            dateStr={selectedDateStr}
                            items={laterForSelectedDay}
                            showAction
                            currentToday={currentToday} // ✅ Added
                            onTake={logDose}
                            onUndo={unlogDose}
                        />

                        <ScheduleSection
                            title={t("home.logs")}
                            variant="secondary"
                            dateStr={selectedDateStr}
                            items={logsForSelectedDay}
                            isLogs
                            showAction
                            currentToday={currentToday} // ✅ Added
                            onUndo={unlogDose}
                        />

                        {!hasData && <EmptyState />}
                    </>
                )}
            </div>
        </div>
    );
}
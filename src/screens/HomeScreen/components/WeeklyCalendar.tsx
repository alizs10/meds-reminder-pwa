import { cn } from "@/lib/util";
import { isSameDay } from "date-fns";
import { Typography } from "@/components/ui/Typography";
import Button from "@/components/ui/Button";

interface WeeklyCalendarProps {
    weekDates: Date[];
    selectedDate: Date;
    currentToday: Date; // ✅ Added
    onSelectDate: (date: Date) => void;
    getShortDayLabel: (date: Date) => string;
    getDateLabel: (date: Date) => string;
}

export default function WeeklyCalendar({
    weekDates,
    selectedDate,
    currentToday, // ✅ Added
    onSelectDate,
    getShortDayLabel,
    getDateLabel,
}: WeeklyCalendarProps) {
    return (
        <div className="sticky top-0 z-40 mx-5 flex gap-0 p-1.5 rounded-3xl app_container app_gradient app-blur">
            {weekDates.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const isTodayDate = isSameDay(date, currentToday); // ✅ Use internal clock

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
                                isSelected ? "text-primary" : "text-muted-foreground"
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
                            {getDateLabel(date)}
                        </Typography>
                        {isTodayDate && !isSelected && (
                            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
                        )}
                    </Button>
                );
            })}
        </div>
    );
}
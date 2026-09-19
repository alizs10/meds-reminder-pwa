import Badge from "@/components/ui/Badge";
import MedicineDoseItem from "./MedicineDoseItem";
import type { DoseListItem, LogListItem } from "../types";

interface ScheduleSectionProps {
    title: string;
    variant?: "default" | "secondary" | "destructive" | "warning" | "outline";
    dateStr: string;
    items: DoseListItem[] | LogListItem[];
    isLogs?: boolean;
    showAction: boolean;
    currentToday?: Date; // ✅ Added
    onTake?: (medicineId: string, date: string, time: string) => Promise<void> | void;
    onUndo?: (medicineId: string, date: string, time: string) => Promise<void> | void;
}

export default function ScheduleSection({
    title,
    variant,
    dateStr,
    items,
    isLogs = false,
    showAction,
    currentToday, // ✅ Added
    onTake,
    onUndo,
}: ScheduleSectionProps) {
    if (items.length === 0) return null;

    return (
        <section className="flex flex-col gap-3">
            <Badge variant={variant} className="sticky top-20 z-30 mx-auto">
                {title}
            </Badge>
            <div className="flex flex-col gap-2">
                {isLogs
                    ? (items as LogListItem[]).map(({ log, medicine }) => (
                        <MedicineDoseItem
                            key={log.id}
                            medicine={medicine}
                            time={log.time}
                            dateStr={dateStr}
                            status="taken"
                            showAction={showAction}
                            takenAt={log.createdAt}
                            currentToday={currentToday} // ✅ Added
                            onUndo={onUndo}
                        />
                    ))
                    : (items as DoseListItem[]).map((item) => (
                        <MedicineDoseItem
                            key={`${item.medicine.id}-${item.time}`}
                            medicine={item.medicine}
                            time={item.time}
                            dateStr={dateStr}
                            status={item.status}
                            showAction={showAction}
                            currentToday={currentToday} // ✅ Added
                            onTake={onTake}
                            onUndo={onUndo}
                        />
                    ))}
            </div>
            <div className="h-7 w-full" />
        </section>
    );
}
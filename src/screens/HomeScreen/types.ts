import type { Medicine, MedicineLog } from "@/db";

export type DoseStatus = "taken" | "missed" | "next" | "upcoming";

export interface DoseListItem {
    medicine: Medicine;
    time: string;
    status: DoseStatus;
}

export interface LogListItem {
    log: MedicineLog;
    medicine: Medicine;
}

export interface ScheduleData {
    selectedDateStr: string;
    isTodaySelected: boolean;
    weekDates: Date[];
    selectedDate: Date;
    currentToday: Date; // ✅ Added
    getDayLabel: (date: Date) => string;
    getShortDayLabel: (date: Date) => string;
    getDateLabel: (date: Date) => string;
    logsForSelectedDay: LogListItem[];
    missedForSelectedDay: DoseListItem[];
    nextForSelectedDay: DoseListItem[];
    laterForSelectedDay: DoseListItem[];
}

export interface MedicineDoseItemProps {
    medicine: Medicine;
    time: string;
    dateStr: string;
    status?: DoseStatus;
    showAction?: boolean;
    takenAt?: string;
    currentToday?: Date; // ✅ Added
    onTake?: (medicineId: string, date: string, time: string) => Promise<void> | void;
    onUndo?: (medicineId: string, date: string, time: string) => Promise<void> | void;
}
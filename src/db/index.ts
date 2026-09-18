import Dexie, { type Table } from 'dexie';

export interface Profile {
    id?: string;
    name?: string;
    birthdate?: string;
    avatar?: Blob | null;
    createdAt: string;
    updatedAt: string;
}

export type RepeatType = "daily" | "everyOtherDay" | "weekly" | "custom";

export interface Medicine {
    id?: string;
    name: string;
    dosage: string;
    color: string;
    schedule: string[];
    instructions?: string;
    startDate: string;
    endDate?: string;
    isActive: boolean;
    repeatType: RepeatType;
    repeatInterval?: number;
    createdAt: string;
    updatedAt: string;
}

export interface MedicineLog {
    id?: string;
    medicineId: string;
    date: string;
    time: string;
    status: 'taken' | 'missed';
    takenAt: string;
    createdAt: string;
}

// ✅ Moved types here so both DB and Store can share them
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'fa';
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Settings {
    id: string; // We will use "app_settings" as the single row ID
    theme: Theme;
    language: Language;
    weekStartsOn: WeekStartDay;
    updatedAt: string;
}

export class MedsReminderDB extends Dexie {
    profile!: Table<Profile, string>;
    medicines!: Table<Medicine, string>;
    logs!: Table<MedicineLog, string>;
    settings!: Table<Settings, string>; // ✅ Added settings table

    constructor() {
        super('MedsReminderDB_v2');

        // ✅ Bumped to version 5 to add the settings table
        this.version(5).stores({
            profile: 'id, name',
            medicines: 'id, name, isActive, createdAt, repeatType',
            logs: 'id, medicineId, date, time, [date+time]',
            settings: 'id'
        });
    }
}

export const db = new MedsReminderDB();
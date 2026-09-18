import { create } from "zustand";
import { db, type MedicineLog } from "@/db";
import { generateId } from "@/lib/util";

interface LogState {
    logs: MedicineLog[];
    isLoading: boolean;

    initialize: () => Promise<void>;

    logDose: (
        medicineId: string,
        date: string,
        time: string
    ) => Promise<void>;

    unlogDose: (
        medicineId: string,
        date: string,
        time: string
    ) => Promise<void>;
}

export const useLogStore = create<LogState>((set, get) => ({
    logs: [],
    isLoading: true,

    initialize: async () => {
        set({ isLoading: true });

        try {
            const allLogs = await db.logs.toArray();

            set({
                logs: allLogs,
                isLoading: false,
            });
        } catch (error) {
            console.error("Failed to load logs", error);

            set({
                isLoading: false,
            });
        }
    },

    logDose: async (medicineId, date, time) => {
        /*
         * Prevent duplicate logs for the same scheduled dose.
         */
        const existingLog = get().logs.find(
            (log) =>
                log.medicineId === medicineId &&
                log.date === date &&
                log.time === time
        );

        if (existingLog) {
            return;
        }

        const now = new Date().toISOString();

        const log: MedicineLog = {
            id: generateId(),
            medicineId,
            date,
            time,
            status: "taken",
            takenAt: now,
            createdAt: now,
        };

        await db.logs.add(log);

        set((state) => ({
            logs: [...state.logs, log],
        }));
    },

    unlogDose: async (medicineId, date, time) => {
        const logToRemove = get().logs.find(
            (log) =>
                log.medicineId === medicineId &&
                log.date === date &&
                log.time === time
        );

        if (!logToRemove?.id) {
            return;
        }

        await db.logs.delete(logToRemove.id);

        set((state) => ({
            logs: state.logs.filter(
                (log) => log.id !== logToRemove.id
            ),
        }));
    },
}));
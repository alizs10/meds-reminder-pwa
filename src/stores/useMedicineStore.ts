import { create } from 'zustand';
import { db, type Medicine } from '@/db';
import { generateId } from '@/lib/util';

interface MedicineState {
    medicines: Medicine[];
    isLoading: boolean;
    isInitialized: boolean;

    initialize: () => Promise<void>;
    addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateMedicine: (id: string, data: Partial<Medicine>) => Promise<void>;
    deleteMedicine: (id: string) => Promise<void>;
    togglePauseMedicine: (id: string) => Promise<void>;
}

export const useMedicineStore = create<MedicineState>((set, get) => ({
    medicines: [],
    isLoading: true,
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true });
        try {
            const medicines = await db.medicines.toArray();
            set({ medicines, isLoading: false, isInitialized: true });
        } catch (error) {
            console.error("Failed to initialize medicines:", error);
            set({ isLoading: false, isInitialized: true });
        }
    },

    addMedicine: async (data) => {
        const now = new Date().toISOString();
        const id = generateId(); // ✅ Use the robust generator
        const newMedicine: Medicine = { ...data, id, createdAt: now, updatedAt: now };

        await db.medicines.add(newMedicine);
        set((state) => ({ medicines: [...state.medicines, newMedicine] }));
    },

    updateMedicine: async (id, data) => {
        const now = new Date().toISOString();
        await db.medicines.update(id, { ...data, updatedAt: now });

        set((state) => ({
            medicines: state.medicines.map((m) =>
                m.id === id ? { ...m, ...data, updatedAt: now } : m
            ),
        }));
    },

    deleteMedicine: async (id) => {
        await db.medicines.delete(id);
        set((state) => ({
            medicines: state.medicines.filter((m) => m.id !== id),
        }));
    },

    togglePauseMedicine: async (id) => {
        const medicine = get().medicines.find((m) => m.id === id);
        if (!medicine) return;

        const isActive = !medicine.isActive;
        const now = new Date().toISOString();

        await db.medicines.update(id, { isActive, updatedAt: now });
        set((state) => ({
            medicines: state.medicines.map((m) =>
                m.id === id ? { ...m, isActive, updatedAt: now } : m
            ),
        }));
    },
}));
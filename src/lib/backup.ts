import { db, type Medicine, type MedicineLog, type Profile, type Settings } from "@/db";

const LOCAL_STORAGE_KEYS = ['meds-reminder-app', 'meds-reminder-settings'];

// Helper to convert Blob to base64 string
async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Helper to convert base64 string back to Blob
function base64ToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)![1];
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Type for serialized profile (avatar is base64 string instead of Blob)
interface SerializedProfile extends Omit<Profile, 'avatar'> {
    avatar: string | null;
}

async function clearAllData() {
    await db.transaction('rw', [db.profile, db.medicines, db.logs, db.settings], async () => {
        await db.profile.clear();
        await db.medicines.clear();
        await db.logs.clear();
        await db.settings.clear();
    });

    LOCAL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
}

export async function exportUserData(username?: string) {
    const profiles = await db.profile.toArray();
    const medicines = await db.medicines.toArray();
    const logs = await db.logs.toArray();
    const settings = await db.settings.toArray();

    // ✅ Convert avatar Blobs to base64 strings
    const serializedProfiles: SerializedProfile[] = await Promise.all(
        profiles.map(async (profile) => {
            const { avatar, ...rest } = profile;
            return {
                ...rest,
                avatar: avatar ? await blobToBase64(avatar) : null,
            };
        })
    );

    const localStorageData: Record<string, unknown> = {};
    LOCAL_STORAGE_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                localStorageData[key] = JSON.parse(value);
            } catch {
                localStorageData[key] = value;
            }
        }
    });

    const payload = {
        meta: {
            version: 1,
            exportDate: new Date().toISOString(),
            appName: "Meds Reminder",
        },
        indexedDB: {
            profile: serializedProfiles, // ✅ Use serialized profiles
            medicines,
            logs,
            settings,
        },
        localStorage: localStorageData,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0];
    const baseName = username ? username.toLowerCase().replace(/\s+/g, "-") : 'meds-reminder';
    const filename = `${baseName}-backup-${dateStr}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function importUserData(file: File) {
    const text = await file.text();

    let data: unknown;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error("The file is not a valid JSON.");
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error("Invalid backup format: Root must be a JSON object.");
    }

    const backup = data as Record<string, unknown>;

    if (typeof backup.indexedDB !== 'object' || backup.indexedDB === null || Array.isArray(backup.indexedDB)) {
        throw new Error("Invalid backup format: Missing or malformed 'indexedDB' object.");
    }

    const dbData = backup.indexedDB as Record<string, unknown>;
    const lsData = (backup.localStorage || {}) as Record<string, unknown>;

    const expectedTables = ['profile', 'medicines', 'logs', 'settings'];
    for (const table of expectedTables) {
        const tableData = dbData[table];
        if (tableData !== undefined && !Array.isArray(tableData)) {
            throw new Error(`Invalid backup format: 'indexedDB.${table}' must be an array.`);
        }
    }

    await clearAllData();

    // ✅ Convert base64 strings back to Blobs
    const deserializedProfiles: Profile[] = (dbData.profile as SerializedProfile[] || []).map((profile) => {
        const { avatar, ...rest } = profile;
        return {
            ...rest,
            avatar: avatar ? base64ToBlob(avatar) : null,
        };
    });

    await db.transaction('rw', [db.profile, db.medicines, db.logs, db.settings], async () => {
        if (deserializedProfiles.length)
            await db.profile.bulkPut(deserializedProfiles);
        if (Array.isArray(dbData.medicines) && dbData.medicines.length)
            await db.medicines.bulkPut(dbData.medicines as Medicine[]);
        if (Array.isArray(dbData.logs) && dbData.logs.length)
            await db.logs.bulkPut(dbData.logs as MedicineLog[]);
        if (Array.isArray(dbData.settings) && dbData.settings.length)
            await db.settings.bulkPut(dbData.settings as Settings[]);
    });

    for (const [key, value] of Object.entries(lsData)) {
        if (LOCAL_STORAGE_KEYS.includes(key)) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch {
                // Ignore storage quota errors
            }
        }
    }
}
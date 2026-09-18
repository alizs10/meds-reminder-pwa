import { create } from "zustand";
import { db, type Profile } from "@/db";
import { generateId } from "@/lib/util"; // ✅ Import the robust ID generator

interface ProfileState {
  profile: Profile | null;
  avatarUrl: string | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  updateProfile: (
    data: Partial<Omit<Profile, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  calculateAge: () => number | null;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  avatarUrl: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    try {
      const profile = (await db.profile.toCollection().first()) ?? null;

      let avatarUrl: string | null = null;
      if (profile?.avatar) {
        avatarUrl = await blobToDataUrl(profile.avatar);
      }

      set({ profile, avatarUrl, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error("Failed to initialize profile:", error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  updateProfile: async (data) => {
    const { profile, avatarUrl: currentAvatarUrl } = get();
    const now = new Date().toISOString();

    const isAvatarChanging = "avatar" in data;

    if (profile?.id) {
      await db.profile.update(profile.id, {
        ...data,
        updatedAt: now,
      });
    } else {
      await db.profile.add({
        id: generateId(), // ✅ FIX: Explicitly generate ID for new profile
        ...data,
        createdAt: now,
        updatedAt: now,
      } as Profile);
    }

    let updatedProfile: Profile | null;
    let newAvatarUrl: string | null;

    if (isAvatarChanging) {
      updatedProfile = (await db.profile.toCollection().first()) ?? null;

      if (updatedProfile?.avatar) {
        newAvatarUrl = await blobToDataUrl(updatedProfile.avatar);
      } else {
        newAvatarUrl = null;
      }
    } else {
      updatedProfile = profile
        ? { ...profile, ...data, updatedAt: now }
        : ((await db.profile.toCollection().first()) ?? null);

      newAvatarUrl = currentAvatarUrl;
    }

    set({ profile: updatedProfile, avatarUrl: newAvatarUrl });
  },

  calculateAge: () => {
    const { profile } = get();
    if (!profile?.birthdate) return null;

    const birthdate = new Date(profile.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthdate.getDate())
    ) {
      age--;
    }

    return age;
  },
}));
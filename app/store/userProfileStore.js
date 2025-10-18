"use client";
import { create } from "zustand";

export const useProfileStore = create((set) => ({
    profile: null, // { id, email, company?, ... }
    setProfile: (profile) => set({ profile }),
    clearProfile: () => set({ profile: null }),
}));

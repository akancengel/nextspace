"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useProfileStore } from "@/app/store/userProfileStore";

export default function Dashboard() {
    const { user, loadProfile, loading } = useAuth(); // context'ten temel user + loadProfile
    const { profile, setProfile, clearProfile } = useProfileStore(); // global store

    const [fetchingProfile, setFetchingProfile] = useState(false);

    // Eğer oturum varsa ve store'da detaylı profil yoksa, yükle ve store'a koy
    useEffect(() => {
        let mounted = true;
        const fetchAndStore = async () => {
            if (!user?.id) return;
            if (profile && profile.id === user.id) return; // zaten yüklü

            setFetchingProfile(true);
            try {
                const full = await loadProfile(user.id);
                if (mounted && full) {
                    setProfile(full);
                }
            } catch (e) {
                console.error("Dashboard loadProfile hata:", e);
            } finally {
                if (mounted) setFetchingProfile(false);
            }
        };

        if (user) {
            fetchAndStore();
        } else {
            // logout olmuşsa store'u temizle
            clearProfile();
        }

        return () => {
            mounted = false;
        };
    }, [user?.id]); // loadProfile ve store fonksiyonları stable olması gerekir

    const activeUser = profile || user;

    if (loading) return <p>Yükleniyor...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            <div className="space-y-2">
                <p><strong>Ad Soyad:</strong> {activeUser?.full_name}</p>
                <p><strong>E-posta:</strong> {activeUser?.email}</p>
                <p><strong>Şirket:</strong> {fetchingProfile ? "" : (activeUser?.company?.name)}</p>
            </div>
        </div>
    );
}

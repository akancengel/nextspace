"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // fetchProfile: users tablosundan tüm alanları çeker ve company_id varsa companies tablosundan company ekler
    const fetchProfile = async (userId) => {
        if (!userId) return null;
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();
            if (error) {
                console.error("Profil çekme hatası:", error);
                return null;
            }

            // Eğer kullanıcıda company_id varsa, companies tablosundan ilgili şirketi al
            if (data?.company_id) {
                try {
                    const { data: companyData, error: companyError } = await supabase
                        .from("companies")
                        .select("*")
                        .eq("id", data.company_id)
                        .single();

                    if (companyError) {
                        console.error("Company çekme hatası:", companyError);
                        // company bilgisi alınamazsa yine de kullanıcı verisini döndür
                        return data;
                    }

                    // company bilgisini kullanıcı objesine ekle
                    return { ...data, company: companyData };
                } catch (err) {
                    console.error("Company çekme beklenmedik hata:", err);
                    return data;
                }
            }

            return data;
        } catch (err) {
            console.error("Profil çekme beklenmedik hata:", err);
            return null;
        }
    };

    useEffect(() => {
        let mounted = true;

        // İlk yüklemede mevcut session'ı al ve profile'ı çek
        const init = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const currentUser = data?.session?.user;
                if (currentUser) {
                    const profile = await fetchProfile(currentUser.id);
                    if (mounted) setUser(profile ?? { id: currentUser.id, email: currentUser.email });
                } else {
                    if (mounted) setUser(null);
                }
            } catch (err) {
                console.error("Session init hatası:", err);
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        init();

        // Auth değişikliklerini dinle; login olunca profile'ı çek
        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const sessUser = session?.user;
            if (sessUser) {
                const profile = await fetchProfile(sessUser.id);
                if (mounted) setUser(profile ?? { id: sessUser.id, email: sessUser.email });
            } else {
                if (mounted) setUser(null);
            }
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            // cleanup listener
            try {
                if (listener?.subscription?.unsubscribe) listener.subscription.unsubscribe();
                else if (typeof listener?.unsubscribe === "function") listener.unsubscribe();
            } catch (e) {
                // ignore
            }
        };
    }, []);

    // value içine setUser ekledim
    const value = { user, setUser, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Kolay erişim hook'u
export function useAuth() {
    return useContext(AuthContext);
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Kullanıcı profilini çek
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

            if (data?.company_id) {
                const { data: companyData, error: companyError } = await supabase
                    .from("companies")
                    .select("*")
                    .eq("id", data.company_id)
                    .single();

                if (!companyError && companyData) {
                    return { ...data, company: companyData };
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

        // init: getUser() dönüşünü güvenli kullan
        const init = async () => {
            try {
                const res = await supabase.auth.getUser();
                const currentUser = res?.data?.user ?? null; // güvenli erişim

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
                if (mounted) setLoading(false); // kesinlikle false yap
            }
        };

        init();

        // Auth değişikliklerini dinle
        const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                const sessUser = session?.user;
                if (sessUser) {
                    const profile = await fetchProfile(sessUser.id);
                    if (mounted) setUser(profile ?? { id: sessUser.id, email: sessUser.email });
                } else {
                    if (mounted) setUser(null);
                }
            } catch (e) {
                console.error("onAuthStateChange handler error:", e);
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            // cleanup listener: farklı SDK dönüş şekillerine karşı güvenli unsubscribe
            try {
                if (authListener?.subscription?.unsubscribe) authListener.subscription.unsubscribe();
                else if (authListener?.data?.subscription?.unsubscribe) authListener.data.subscription.unsubscribe();
                else if (typeof authListener?.unsubscribe === "function") authListener.unsubscribe();
            } catch (e) {
                // ignore
            }
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

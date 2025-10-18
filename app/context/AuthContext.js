"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔹 Kullanıcının profilini (users + companies) çeken yardımcı fonksiyon
    const loadProfile = async (userId) => {
        try {
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            if (userError) {
                console.error("Kullanıcı profili hatası:", userError);
                return null;
            }

            let profile = userData;

            if (profile?.company_id) {
                const { data: companyData, error: companyError } = await supabase
                    .from("companies")
                    .select("*")
                    .eq("id", profile.company_id)
                    .single();

                if (!companyError && companyData) {
                    profile = { ...profile, company: companyData };
                }
            }

            return profile;
        } catch (err) {
            console.error("loadProfile beklenmedik hata:", err);
            return null;
        }
    };

    // 🔹 İlk yüklemede session al
    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getSession();
            const sessionUser = data?.session?.user;

            if (sessionUser) {
                setUser({ id: sessionUser.id, email: sessionUser.email, _basic: true });
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        init();
    }, []);

    // 🔹 Context değeri
    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Sign out error:", err);
            // hata olsa da client state'i temizleyelim
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        setUser,       // ✅ artık dışa aktarılıyor
        loading,
        loadProfile,   // ✅ login-form.js bunu kullanıyor
        signOut,       // ✅ signOut eklendi
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext();

/*
  Hedef:
  - İlk açılışta hızlıca temel kullanıcı bilgisi (id,email) sağla.
  - onAuthStateChange listener'ını kaldır (websocket açımını önle).
  - Detaylı profil (users + companies) sadece talep edildiğinde loadProfile ile çekilsin.
  - Opsiyonel: localStorage ile basit cache desteği.
*/

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // user: null | basic | full profile (may include company)
    const [loading, setLoading] = useState(true);
    const CACHE_KEY_BASIC = "ns_user_basic";
    const CACHE_KEY_PROFILE = "ns_user_profile";

    // localStorage destek kontrolü
    const hasLocal = typeof window !== "undefined" && !!window.localStorage;

    // Hızlı: users tablosuna gitmeden sadece auth'tan temel kullanıcıyı al
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                // 1) Eğer cache varsa hızlıca getir (opsiyonel)
                if (hasLocal) {
                    try {
                        const cachedBasic = localStorage.getItem(CACHE_KEY_BASIC);
                        if (cachedBasic) {
                            const parsed = JSON.parse(cachedBasic);
                            if (mounted) setUser(parsed); // hızlı gösterim (basic)
                        }
                    } catch (e) {
                        // cache parse başarısızsa yoksayı
                    }
                }

                // 2) Supabase auth'dan güncel user'ı al (sadece id,email)
                const res = await supabase.auth.getUser();
                const currentUser = res?.data?.user ?? null;

                if (currentUser) {
                    // temel user objesi
                    const basic = { id: currentUser.id, email: currentUser.email, _basic: true };
                    if (mounted) setUser(basic);
                    if (hasLocal) {
                        try {
                            localStorage.setItem(CACHE_KEY_BASIC, JSON.stringify(basic));
                            // temiz eski profile cache çünkü temel user değişmiş olabilir
                            localStorage.removeItem(CACHE_KEY_PROFILE);
                        } catch (e) { /* ignore storage errors */ }
                    }
                } else {
                    // oturum yok -> temizle
                    if (mounted) {
                        setUser(null);
                        if (hasLocal) {
                            try {
                                localStorage.removeItem(CACHE_KEY_BASIC);
                                localStorage.removeItem(CACHE_KEY_PROFILE);
                            } catch (e) { }
                        }
                    }
                }
            } catch (err) {
                console.error("Auth init hatası:", err);
                if (mounted) setUser(null);
            } finally {
                // Çok kısa tutulacak: navbar vb. hemen render edebilsin
                if (mounted) setLoading(false);
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, []); // onAuthStateChange kullanılmıyor

    // loadProfile: users + companies verisini çek ve context.user olarak set et
    // Eğer userId verilmezse mevcut basic user.id üzerinden çalışır.
    const loadProfile = async (userId) => {
        const id = userId ?? user?.id;
        if (!id) return null;

        try {
            // Önce cache kontrolü (opsiyonel)
            if (hasLocal) {
                const cachedProfile = localStorage.getItem(CACHE_KEY_PROFILE);
                if (cachedProfile) {
                    try {
                        const parsed = JSON.parse(cachedProfile);
                        if (parsed?.id === id) {
                            setUser(parsed);
                            return parsed;
                        }
                    } catch (e) { /* ignore parse errors */ }
                }
            }

            // Users tablosundan detay çek
            const { data: profileData, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("id", id)
                .single();

            if (profileError) {
                console.error("Profil çekme hatası:", profileError);
                return null;
            }

            let profile = profileData;

            // Eğer company_id varsa companies tablosundan al
            if (profile?.company_id) {
                try {
                    const { data: companyData, error: companyError } = await supabase
                        .from("companies")
                        .select("*")
                        .eq("id", profile.company_id)
                        .single();

                    if (!companyError && companyData) {
                        profile = { ...profile, company: companyData };
                    }
                } catch (e) {
                    console.error("Company fetch error:", e);
                }
            }

            // profile'ı context'e ve cache'e koy
            const fullProfile = { ...profile, _basic: false };
            setUser(fullProfile);

            if (hasLocal) {
                try {
                    localStorage.setItem(CACHE_KEY_PROFILE, JSON.stringify(fullProfile));
                    // basic cache'i güncelle
                    const basic = { id: fullProfile.id, email: fullProfile.email, _basic: true };
                    localStorage.setItem(CACHE_KEY_BASIC, JSON.stringify(basic));
                } catch (e) { /* ignore storage errors */ }
            }

            return fullProfile;
        } catch (err) {
            console.error("loadProfile hata:", err);
            return null;
        }
    };

    // clear cached and context user (ör. logout)
    const clearUser = () => {
        setUser(null);
        if (hasLocal) {
            try {
                localStorage.removeItem(CACHE_KEY_BASIC);
                localStorage.removeItem(CACHE_KEY_PROFILE);
            } catch (e) {}
        }
    };

    // yeni: signOut wrapper - supabase'ten çıkış yap ve context'i temizle
    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Sign out error:", err);
            // yine de local state'i temizle (UI güncellemesi için)
        } finally {
            clearUser();
        }
    };

    // value: temel user, setUser (manual override), loadProfile fonksiyonu, clearUser, loading, signOut
    const value = {
        user,
        setUser,
        loading,
        loadProfile,
        clearUser,
        signOut, // ...ekledim
    };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}

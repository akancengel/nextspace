"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";
import { useProfileStore } from "@/app/store/userProfileStore";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const router = useRouter();
    const { setUser, loadProfile } = useAuth();
    const setProfile = useProfileStore((state) => state.setProfile);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });

            if (error) {
                alert("Hata: " + error.message);
                return;
            }

            const userId = data?.user?.id;
            if (!userId) {
                alert("Kullanıcı ID alınamadı.");
                return;
            }

            // 🔹 1. Profil (users + companies) verisini çek
            const profile = await loadProfile(userId);

            // 🔹 2. Context ve Global Store’a kaydet
            if (profile) {
                setUser(profile);
                setProfile(profile);
            } else {
                // Profil bulunamazsa basic kullanıcıyı ekle
                const basic = { id: userId, email: data.user.email, _basic: true };
                setUser(basic);
                setProfile(basic);
            }

            // 🔹 3. Dashboard’a yönlendir
            router.push("/dashboard");

        } catch (err) {
            console.error("Login hata:", err);
            alert("Beklenmedik bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input
                type="email"
                placeholder="E-posta"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
            />
            <input
                type="password"
                placeholder="Şifre"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
        </form>
    );
}

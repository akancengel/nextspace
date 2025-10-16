"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const router = useRouter();
    const { setUser } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        });

        setLoading(false);

        if (error) {
            alert("Hata: " + error.message);
        } else {
            try {
                const userId = data?.user?.id;
                if (userId) {
                    const { data: profile, error: profileError } = await supabase
                        .from("users")
                        .select("*")
                        .eq("id", userId)
                        .single();

                    if (profileError) {
                        console.warn("Profil çekme hatası:", profileError);
                        setUser({ id: userId, email: data.user.email });
                    } else {
                        setUser(profile);
                    }
                }
            } catch (err) {
                console.error("Profil setleme hatası:", err);
            }

            router.push("/dashboard"); // Giriş sonrası dashboard’a yönlendir
        }
    };

    return (
        <form onSubmit={handleLogin} className="flex flex-col gap-3 max-w-md mx-auto mt-10">
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
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 rounded-md"
            >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
        </form>
    );
}

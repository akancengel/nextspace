"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert("Çıkış yapılamadı: " + error.message);
        } else {
            router.push("/login"); // Çıkış sonrası login sayfasına yönlendir
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded-md"
        >
            Çıkış Yap
        </button>
    );
}

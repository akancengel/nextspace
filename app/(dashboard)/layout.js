"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AuthProvider } from "@/app/context/AuthContext";


export default function DashboardLayout({ children }) {

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                router.push("/login");
            } else {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    if (loading) return null;

    return <AuthProvider>{children}</AuthProvider>;
}

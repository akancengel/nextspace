"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginWrapper({ children }) {

    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
                router.push("/login");
            } else {
                setLoading(false);
            }
        });
    }, []);

    if (loading) return <p>Yükleniyor...</p>;
    return <>{children}</>;
}

"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <nav style={{ display: "flex", gap: "12px", padding: "10px" }}>
                <span>Yükleniyor...</span>
            </nav>
        );
    }

    return (
        <nav style={{ display: "flex", gap: "12px", padding: "10px" }}>
            
            <Link href="/" style={{ fontWeight: "bold" }}>Netspace</Link>

            {!user && <Link href="/login">Giriş Yap</Link>}
            {!user && <Link href="/register">Kayıt Ol</Link>}
            {user && <Link href="/dashboard">Dashboard</Link>}
            
        </nav>
    );
}

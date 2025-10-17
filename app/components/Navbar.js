"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <nav style={{ display: "flex", gap: "12px", padding: "10px" }}>
                <span>Yükleniyor...</span>
            </nav>
        );
    }

    const handleSignOut = async () => {
        try {
            await signOut();
        } finally {
            router.push("/");
        }
    };

    return (
        <nav style={{ display: "flex", gap: "12px", padding: "10px" }}>
            <Link href="/" style={{ fontWeight: "bold" }}>Netspace</Link>

            {!user && <Link href="/login">Giriş Yap</Link>}
            {!user && <Link href="/register">Kayıt Ol</Link>}
            {user && <Link href="/dashboard">Dashboard</Link>}

            {user && (
                <button onClick={handleSignOut} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                    Çıkış Yap
                </button>
            )}
        </nav>
    );
}

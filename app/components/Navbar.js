"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useProfileStore } from "@/app/store/userProfileStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
    const { user, loading, signOut } = useAuth();
    const { profile, clearProfile } = useProfileStore();
    const router = useRouter();

    // LOADING SCREEN
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
            clearProfile();
        } finally {
            router.push("/");
        }
    };

    const activeUser = profile || user;

    return (
        <nav style={{ display: "flex", gap: "12px", justifyContent: "space-between", padding: "24px" }}>

            <div style={{display: "flex", gap:"12px"}}>
            <Link href="/" style={{ fontWeight: "bold" }}>Netspace</Link>

            {!activeUser && <Link href="/login">Giriş Yap</Link>}
            {!activeUser && <Link href="/register">Kayıt Ol</Link>}
            {activeUser && <Link href="/dashboard">Dashboard</Link>}
            </div>

            <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
                {activeUser?.company?.name && (
                    <span style={{ fontSize: "0.95rem", color: "#333" }}>{activeUser.company.name}</span>
                )}

                {activeUser && (
                    <button onClick={handleSignOut} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                        Çıkış Yap
                    </button>
                )}
            </div>
        </nav>
    );
}

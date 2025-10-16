"use client";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function Navbar() {

    const { user, loading } = useAuth();

    if (loading) return null; // veri gelmeden önce boş dönelim

    return (
        <nav className="flex items-center justify-between p-4 bg-gray-100">

            <nav className="flex">
                <Link href="/" className="font-bold">
                    Netspace
                </Link>

                {!user && <Link href="/login">Giriş Yap</Link>}
                {!user && <Link href="/register">Kayıt Ol</Link>}
                
                <Link href="/dashboard">Dashboard</Link>
            </nav>
        </nav>
    );
}

"use client";
import Logout from "@/app/components/Logout";
import { useAuth } from "@/app/context/AuthContext";

export default function Dashboard() {
    const { user, loading } = useAuth();

    if (loading) return null;

    return (
        <div>
            <h3>Kullanıcı Bilgileri</h3>
            <p>Adı: {user?.full_name ?? user?.email}</p>
            <p>E-Mail: {user?.email}</p>
            <p>Kullanıcı ID: {user?.id}</p>
            <p>Şirket ID: {user?.company_id}</p>
            <p>Rol: {user?.role}</p>
            <hr/>
            <h3>Şirket Bilgileri</h3>
            {user?.company ? (
                <div>
                    <p>Şirket Adı: {user.company.name ?? user.company.title ?? "—"}</p>
                    <p>Şirket ID: {user.company.id ?? "—"}</p>
                    <p>Şirket E-posta: {user.company.email ?? "—"}</p>
                    <p>Adres: {user.company.address ?? "—"}</p>
                    <p>Oluşturulma: {user.company.created_at ? new Date(user.company.created_at).toLocaleString() : "—"}</p>
                </div>
            ) : (
                <p>Şirket bilgisi yok.</p>
            )}
            <Logout />
        </div>
    );
}

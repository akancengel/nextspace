"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterForm() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        companyName: "",
    });

    // yeni: hata state'leri
    const [emailError, setEmailError] = useState(null);
    const [companyError, setCompanyError] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    // yeni: e-posta kontrolü (onBlur)
    const checkEmailExists = async (email) => {
        if (!email) {
            setEmailError(null);
            return false;
        }
        try {
            const { data, error } = await supabase
                .from("users")
                .select("id")
                .eq("email", email)
                .limit(1)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("Email lookup error:", error);
                setEmailError("E-posta kontrolü yapılamadı.");
                return false;
            }

            if (data) {
                setEmailError("Bu e-posta zaten kayıtlı.");
                return true;
            }

            setEmailError(null);
            return false;
        } catch (err) {
            console.error(err);
            setEmailError("E-posta kontrolü sırasında hata.");
            return false;
        }
    };

    // yeni: şirket kontrolü (onBlur)
    const checkCompanyExists = async (companyName) => {
        if (!companyName) {
            setCompanyError(null);
            return false;
        }
        try {
            const { data, error } = await supabase
                .from("companies")
                .select("id")
                .eq("name", companyName)
                .limit(1)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("Company lookup error:", error);
                setCompanyError("Şirket kontrolü yapılamadı.");
                return false;
            }

            if (data) {
                setCompanyError("Bu şirket adı zaten kayıtlı.");
                return true;
            }

            setCompanyError(null);
            return false;
        } catch (err) {
            console.error(err);
            setCompanyError("Şirket kontrolü sırasında hata.");
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError(null);

        // submit öncesi son kontroller
        const emailExists = await checkEmailExists(form.email);
        const companyExists = await checkCompanyExists(form.companyName);

        if (emailExists || companyExists) {
            setLoading(false);
            setSubmitError("Lütfen hataları düzelttikten sonra tekrar deneyin.");
            return;
        }

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        } else {
            // Sunucudan gelen hatayı göster
            alert("Hata: " + data.error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Ad Soyad"
                value={form.fullName}
                onChange={(e) => {
                    setForm({ ...form, fullName: e.target.value });
                    setSubmitError(null);
                }}
                required
            />
            <input
                type="email"
                placeholder="E-posta"
                value={form.email}
                onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (emailError) setEmailError(null);
                    if (submitError) setSubmitError(null);
                }}
                onBlur={() => checkEmailExists(form.email)}
                required
            />
            {emailError && <p style={{ color: "red" }}>{emailError}</p>}
            <input
                type="password"
                placeholder="Şifre"
                value={form.password}
                onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (submitError) setSubmitError(null);
                }}
                required
            />
            <input
                placeholder="Firma Adı"
                value={form.companyName}
                onChange={(e) => {
                    setForm({ ...form, companyName: e.target.value });
                    if (companyError) setCompanyError(null);
                    if (submitError) setSubmitError(null);
                }}
                onBlur={() => checkCompanyExists(form.companyName)}
                required
            />
            {companyError && <p style={{ color: "red" }}>{companyError}</p>}
            {submitError && <p style={{ color: "red" }}>{submitError}</p>}
            <button
                type="submit"
                disabled={loading || !!emailError || !!companyError}
            >
                {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </button>
        </form>
    );
}

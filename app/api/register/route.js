import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
    try {
        const { fullName, email, password, companyName } = await req.json();

        // 1) Company adı daha önce kayıtlı mı?
        // Öncelikle tam eşleşme kontrolü (case-sensitive). Gerekirse ilike ile genişletilebilir.
        const { data: existingCompany, error: compErr } = await supabase
            .from("companies")
            .select("id")
            .eq("name", companyName)
            .limit(1)
            .single();

        if (compErr && compErr.code !== "PGRST116") {
            // PGRST116 = No rows found when using single(); ignore as "not found"
            console.error("Company lookup error:", compErr);
            return NextResponse.json({ success: false, error: "Şirket kontrolünde hata" }, { status: 500 });
        }

        if (existingCompany) {
            return NextResponse.json({ success: false, error: "Bu şirket adı zaten kayıtlı." }, { status: 400 });
        }

        // 2) Email zaten users tablosunda kayıtlı mı?
        const { data: existingUserByEmail, error: userLookupErr } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .limit(1)
            .single();

        if (userLookupErr && userLookupErr.code !== "PGRST116") {
            console.error("User lookup error:", userLookupErr);
            return NextResponse.json({ success: false, error: "Kullanıcı kontrolünde hata" }, { status: 500 });
        }

        if (existingUserByEmail) {
            return NextResponse.json({ success: false, error: "Bu e-posta zaten kayıtlı." }, { status: 400 });
        }

        // 3) Auth üzerinden kullanıcı oluştur
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (authError) {
            // Örn. e-posta zaten auth'de varsa buraya düşer
            console.error("Auth signup error:", authError);
            return NextResponse.json({ success: false, error: authError.message }, { status: 400 });
        }

        const user = authData.user;
        if (!user) throw new Error("Kullanıcı oluşturulamadı.");

        // 4) Yeni company oluştur
        const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .insert([{ name: companyName }])
            .select()
            .single();

        if (companyError) {
            console.error("Company insert error:", companyError);
            // Eğer company oluşturulamazsa, auth kullanıcısını silme/rollback işlemi gerekebilir (servis rolü gerektirir).
            return NextResponse.json({ success: false, error: "Şirket oluşturulamadı." }, { status: 500 });
        }

        // 5) Users tablosuna kayıt ekle
        const { error: userError } = await supabase.from("users").insert([
            {
                id: user.id, // auth.users.id ile eşleşiyor
                company_id: companyData.id,
                full_name: fullName,
                email: email,
                role: "admin",
            },
        ]);

        if (userError) {
            console.error("Users insert error:", userError);
            return NextResponse.json({ success: false, error: "Kullanıcı tablosuna kayıt eklenemedi." }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: err.message || "Bilinmeyen hata" }, { status: 500 });
    }
}

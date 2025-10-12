import { supabase } from "../../lib/supabaseClient";

export default async function About() {
    // Fetch title and description from 'nextspace' table
    const { data, error } = await supabase
        .from("nextspace")
        .select("title, description, created_at")
        .order("created_at", { ascending: false });

    return (
        <div>
            <h1>About</h1>
            <p>Bu sayfa Next.js projenizdeki About sayfasıdır.</p>

            <section style={{ marginTop: 24 }}>
                <h2>Eklenen içerikler</h2>
                {error && <div style={{ color: "#b00020" }}>Hata: {error.message}</div>}
                {!error && (!data || data.length === 0) && <div>Henüz içerik yok.</div>}

                <ul>
                    {data &&
                        data.map((row, idx) => (
                            <li key={idx} style={{ marginBottom: 12 }}>
                                <strong>{row.title}</strong>
                                <div>{row.description}</div>
                            </li>
                        ))}
                </ul>
            </section>
        </div>
    );
}

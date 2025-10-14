import SearchClient from "./SearchClient";
import { supabase } from "../../lib/supabaseClient";

export default async function About() {
    
    // Fetch title and description from 'nextspace' table as initial data
    const { data, error } = await supabase
        .from("nextspace")
        .select("title, description, created_at")
        .order("created_at", { ascending: false });

    return (
        <div>
            <h1>About</h1>
            <p>Bu sayfa Next.js projenizdeki About sayfasıdır.</p>

            <section style={{ marginTop: 24 }}>
                <h2>Arama ve içerikler</h2>
                {error && <div style={{ color: "#b00020" }}>Hata: {error.message}</div>}

                {/* Client-side search component: uses Supabase to search title/description */}
                <SearchClient initialData={data ?? []} />
            </section>
        </div>
    );
}

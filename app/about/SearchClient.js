"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SearchClient({ initialData = [] }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setResults(initialData || []);
    }, [initialData]);

    useEffect(() => {
        const handler = setTimeout(() => {
            // if empty query, show initial data
            if (!query) {
                setResults(initialData || []);
                setError(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            const doSearch = async () => {
                try {
                    // search title OR description using ilike
                    const orQuery = `title.ilike.%${query}%,description.ilike.%${query}%`;
                    const { data, error } = await supabase
                        .from("nextspace")
                        .select("title,description,created_at")
                        .or(orQuery)
                        .order("created_at", { ascending: false });

                    if (error) {
                        setError(error.message);
                        setResults([]);
                    } else {
                        setResults(data || []);
                        setError(null);
                    }
                } catch (err) {
                    setError(err.message || String(err));
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            };

            doSearch();
        }, 400); // debounce 400ms

        return () => clearTimeout(handler);
    }, [query, initialData]);

    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ara: başlık veya açıklama..."
                    style={{ width: "100%", padding: "8px 10px" }}
                />
            </div>

            {loading && <div>Aranıyor...</div>}
            {error && <div style={{ color: "#b00020" }}>Hata: {error}</div>}

            <ul>
                {results && results.length > 0 ? (
                    results.map((row, idx) => (
                        <li key={idx} style={{ marginBottom: 12 }}>
                            <strong>{row.title}</strong>
                            <div>{row.description}</div>
                        </li>
                    ))
                ) : (
                    <li>Sonuç bulunamadı.</li>
                )}
            </ul>
        </div>
    );
}

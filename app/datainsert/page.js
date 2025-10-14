"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DataInsertPage() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);

	// Assumption: table name is 'posts'. Change 'posts' to your actual table name if different.
	async function handleSubmit(e) {
		e.preventDefault();
		setMessage(null);

		if (!title.trim()) {
			setMessage({ type: "error", text: "Title zorunludur." });
			return;
		}

		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("nextspace")
				.insert([{ title: title.trim(), description: description.trim() }]);

			if (error) {
				setMessage({ type: "error", text: error.message });
			} else {
				setMessage({ type: "success", text: "Kayıt başarıyla eklendi." });
				setTitle("");
				setDescription("");

				// Trigger revalidation of /about so new content appears
				try {
					await fetch('/api/revalidate', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET, path: '/about' }),
					});
				} catch (e) {
					// ignore revalidate errors client-side
				}
			}
		} catch (err) {
			setMessage({ type: "error", text: err.message || "Bilinmeyen hata" });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<h1>Veri Ekle</h1>
			<form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
				<div style={{ marginBottom: 12 }}>
					<label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
						Title
					</label>
					<input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Başlık"
						style={{ width: "100%", padding: "8px 10px" }}
						disabled={loading}
					/>
				</div>

				<div style={{ marginBottom: 12 }}>
					<label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
						Description
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Açıklama"
						rows={4}
						style={{ width: "100%", padding: "8px 10px" }}
						disabled={loading}
					/>
				</div>

				<div>
					<button type="submit" disabled={loading} style={{ padding: "8px 14px" }}>
						{loading ? "Gönderiliyor..." : "Ekle"}
					</button>
				</div>

				{message && (
					<div
						style={{
							marginTop: 12,
							color: message.type === "error" ? "#b00020" : "#006600",
						}}
					>
						{message.text}
					</div>
				)}
			</form>
		</div>
	);
}


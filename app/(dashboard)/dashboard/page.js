"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function Dashboard() {

    const { user, loading, loadProfile } = useAuth();
	const [fetchingProfile, setFetchingProfile] = useState(false);

	// mount olduğunda detaylı profile gerekiyorsa çek
	useEffect(() => {
		if (loading) return;
		if (!user) return;

		// Eğer user temel (basic) bilgiyse veya company yoksa detay çek
		const needsProfile = user?._basic || !user?.company;
		if (needsProfile && loadProfile) {
			setFetchingProfile(true);
			loadProfile().finally(() => setFetchingProfile(false));
		}
	}, [loading, user?.id, loadProfile]); // loadProfile bağımlılığa eklendi

	if (loading) return null;

	return (
		<div>
            Dashboard
		</div>
	);
}

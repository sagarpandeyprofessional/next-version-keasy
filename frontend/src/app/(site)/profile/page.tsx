"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfileIndexPage() {
  const router = useRouter();
  const { profile, user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const username = (profile as { username?: string })?.username;
    if (username) {
      router.replace(`/profile/${username}`);
      return;
    }

    if (user) {
      router.replace("/username-registration");
      return;
    }

    router.replace("/signin");
  }, [loading, profile, user, router]);

  return null;
}

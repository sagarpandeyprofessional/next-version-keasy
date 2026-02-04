"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type PrivateRouteProps = {
  children: React.ReactNode;
  requireUsername?: boolean;
};

const PrivateRoute = ({ children, requireUsername = true }: PrivateRouteProps) => {
  const { session, profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.push("/signin");
      return;
    }

    if (requireUsername && (!profile || !(profile as { username?: string }).username)) {
      if (pathname !== "/username-registration") {
        router.push("/username-registration");
        return;
      }
    }

    if (pathname === "/username-registration" && (profile as { username?: string })?.username) {
      router.push("/");
    }
  }, [loading, session, profile, pathname, router, requireUsername]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!session) return null;

  if (requireUsername && (!profile || !(profile as { username?: string }).username)) {
    if (pathname !== "/username-registration") return null;
  }

  if (pathname === "/username-registration" && (profile as { username?: string })?.username) {
    return null;
  }

  return <>{children}</>;
};

export default PrivateRoute;

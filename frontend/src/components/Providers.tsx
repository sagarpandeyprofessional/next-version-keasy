"use client";

import useAnalytics from "@/hooks/useAnalytics";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  useAnalytics();

  return <AuthProvider>{children}</AuthProvider>;
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ComingSoonOverlay from "@/components/layout/Upcoming";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  const upcomingRoutes: string[] = [];
  const showUpcoming = upcomingRoutes.includes(pathname);

  const publicRoutes = [
    "/legal",
    "/legal/",
    "/legal/privacy",
    "/legal/privacy/",
    "/legal/terms",
    "/legal/terms/",
    "/legal/marketplace",
    "/legal/marketplace/",
    "/signin",
    "/signup",
    "/forgot-password",
    "/forgot-password/",
    "/about",
    "/faq",
    "/guides",
    "/community",
    "/events",
    "/marketplace",
    "/",
    "/connect",
    "/connect/",
    "/plans",
    "/plans/",
    "/pricing",
    "/pricing/",
    "/legal/membership/",
    "/legal/membership",
  ];

  const publicGuideRoutes = pathname.startsWith("/guides/guide/");
  const publicMarketplaceRoutes =
    pathname.startsWith("/marketplace/") &&
    pathname !== "/marketplace/post" &&
    !pathname.includes("/edit") &&
    pathname !== "/marketplace/my";

  const isPublicRoute = publicRoutes.includes(pathname) || publicGuideRoutes || publicMarketplaceRoutes;
  const isUsernameRegistrationPage = pathname === "/username-registration";

  useEffect(() => {
    if (loading) return;

    if (!session && !isPublicRoute) {
      router.push("/signin");
      return;
    }

    if (session && (!profile || !(profile as { username?: string }).username)) {
      if (!isUsernameRegistrationPage) {
        router.push("/username-registration");
        return;
      }
    }

    if (isUsernameRegistrationPage && session && (profile as { username?: string })?.username) {
      router.push("/");
      return;
    }
  }, [session, profile, loading, pathname, router, isPublicRoute, isUsernameRegistrationPage]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>

          <img src="/logo.png" alt="keasy" className="mt-3 h-8 w-auto animate-pulse object-contain" />
        </div>
      </div>
    );
  }

  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className={`relative flex-grow ${isHome ? "" : "lg:flex lg:justify-center"}`}>
        <div
          className={`w-full ${!isHome ? "md:w-4/5" : ""} mx-auto ${isHome ? "px-0" : "px-1"} pb-20 lg:pb-0 ${
            showUpcoming ? "filter blur-sm pointer-events-none select-none" : ""
          }`}
        >
          {children}
        </div>
        {showUpcoming && <ComingSoonOverlay />}
      </div>

      <Footer />
    </div>
  );
};

export default Layout;

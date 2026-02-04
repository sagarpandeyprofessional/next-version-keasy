"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiSearch,
  FiX,
  FiUser,
  FiHome,
  FiShoppingBag,
  FiCalendar,
  FiUsers,
  FiBookOpen,
  FiCreditCard,
} from "react-icons/fi";
import { UserRoundCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";

type SearchResult = {
  id: string;
  type: string;
  title: string;
  category: string;
  data: Record<string, unknown>;
};

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
};

const SearchModal = ({ isOpen, onClose, searchQuery, setSearchQuery }: SearchModalProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const searchData = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchTerm = `%${searchQuery.toLowerCase()}%`;

        const safeQuery = async <T,>(query: PromiseLike<T>) => {
          try {
            return await query;
          } catch {
            return { data: [], error: null } as T;
          }
        };

        const [marketplaceData, profilesData, communityData, eventsData, guidesData] = await Promise.all([
          safeQuery(
            supabase
              .from("marketplace")
              .select("id, title, location")
              .or(`title.ilike.${searchTerm},location.ilike.${searchTerm}`)
              .limit(5)
          ),
          safeQuery(
            supabase
              .from("profiles")
              .select("id, username, pfp_url")
              .ilike("username", searchTerm)
              .limit(5)
          ),
          safeQuery(
            supabase
              .from("community")
              .select("id, name, description")
              .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
              .limit(5)
          ),
          safeQuery(
            supabase
              .from("events")
              .select("id, name, description, location")
              .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
              .limit(5)
          ),
          safeQuery(
            supabase
              .from("guide")
              .select("id, name, description")
              .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
              .limit(5)
          ),
        ]);

        const allResults: SearchResult[] = [
          ...(marketplaceData.data || []).map((item: Record<string, unknown>) => ({
            id: `marketplace-${item.id as string}`,
            type: "marketplace",
            title: item.title as string,
            category: "Marketplace",
            data: item,
          })),
          ...(profilesData.data || []).map((item: Record<string, unknown>) => ({
            id: `profile-${item.id as string}`,
            type: "profile",
            title: item.username as string,
            category: "Users",
            data: item,
          })),
          ...(communityData.data || []).map((item: Record<string, unknown>) => ({
            id: `community-${item.id as string}`,
            type: "community",
            title: item.name as string,
            category: "Community",
            data: item,
          })),
          ...(eventsData.data || []).map((item: Record<string, unknown>) => ({
            id: `event-${item.id as string}`,
            type: "event",
            title: item.name as string,
            category: "Events",
            data: item,
          })),
          ...(guidesData.data || []).map((item: Record<string, unknown>) => ({
            id: `guide-${item.id as string}`,
            type: "guide",
            title: item.name as string,
            category: "Guides",
            data: item,
          })),
        ];

        setResults(allResults);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchData, 1000);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "guide":
        router.push(`/guides/guide/${result.data.id as string}`);
        break;
      case "event":
        router.push(`/events/`);
        break;
      case "marketplace":
        router.push(`/marketplace/${result.data.id as string}`);
        break;
      case "profile":
        router.push(`/profile/${result.data.username as string}`);
        break;
      case "community":
        router.push(`/community/`);
        break;
      default:
        break;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-md" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl mx-4 bg-white/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides, events, marketplace, users, community..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-12 py-3 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-black/80"
              autoFocus
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Searching...</p>
            </div>
          ) : searchQuery && results.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-4">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiSearch className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{result.title}</h3>
                    <p className="text-sm text-gray-500">{result.category}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FiSearch className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Start typing to search...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { profile, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleUserClick = () => {
    if (user) {
      router.push(`/profile/${(profile as { username?: string })?.username || "user"}`);
    } else {
      router.push("/signin");
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Connect", path: "/connect" },
    { name: "Pricing", path: "/plans" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItemsWithIcons = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Marketplace", path: "/marketplace", icon: FiShoppingBag },
    { name: "Events", path: "/events", icon: FiCalendar },
    { name: "Community", path: "/community", icon: FiUsers },
    { name: "Guides", path: "/guides", icon: FiBookOpen },
    { name: "Connect", path: "/connect", icon: UserRoundCheck },
    { name: "About", path: "/about", icon: FiUser },
    { name: "Subscription", path: "/plans", icon: FiCreditCard },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden lg:block sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-[3%]">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">keasy</div>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side: Search + User */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <FiSearch className="h-5 w-5 text-gray-700" />
              </button>

              <button
                onClick={handleUserClick}
                className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-all duration-200"
                aria-label="User profile"
              >
                {user && (profile as { pfp_url?: string; username?: string })?.pfp_url ? (
                  <img
                    src={(profile as { pfp_url?: string }).pfp_url}
                    alt={(profile as { username?: string }).username || "User"}
                    className="h-9 w-9 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <FiUser className="h-5 w-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar - Logo + Search Only */}
      <div className="lg:hidden sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-[3%]">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="text-xl font-bold text-blue-600">keasy</div>
            </Link>

            <div className="flex flex-row">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <FiSearch className="h-5 w-5 text-gray-700" />
              </button>

              <button
                onClick={handleUserClick}
                className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-all duration-200"
                aria-label="User profile"
              >
                {user && (profile as { pfp_url?: string; username?: string })?.pfp_url ? (
                  <img
                    src={(profile as { pfp_url?: string }).pfp_url}
                    alt={(profile as { username?: string }).username || "User"}
                    className="h-7 w-7 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <FiUser className="h-5 w-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation with Icons */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItemsWithIcons.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all ${
                  active ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-[10px] font-medium ${active ? "text-blue-600" : "text-gray-500"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          <button
            onClick={handleUserClick}
            className="flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all text-gray-600 hover:text-blue-600"
          >
            {user && (profile as { pfp_url?: string; username?: string })?.pfp_url ? (
              <img
                src={(profile as { pfp_url?: string }).pfp_url}
                alt={(profile as { username?: string }).username || "User"}
                className="h-6 w-6 rounded-full object-cover border-2 border-blue-200"
              />
            ) : (
              <FiUser className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium text-gray-500">{user ? "Profile" : "Sign In"}</span>
          </button>
        </div>
      </nav>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery("");
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </>
  );
};

export default Navbar;

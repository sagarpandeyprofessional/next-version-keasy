"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiBookOpen, FiCreditCard } from "react-icons/fi";
import { UserRoundCheck } from "lucide-react";

const LeftSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Guides", path: "/guides", icon: FiBookOpen },
    { name: "Connect", path: "/connect", icon: UserRoundCheck },
    { name: "Subscription", path: "/plans", icon: FiCreditCard },
  ];

  return (
    <>
      {/* Desktop Sidebar - HIDDEN (removed as per user request) */}

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all ${
                  isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-[10px] font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default LeftSidebar;

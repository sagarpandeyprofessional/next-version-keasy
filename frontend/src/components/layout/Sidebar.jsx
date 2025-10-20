import { Link, useLocation } from "react-router-dom";
import { FiHome, FiShoppingBag, FiCalendar, FiUsers, FiBookOpen, FiMapPin } from "react-icons/fi";

const LeftSidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Marketplace", path: "/marketplace", icon: FiShoppingBag },
    { name: "Events", path: "/events", icon: FiCalendar },
    { name: "Community", path: "/community", icon: FiUsers },
    { name: "Guides", path: "/guides", icon: FiBookOpen },
  ];
  {/* { name: "Nearby", path: "/nearby", icon: FiMapPin }, */}

  return (
    <>
      {/* Desktop Sidebar - Centered vertically */}
      <aside className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 w-16 bg-white border-r border-gray-200 shadow-sm z-40 rounded-r-2xl">
        <nav className="flex flex-col items-center gap-3 py-6 w-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
                title={item.name}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default LeftSidebar;

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, User, Github, Home, FolderGit2, Building } from "lucide-react"; // import icons
import { useAuth } from "../context/authContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

// Add icon components to navLinks
const navLinks = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Repos", href: "/dashboard/repos", icon: FolderGit2 },
  { label: "Organizations", href: "/dashboard/organisations", icon: Building },
];

export default function DashboardNavbar() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("githubToken"); // clear token
    window.location.href = "/"; // redirect to login
  };

  return (
    <nav className="w-full h-20 backdrop-blur-md bg-zinc-900/40 text-white px-6 py-4 flex items-center justify-between shadow-lg rounded-2xl">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Github size={28} className="text-orange-500" />
          <span>
            <span className="text-orange-500">Sy</span>scope
          </span>
        </div>

        {/* Navigation links */}
        <ul className="flex space-x-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href} className="flex items-center gap-1">
                <a
                  href={link.href}
                  className="flex items-center gap-1 hover:text-orange-400 transition font-medium"
                >
                  <Icon size={18} />
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center space-x-4 relative">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            className="p-2 rounded-full hover:bg-zinc-800 transition"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell size={20} />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-zinc-900/90 backdrop-blur-md rounded-xl shadow-lg p-4 flex flex-col gap-2"
              >
                <span className="font-semibold text-white">Notifications</span>
                <ul className="flex flex-col gap-2 text-zinc-300 text-sm">
                  <li>New repo created</li>
                  <li>Organization invite</li>
                  <li>PR merged</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2 p-2 rounded-full hover:bg-zinc-800 transition"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            <User size={20} />
            <span className="hidden sm:inline">{user?.displayName || user?.email}</span>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-44 bg-zinc-900/90 backdrop-blur-md rounded-xl shadow-lg p-4 flex flex-col gap-2"
              >
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-orange-400 cursor-pointer text-left w-full transition"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

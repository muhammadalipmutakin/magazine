"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Folder,
  FileText,
  Users,
  Megaphone,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  const menuItems = useMemo(
    () => [
      { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
      { name: "Data Category", icon: Folder, href: "/admin/category" },
      { name: "Data Blog", icon: FileText, href: "/admin/blogs" },
      { name: "Authors", icon: Users, href: "/admin/authors" },
      { name: "Iklan", icon: Megaphone, href: "/admin/iklan" },
      { name: "Setting Admin", icon: Settings, href: "/admin/setting" },
    ],
    []
  );

  return (
    <aside
      className={`h-screen bg-blue-900 text-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-16 overflow-hidden"
      }`}
    >
      {/* Toggle Button */}
      <div className="p-4 flex justify-between">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Menu Items */}
      <ul className="space-y-2 px-2">
        {menuItems.map(({ name, icon: Icon, href }) => (
          <li key={name}>
            <Link
              href={href}
              className={`flex items-center space-x-2 p-3 rounded-md transition ${
                pathname.startsWith(href)
                  ? "bg-blue-400 font-bold"
                  : "hover:bg-blue-500"
              }`}
            >
              <Icon size={24} />
              {isOpen && <span>{name}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

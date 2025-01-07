
import React, { useState } from "react";
import Link from "next/link";
import { Home, Ticket, Settings, PieChart, LogOut, Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { href: "/tickets", label: "Tickets", icon: <Ticket className="w-5 h-5" /> },
  { href: "/auditoria", label: "Auditorías", icon: <PieChart className="w-5 h-5" /> },
  { href: "/settings", label: "Configuración", icon: <Settings className="w-5 h-5" /> },
  { href: "/salida", label: "Salida", icon: <LogOut className="w-5 h-5" /> },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-600 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white">
            ParkingPOS
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md flex items-center space-x-2"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white md:hidden focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md flex items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


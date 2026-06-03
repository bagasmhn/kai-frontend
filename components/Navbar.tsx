"use client";
import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Train, Menu, X, User, LogOut, LayoutDashboard, Ticket, History, ChevronDown } from "lucide-react";
import { getUser, clearAuth, isAdmin, type User as UserType } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, [pathname]);


  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  const navLinks = user
    ? isAdmin()
      ? [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/jadwal", label: "Jadwal", icon: Train },
          { href: "/gerbong", label: "Gerbong", icon: Train },
          { href: "/kursi", label: "Kursi", icon: Train },
          { href: "/jenis-kereta", label: "Jenis Kereta", icon: Train },
          { href: "/admin/users", label: "Users", icon: User },
          { href: "/admin/booking", label: "Booking", icon: Ticket },
        ]
      : [
          { href: "/jadwal", label: "Cari Jadwal", icon: Train },
          { href: "/my-booking", label: "Tiket Saya", icon: Ticket },
          { href: "/history", label: "Riwayat", icon: History },
        ]
    : [];

  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-rail-400 to-rail-600 rounded-lg flex items-center justify-center">
                <Train className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg text-white">KAI<span className="text-rail-400">Express</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="px-4 py-1.5 text-sm bg-rail-600 hover:bg-rail-500 text-white rounded-lg transition-colors">
              Daftar
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-rail-400 to-rail-600 rounded-lg flex items-center justify-center">
            <Train className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg text-white">KAI<span className="text-rail-400">Express</span></span>
        </Link>

        {/* Desktop nav */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === l.href
                    ? "bg-rail-600/30 text-rail-300"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:bg-white/5 transition-all"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-rail-400 to-gold-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {(user.name || user.email || "U")[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-white/80 hidden sm:block">{user.name || user.email || "User"}</span>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-slide-down">
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all" onClick={() => setDropOpen(false)}>
                    <User className="w-4 h-4" /> Profil Saya
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all">
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-1.5 text-sm text-white/70 hover:text-white transition-colors">Masuk</Link>
              <Link href="/register" className="px-4 py-1.5 text-sm bg-rail-600 hover:bg-rail-500 text-white rounded-lg transition-colors">Daftar</Link>
            </div>
          )}
          <button className="md:hidden text-white/70" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden glass border-t border-white/5 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5">
              <l.icon className="w-4 h-4" /> {l.label}
            </Link>
          ))}
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-900/20 mt-1">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      )}
    </nav>
  );
}

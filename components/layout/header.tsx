"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, ChevronDown, Package, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropMenuOpen, setDropMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setDropMenuOpen(false);
  }, [pathname]);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "FAQ", href: "/faq" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ] as const;

  const dropLinks = [
    { name: "Sender", href: "/sender" },
    { name: "Receiver", href: "/receiver" },
    { name: "Status", href: "/status" },
    { name: "Resources", href: "/resources" },
    { name: "Docs", href: "/docs" },
  ] as const;

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300">
      <nav
        className={cn(
          "flex h-14 items-center justify-between px-6 rounded-full backdrop-blur-lg border border-gray-200 shadow-lg transition-all duration-300",
          scrolled ? "bg-white/95 shadow-xl" : "bg-white"
        )}
      >
        <Link href="/" className="flex items-center space-x-2 group">
          <Shield className="h-5 w-5 text-blue-600 transition-all group-hover:scale-110" />
          <span className="text-lg font-bold text-gray-900">
            Sypsecdrop × ChainMail
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const linkClasses = cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-full relative",
              isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            );

            return (
              <Link key={item.name} href={item.href} className={linkClasses}>
                {item.name}
              </Link>
            );
          })}

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              aria-haspopup="true"
              aria-expanded={dropMenuOpen}
            >
              <Package className="h-4 w-4" />
              Drop
              <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {dropMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white text-gray-900 shadow-xl"
                >
                  <ul className="py-2">
                    {dropLinks.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block px-4 py-2 text-sm font-medium transition hover:bg-blue-50",
                            pathname === item.href
                              ? "text-blue-600"
                              : "text-gray-700"
                          )}
                          onClick={() => setDropMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a
            href="https://chainmail-delta.vercel.app/login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "md:hidden rounded-2xl backdrop-blur-lg border overflow-hidden transition-all duration-300",
              scrolled
                ? "bg-white/95 border-gray-200"
                : "bg-white border-gray-100"
            )}
          >
            <div className="p-4 space-y-2">
              <div className="space-y-1">
                <p className="px-4 text-xs font-semibold uppercase text-gray-500">
                  Drop
                </p>
                <ul className="mt-2 space-y-1">
                  {dropLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block px-4 py-2 text-sm font-medium rounded-lg transition",
                          pathname === item.href
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="https://chainmail-delta.vercel.app/login"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mail className="h-4 w-4" />
                Email
              </a>

              <div className="pt-2 border-t border-gray-100" />

              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-4 py-2 text-sm font-medium rounded-lg transition",
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

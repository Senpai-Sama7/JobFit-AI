import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default function MainNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "glass-nav scrolled py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container-wide px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <a className="flex items-center gap-3 group">
                <div className="w-10 h-10 border-2 border-[var(--ink)] flex items-center justify-center font-bold text-lg headline-sans transition-colors group-hover:border-[var(--accent-cyan)] group-hover:text-[var(--accent-cyan)]">
                  JF
                </div>
                <span className="font-semibold text-lg text-[var(--ink)] hidden sm:block">
                  JobFit AI
                </span>
              </a>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={`text-sm font-medium transition-colors relative group ${
                      location === link.href
                        ? "text-[var(--ink)]"
                        : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--accent-cyan)] transition-all ${
                        location === link.href
                          ? "w-full"
                          : "w-0 group-hover:w-full"
                      }`}
                    />
                  </a>
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--glass-bg-hover)]">
                  Sign In
                </Button>
              </Link>
              <Link href="/app">
                <Button className="btn-primary">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[var(--ink)]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--background-secondary)] border-l border-[var(--glass-border)] p-6 pt-20"
            >
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a
                      className={`text-lg font-medium ${
                        location === link.href
                          ? "text-[var(--accent-cyan)]"
                          : "text-[var(--ink-muted)]"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </Link>
                ))}
                <div className="border-t border-[var(--glass-border)] pt-6 mt-4">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="w-full mb-3 text-[var(--ink-muted)]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/app">
                    <Button
                      className="btn-primary w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

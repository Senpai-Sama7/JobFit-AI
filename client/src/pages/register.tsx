import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Github,
  Chrome,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const passwordRequirements = [
  { text: "At least 8 characters", check: (p: string) => p.length >= 8 },
  { text: "One uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
  { text: "One lowercase letter", check: (p: string) => /[a-z]/.test(p) },
  { text: "One number", check: (p: string) => /[0-9]/.test(p) },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username: name }),
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Account created!",
          description: "Welcome to JobFit AI. Let's get started!",
        });
        setLocation("/app");
      } else {
        const data = await response.json();
        toast({
          title: "Registration failed",
          description: data.message || "Could not create account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[var(--accent-purple)] opacity-10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[var(--accent-cyan)] opacity-10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-3 justify-center mb-8 group">
            <div className="w-12 h-12 border-2 border-[var(--ink)] flex items-center justify-center font-bold text-xl headline-sans transition-colors group-hover:border-[var(--accent-cyan)] group-hover:text-[var(--accent-cyan)]">
              JF
            </div>
            <span className="font-semibold text-xl text-[var(--ink)]">
              JobFit AI
            </span>
          </a>
        </Link>

        {/* Card */}
        <div className="glass-panel p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-[var(--ink)] mb-2">
              Create your account
            </h1>
            <p className="text-[var(--ink-muted)]">
              Start optimizing your career in minutes
            </p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button variant="outline" className="glass-button">
              <Chrome className="w-5 h-5 mr-2" />
              Google
            </Button>
            <Button variant="outline" className="glass-button">
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--glass-border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--background-tertiary)] text-[var(--ink-muted)]">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[var(--ink)] mb-2"
              >
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ink-subtle)]" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-glass pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--ink)] mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ink-subtle)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-glass pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--ink)] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ink-subtle)]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="input-glass pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-subtle)] hover:text-[var(--ink)]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password requirements */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.text}
                    className={`flex items-center gap-2 text-xs ${
                      req.check(password)
                        ? "text-[var(--success)]"
                        : "text-[var(--ink-subtle)]"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    {req.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--accent-cyan)] focus:ring-[var(--accent-cyan)]"
              />
              <label htmlFor="terms" className="text-sm text-[var(--ink-muted)]">
                I agree to the{" "}
                <a href="#" className="text-[var(--accent-cyan)] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[var(--accent-cyan)] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              className="btn-primary w-full py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[var(--paper)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-[var(--ink-muted)] mt-6">
            Already have an account?{" "}
            <Link href="/login">
              <a className="text-[var(--accent-cyan)] font-medium hover:underline">
                Sign in
              </a>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

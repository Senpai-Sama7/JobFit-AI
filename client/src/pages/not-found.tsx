import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--accent-cyan)] opacity-10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--accent-pink)] opacity-10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 max-w-xl"
      >
        {/* 404 Text */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <span className="text-[12rem] md:text-[16rem] font-bold leading-none gradient-text-animated opacity-20">
            404
          </span>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="-mt-24"
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-[var(--ink-muted)] mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="btn-primary">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button
              className="btn-ghost"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <Link href="/">
            <a className="inline-flex items-center gap-3 text-[var(--ink-subtle)] hover:text-[var(--ink)] transition-colors">
              <div className="w-8 h-8 border-2 border-current flex items-center justify-center font-bold text-sm headline-sans">
                JF
              </div>
              <span className="font-medium">JobFit AI</span>
            </a>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

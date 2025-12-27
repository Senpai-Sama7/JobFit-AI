import { Link } from "wouter";
import { Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/app" },
    { label: "API", href: "#" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Templates", href: "#" },
    { label: "Guides", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
    { label: "Licenses", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--background-secondary)]">
      <div className="container-wide px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/">
              <a className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border-2 border-[var(--ink)] flex items-center justify-center font-bold text-lg headline-sans">
                  JF
                </div>
                <span className="font-semibold text-lg text-[var(--ink)]">
                  JobFit AI
                </span>
              </a>
            </Link>
            <p className="text-[var(--ink-muted)] text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered resume optimization and job matching platform. Land
              your dream job with precision-crafted applications.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg border border-[var(--glass-border)] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink)] uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink)] uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink)] uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--ink)] uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <a className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="glass-card p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--ink)] mb-2">
                Stay in the loop
              </h3>
              <p className="text-[var(--ink-muted)]">
                Get career tips, product updates, and exclusive content.
              </p>
            </div>
            <form className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-glass flex-1 md:w-64"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--glass-border)]">
          <p className="text-sm text-[var(--ink-subtle)]">
            © {new Date().getFullYear()} JobFit AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-[var(--ink-subtle)]">
            <span>Built with AI</span>
            <span className="w-1 h-1 rounded-full bg-[var(--accent-cyan)]" />
            <span>Made for job seekers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

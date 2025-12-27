import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Sparkles,
  CheckCircle,
  Play,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainNavigation from "@/components/main-navigation";
import Footer from "@/components/footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const stats = [
  { value: "95%", label: "ATS Pass Rate" },
  { value: "3x", label: "More Interviews" },
  { value: "50K+", label: "Resumes Optimized" },
  { value: "4.9/5", label: "User Rating" },
];

const features = [
  {
    icon: FileText,
    title: "AI Resume Analysis",
    description:
      "Upload your resume and get instant ATS scoring with actionable improvement suggestions.",
    color: "cyan",
  },
  {
    icon: Target,
    title: "Smart Job Matching",
    description:
      "Our AI analyzes your skills and experience to recommend perfect-fit job opportunities.",
    color: "pink",
  },
  {
    icon: Zap,
    title: "One-Click Tailoring",
    description:
      "Automatically customize your resume for specific job descriptions in seconds.",
    color: "purple",
  },
  {
    icon: Shield,
    title: "ATS Optimization",
    description:
      "Ensure your resume passes Applicant Tracking Systems with our proven optimization.",
    color: "green",
  },
  {
    icon: TrendingUp,
    title: "Career Insights",
    description:
      "Get real-time market trends and salary data for your target roles.",
    color: "amber",
  },
  {
    icon: Users,
    title: "Interview Prep",
    description:
      "AI-generated interview questions and answers based on your resume and target role.",
    color: "blue",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    content:
      "JobFit AI helped me land my dream job. The ATS optimization increased my callback rate by 300%.",
    avatar: "SC",
  },
  {
    name: "Michael Rodriguez",
    role: "Product Manager at Meta",
    content:
      "The job matching feature found opportunities I never would have discovered on my own. Incredible tool!",
    avatar: "MR",
  },
  {
    name: "Emily Johnson",
    role: "Data Scientist at Amazon",
    content:
      "Resume tailoring used to take hours. Now it takes seconds. JobFit AI is a game-changer.",
    avatar: "EJ",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNavigation />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--accent-cyan)] opacity-10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent-pink)] opacity-10 rounded-full blur-[100px]" />

        <div className="container-wide relative z-10 px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="feature-pill">
                <Sparkles className="w-4 h-4" />
                AI-Powered Career Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="display-xl font-bold mb-6 text-balance"
            >
              Land Your Dream Job with{" "}
              <span className="gradient-text-animated">AI Precision</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-[var(--ink-muted)] mb-10 max-w-2xl mx-auto text-pretty"
            >
              Transform your resume, match with perfect opportunities, and get
              hired faster with our intelligent career platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/app">
                <Button className="btn-primary text-lg px-8 py-6 group">
                  Start Free Analysis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/features">
                <Button className="btn-ghost text-lg px-8 py-6 group">
                  <Play className="mr-2 w-5 h-5" />
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeInUp}
              className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-[var(--ink-subtle)]"
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" />
                3 free resume analyses
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" />
                Cancel anytime
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-[var(--glass-border)] rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 bg-[var(--accent-cyan)] rounded-full mt-2"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-[var(--glass-border)]">
        <div className="container-wide px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-[var(--ink-muted)]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-wide px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="headline-sans text-sm text-[var(--accent-cyan)] mb-4 block">
              Features
            </span>
            <h2 className="display-lg mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-xl text-[var(--ink-muted)] max-w-2xl mx-auto">
              Our comprehensive suite of AI-powered tools helps you at every
              stage of your job search journey.
            </p>
          </motion.div>

          <div className="feature-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 hover-lift spotlight group"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-[var(--accent-${feature.color})]/10 border border-[var(--accent-${feature.color})]/30`}
                  style={{
                    backgroundColor: `var(--accent-${feature.color}-glow)`,
                    borderColor: `rgba(var(--accent-${feature.color}), 0.3)`,
                  }}
                >
                  <feature.icon
                    className="w-7 h-7"
                    style={{ color: `var(--accent-${feature.color})` }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-[var(--ink)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--ink-muted)] leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-[var(--accent-cyan)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-[var(--background-secondary)] relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />

        <div className="container-wide px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="headline-sans text-sm text-[var(--accent-pink)] mb-4 block">
              How It Works
            </span>
            <h2 className="display-lg mb-4">
              Three Steps to Your <span className="gradient-text">Dream Job</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Resume",
                description:
                  "Drop your resume and let our AI analyze it in seconds. We support PDF, DOCX, and plain text.",
              },
              {
                step: "02",
                title: "Get AI Insights",
                description:
                  "Receive detailed ATS scoring, skill analysis, and personalized improvement recommendations.",
              },
              {
                step: "03",
                title: "Apply with Confidence",
                description:
                  "Use our tailored resumes and job matches to apply strategically and land more interviews.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="glass-panel p-8">
                  <div className="text-6xl font-bold gradient-text opacity-30 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-semibold text-[var(--ink)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--ink-muted)]">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[var(--accent-cyan)] to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding">
        <div className="container-wide px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="headline-sans text-sm text-[var(--accent-purple)] mb-4 block">
              Testimonials
            </span>
            <h2 className="display-lg mb-4">
              Loved by <span className="gradient-text">Job Seekers</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[var(--accent-amber)] text-[var(--accent-amber)]"
                    />
                  ))}
                </div>
                <p className="text-[var(--ink)] text-lg mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-pink)] flex items-center justify-center text-[var(--paper)] font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--ink)]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[var(--ink-muted)]">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)]/10 via-transparent to-[var(--accent-pink)]/10" />

        <div className="container-wide px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-elevated p-12 md:p-16 text-center max-w-4xl mx-auto"
          >
            <h2 className="display-lg mb-4">
              Ready to Transform Your <span className="gradient-text">Career</span>?
            </h2>
            <p className="text-xl text-[var(--ink-muted)] mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have already accelerated their
              career with JobFit AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app">
                <Button className="btn-accent text-lg px-10 py-6">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="btn-secondary text-lg px-10 py-6">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

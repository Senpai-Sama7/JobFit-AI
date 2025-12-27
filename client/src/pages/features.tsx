import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  FileText,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Brain,
  BarChart3,
  FileSearch,
  Wand2,
  Download,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainNavigation from "@/components/main-navigation";
import Footer from "@/components/footer";

const mainFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Resume Analysis",
    description:
      "Our advanced AI analyzes your resume against industry standards and ATS requirements, providing a comprehensive score and detailed improvement recommendations.",
    benefits: [
      "Instant ATS compatibility score",
      "Section-by-section analysis",
      "Keyword optimization suggestions",
      "Industry-specific insights",
    ],
    image: "/placeholder-analysis.png",
    color: "cyan",
  },
  {
    icon: Target,
    title: "Intelligent Job Matching",
    description:
      "Our AI matches your skills and experience with relevant job opportunities, helping you discover roles you might have overlooked.",
    benefits: [
      "Skill-based job recommendations",
      "Company culture matching",
      "Salary range insights",
      "Growth potential analysis",
    ],
    image: "/placeholder-matching.png",
    color: "pink",
  },
  {
    icon: Wand2,
    title: "One-Click Resume Tailoring",
    description:
      "Automatically customize your resume for specific job descriptions. Our AI rewrites and optimizes your content to match job requirements.",
    benefits: [
      "Automatic keyword integration",
      "Skills gap analysis",
      "Experience rephrasing",
      "Achievement highlighting",
    ],
    image: "/placeholder-tailoring.png",
    color: "purple",
  },
];

const additionalFeatures = [
  {
    icon: Shield,
    title: "ATS Optimization",
    description:
      "Ensure your resume passes through Applicant Tracking Systems with our proven optimization techniques.",
  },
  {
    icon: BarChart3,
    title: "Market Insights",
    description:
      "Access real-time job market data, salary trends, and demand analysis for your target roles.",
  },
  {
    icon: FileSearch,
    title: "Resume Parsing",
    description:
      "Upload any resume format - PDF, DOCX, or plain text. Our parser extracts and structures your content.",
  },
  {
    icon: Users,
    title: "Interview Preparation",
    description:
      "Get AI-generated interview questions and answers tailored to your resume and target role.",
  },
  {
    icon: Download,
    title: "Multi-Format Export",
    description:
      "Export your optimized resume in multiple formats including PDF, DOCX, and plain text.",
  },
  {
    icon: Clock,
    title: "Version History",
    description:
      "Track all versions of your resume with complete history and the ability to restore previous versions.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Features() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent-purple)] opacity-10 rounded-full blur-[150px]" />

        <div className="container-wide px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="max-w-3xl"
          >
            <motion.span
              variants={fadeInUp}
              className="feature-pill mb-6 inline-block"
            >
              <Sparkles className="w-4 h-4" />
              Powerful Features
            </motion.span>

            <motion.h1 variants={fadeInUp} className="display-lg mb-6">
              Everything You Need to{" "}
              <span className="gradient-text">Land Your Dream Job</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-[var(--ink-muted)] mb-8"
            >
              JobFit AI combines cutting-edge artificial intelligence with deep
              industry knowledge to give you an unfair advantage in your job search.
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Link href="/app">
                <Button className="btn-primary text-lg px-8 py-6">
                  Try It Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="section-padding">
        <div className="container-wide px-4">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center mb-32 last:mb-0`}
            >
              {/* Content */}
              <div className="flex-1">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}
                  style={{
                    background: `var(--accent-${feature.color}-glow)`,
                    border: `1px solid rgba(var(--accent-${feature.color}), 0.3)`,
                  }}
                >
                  <feature.icon
                    className="w-8 h-8"
                    style={{ color: `var(--accent-${feature.color})` }}
                  />
                </div>

                <h2 className="text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-4">
                  {feature.title}
                </h2>

                <p className="text-lg text-[var(--ink-muted)] mb-8 leading-relaxed">
                  {feature.description}
                </p>

                <ul className="space-y-4">
                  {feature.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-3 text-[var(--ink-muted)]"
                    >
                      <CheckCircle
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: `var(--accent-${feature.color})` }}
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="flex-1 w-full">
                <div className="glass-panel aspect-feature p-1 shimmer">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-[var(--glass-bg)] to-transparent flex items-center justify-center">
                    <feature.icon
                      className="w-24 h-24 opacity-20"
                      style={{ color: `var(--accent-${feature.color})` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="section-padding bg-[var(--background-secondary)] relative">
        <div className="absolute inset-0 dot-pattern opacity-30" />

        <div className="container-wide px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="headline-sans text-sm text-[var(--accent-cyan)] mb-4 block">
              And More
            </span>
            <h2 className="display-md mb-4">
              Additional <span className="gradient-text">Capabilities</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-muted)] border border-[var(--accent-cyan)]/30 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-[var(--accent-cyan)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--ink)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--ink-muted)]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="section-padding">
        <div className="container-wide px-4">
          <div className="glass-elevated p-12 md:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="headline-sans text-sm text-[var(--accent-pink)] mb-4 block">
                  Integrations
                </span>
                <h2 className="display-md mb-4">
                  Works with Your <span className="gradient-text">Workflow</span>
                </h2>
                <p className="text-lg text-[var(--ink-muted)] mb-8">
                  JobFit AI integrates seamlessly with popular job boards and career
                  platforms. Import job descriptions directly and export optimized
                  resumes to your preferred format.
                </p>
                <div className="flex flex-wrap gap-4">
                  {["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter"].map(
                    (platform) => (
                      <span
                        key={platform}
                        className="px-4 py-2 glass-button text-sm"
                      >
                        {platform}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square glass-card flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-[var(--glass-bg-hover)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-wide px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="display-md mb-4">
              Ready to Get <span className="gradient-text">Started</span>?
            </h2>
            <p className="text-xl text-[var(--ink-muted)] mb-8">
              Join thousands of job seekers who are already using JobFit AI to
              accelerate their career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app">
                <Button className="btn-accent text-lg px-10 py-6">
                  Start Free Trial
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

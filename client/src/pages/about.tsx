import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Target,
  Heart,
  Lightbulb,
  Users,
  Globe,
  Award,
  ArrowRight,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainNavigation from "@/components/main-navigation";
import Footer from "@/components/footer";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description:
      "We're committed to democratizing access to career success tools that were once only available to the privileged few.",
  },
  {
    icon: Heart,
    title: "User-First",
    description:
      "Every feature we build starts with understanding the real challenges job seekers face in today's competitive market.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We push the boundaries of AI technology to create tools that genuinely make a difference in people's careers.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We believe in building a supportive community where job seekers can share experiences and learn from each other.",
  },
];

const team = [
  {
    name: "Alex Chen",
    role: "CEO & Co-Founder",
    bio: "Former Google engineer with a passion for making career tools accessible to everyone.",
    avatar: "AC",
  },
  {
    name: "Sarah Kim",
    role: "CTO & Co-Founder",
    bio: "AI researcher turned entrepreneur, previously led ML teams at Meta and OpenAI.",
    avatar: "SK",
  },
  {
    name: "Michael Torres",
    role: "Head of Product",
    bio: "10+ years in product leadership at LinkedIn and Indeed. Obsessed with user experience.",
    avatar: "MT",
  },
  {
    name: "Emily Davis",
    role: "Head of AI",
    bio: "PhD in NLP from Stanford. Leading our AI research and resume optimization models.",
    avatar: "ED",
  },
];

const milestones = [
  { year: "2023", event: "JobFit AI founded with a mission to revolutionize job searching" },
  { year: "2023", event: "Launched beta with 1,000 early adopters" },
  { year: "2024", event: "Raised $5M seed round from top VCs" },
  { year: "2024", event: "Reached 50,000 active users" },
  { year: "2024", event: "Launched AI-powered resume tailoring" },
  { year: "2025", event: "Expanded to 50+ countries worldwide" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--accent-cyan)] opacity-10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--accent-pink)] opacity-10 rounded-full blur-[120px]" />

        <div className="container-wide px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.span
              variants={fadeInUp}
              className="headline-sans text-sm text-[var(--accent-cyan)] mb-4 block"
            >
              About Us
            </motion.span>

            <motion.h1 variants={fadeInUp} className="display-lg mb-6">
              We're Building the Future of{" "}
              <span className="gradient-text">Career Success</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-[var(--ink-muted)]"
            >
              JobFit AI was born from a simple belief: everyone deserves access to
              the tools and insights that lead to career success. We're using AI
              to level the playing field.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding">
        <div className="container-wide px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="headline-sans text-sm text-[var(--accent-pink)] mb-4 block">
                Our Mission
              </span>
              <h2 className="display-md mb-6">
                Empowering Every Job Seeker to{" "}
                <span className="gradient-text">Succeed</span>
              </h2>
              <div className="space-y-4 text-[var(--ink-muted)] text-lg leading-relaxed">
                <p>
                  The job market has never been more competitive. Applicant Tracking
                  Systems filter out qualified candidates. Generic resumes get lost
                  in the crowd. And most job seekers don't have access to the
                  expensive career coaches and tools that could help.
                </p>
                <p>
                  We built JobFit AI to change that. Our AI-powered platform gives
                  everyone access to the same level of resume optimization and career
                  guidance that was once reserved for the privileged few.
                </p>
                <p>
                  Whether you're a recent graduate, a career changer, or a seasoned
                  professional, JobFit AI helps you present your best self to
                  employers.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-12"
            >
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">50K+</div>
                  <div className="text-[var(--ink-muted)]">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">95%</div>
                  <div className="text-[var(--ink-muted)]">ATS Pass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">50+</div>
                  <div className="text-[var(--ink-muted)]">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">4.9</div>
                  <div className="text-[var(--ink-muted)]">User Rating</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-[var(--background-secondary)]">
        <div className="container-wide px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="headline-sans text-sm text-[var(--accent-purple)] mb-4 block">
              Our Values
            </span>
            <h2 className="display-md">
              What <span className="gradient-text">Drives Us</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 text-center hover-lift"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--primary-muted)] border border-[var(--accent-cyan)]/30 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-7 h-7 text-[var(--accent-cyan)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--ink)] mb-3">
                  {value.title}
                </h3>
                <p className="text-[var(--ink-muted)]">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding">
        <div className="container-wide px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="headline-sans text-sm text-[var(--accent-cyan)] mb-4 block">
              Our Team
            </span>
            <h2 className="display-md mb-4">
              Meet the <span className="gradient-text">Builders</span>
            </h2>
            <p className="text-xl text-[var(--ink-muted)] max-w-2xl mx-auto">
              A passionate team of engineers, designers, and career experts united
              by a common mission.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-8 text-center group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-pink)] flex items-center justify-center text-[var(--paper)] text-2xl font-bold mx-auto mb-6">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-semibold text-[var(--ink)] mb-1">
                  {member.name}
                </h3>
                <p className="text-[var(--accent-cyan)] text-sm mb-4">
                  {member.role}
                </p>
                <p className="text-[var(--ink-muted)] text-sm mb-4">
                  {member.bio}
                </p>
                <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href="#"
                    className="w-8 h-8 rounded-lg border border-[var(--glass-border)] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 rounded-lg border border-[var(--glass-border)] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-padding bg-[var(--background-secondary)]">
        <div className="container-wide px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="headline-sans text-sm text-[var(--accent-pink)] mb-4 block">
              Our Journey
            </span>
            <h2 className="display-md">
              The <span className="gradient-text">Story So Far</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-[var(--glass-border)]" />

              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center gap-8 mb-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? "md:text-right" : "md:text-left"
                    } pl-12 md:pl-0`}
                  >
                    <span className="text-[var(--accent-cyan)] font-bold">
                      {milestone.year}
                    </span>
                    <p className="text-[var(--ink-muted)]">{milestone.event}</p>
                  </div>
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-[var(--accent-cyan)] -translate-x-1/2 glow-cyan" />
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
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
            className="glass-elevated p-12 md:p-16 text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Globe className="w-6 h-6 text-[var(--accent-cyan)]" />
              <span className="text-[var(--accent-cyan)] font-medium">
                We're Hiring!
              </span>
            </div>
            <h2 className="display-md mb-4">
              Join Our <span className="gradient-text">Mission</span>
            </h2>
            <p className="text-xl text-[var(--ink-muted)] mb-8 max-w-2xl mx-auto">
              We're always looking for talented people who share our passion for
              helping job seekers succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/careers">
                <Button className="btn-accent text-lg px-10 py-6">
                  View Open Positions
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/app">
                <Button className="btn-secondary text-lg px-10 py-6">
                  Try JobFit AI
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

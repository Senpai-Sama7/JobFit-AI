import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainNavigation from "@/components/main-navigation";
import Footer from "@/components/footer";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out JobFit AI",
    price: { monthly: 0, yearly: 0 },
    icon: Sparkles,
    color: "cyan",
    features: [
      { text: "3 resume analyses", included: true },
      { text: "Basic ATS scoring", included: true },
      { text: "5 job matches", included: true },
      { text: "1 resume version", included: true },
      { text: "Email support", included: true },
      { text: "Resume tailoring", included: false },
      { text: "Interview prep", included: false },
      { text: "Priority processing", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Plus",
    description: "For active job seekers",
    price: { monthly: 9.99, yearly: 7.99 },
    icon: Zap,
    color: "pink",
    features: [
      { text: "Unlimited analyses", included: true },
      { text: "Advanced ATS scoring", included: true },
      { text: "Unlimited job matches", included: true },
      { text: "10 resume versions", included: true },
      { text: "Priority email support", included: true },
      { text: "Resume tailoring", included: true },
      { text: "Basic interview prep", included: true },
      { text: "Priority processing", included: false },
    ],
    cta: "Start Plus Trial",
    popular: true,
  },
  {
    name: "Pro",
    description: "For serious career advancement",
    price: { monthly: 24.99, yearly: 19.99 },
    icon: Crown,
    color: "purple",
    features: [
      { text: "Everything in Plus", included: true },
      { text: "AI-powered optimization", included: true },
      { text: "Unlimited resume versions", included: true },
      { text: "Advanced interview prep", included: true },
      { text: "Career coaching tips", included: true },
      { text: "LinkedIn optimization", included: true },
      { text: "Priority processing", included: true },
      { text: "1-on-1 support", included: true },
    ],
    cta: "Start Pro Trial",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, and PayPal. Enterprise customers can pay via invoice.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! All paid plans come with a 7-day free trial. No credit card required to start.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data is retained for 30 days after cancellation. You can export all your resumes before that.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 14-day money-back guarantee if you're not satisfied with our service.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Absolutely! You can change your plan at any time. Changes take effect immediately.",
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent-pink)] opacity-5 rounded-full blur-[200px]" />

        <div className="container-wide px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="feature-pill mb-6 inline-block">
              <Crown className="w-4 h-4" />
              Simple Pricing
            </span>

            <h1 className="display-lg mb-6">
              Choose Your <span className="gradient-text">Career Plan</span>
            </h1>

            <p className="text-xl text-[var(--ink-muted)] mb-10">
              Start free, upgrade when you're ready. All plans include our core
              AI features.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span
                className={`text-sm font-medium ${
                  !isYearly ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isYearly ? "bg-[var(--accent-cyan)]" : "bg-[var(--muted)]"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    isYearly ? "left-8" : "left-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium flex items-center gap-2 ${
                  isYearly ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"
                }`}
              >
                Yearly
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--success-muted)] text-[var(--success)]">
                  Save 20%
                </span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container-wide px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-pink)] text-[var(--paper)]">
                      Most Popular
                    </span>
                  </div>
                )}

                <div
                  className={`glass-card h-full p-8 ${
                    plan.popular
                      ? "border-[var(--accent-pink)] shadow-lg shadow-[var(--accent-pink-glow)]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `var(--accent-${plan.color}-glow)`,
                      }}
                    >
                      <plan.icon
                        className="w-5 h-5"
                        style={{ color: `var(--accent-${plan.color})` }}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--ink)]">
                        {plan.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--ink-muted)] mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[var(--ink)]">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-[var(--ink-muted)]">/month</span>
                    )}
                  </div>

                  <Link href="/app">
                    <Button
                      className={`w-full mb-8 ${
                        plan.popular ? "btn-accent" : "btn-secondary"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>

                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.text}
                        className="flex items-center gap-3"
                      >
                        {feature.included ? (
                          <Check className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-[var(--ink-subtle)] flex-shrink-0" />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-[var(--ink-muted)]"
                              : "text-[var(--ink-subtle)]"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="section-padding bg-[var(--background-secondary)]">
        <div className="container-wide px-4">
          <div className="glass-elevated p-12 md:p-16 max-w-4xl mx-auto text-center">
            <span className="headline-sans text-sm text-[var(--accent-amber)] mb-4 block">
              Enterprise
            </span>
            <h2 className="display-md mb-4">
              Need a Custom <span className="gradient-text">Solution</span>?
            </h2>
            <p className="text-lg text-[var(--ink-muted)] mb-8 max-w-2xl mx-auto">
              For teams and organizations, we offer custom enterprise plans with
              dedicated support, advanced analytics, and bulk licensing.
            </p>
            <Button className="btn-primary text-lg px-8 py-6">
              Contact Sales
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="container-wide px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="headline-sans text-sm text-[var(--accent-cyan)] mb-4 block">
              FAQ
            </span>
            <h2 className="display-md">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-[var(--ink)]">
                    {faq.question}
                  </span>
                  <HelpCircle
                    className={`w-5 h-5 text-[var(--ink-muted)] transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-[var(--ink-muted)]">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
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
              Start Your Free <span className="gradient-text">Trial Today</span>
            </h2>
            <p className="text-xl text-[var(--ink-muted)] mb-8">
              No credit card required. Get 3 free resume analyses and see the
              difference AI can make.
            </p>
            <Link href="/app">
              <Button className="btn-accent text-lg px-10 py-6">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

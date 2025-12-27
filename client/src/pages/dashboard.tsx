import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useResumes } from "@/hooks/use-resume";
import { useCreateSubscription } from "@/hooks/use-subscription";
import { FileUpload } from "@/components/file-upload";
import RoleRecommendations from "@/components/role-recommendations";
import SkillProfile from "@/components/skill-profile";
import TailoringWorkspace from "@/components/tailoring-workspace";
import OptimizationModal from "@/components/optimization-modal";
import ResumeBuilder from "@/components/resume-builder";
import SubscriptionModal from "@/components/subscription-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileUp,
  Edit,
  Wand2,
  Search,
  Upload,
  UserCircle,
  Clock,
  TrendingUp,
  CheckCircle,
  Download,
  Lightbulb,
  Home,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Crown,
  Sparkles,
  ArrowRight,
  Target,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Resume, Activity } from "@shared/schema";

interface DashboardStats {
  resumesCreated: number;
  averageAtsScore: number;
  roleMatches: number;
  tailoredResumes: number;
  exports: number;
}

interface User {
  id: number;
  email: string;
  username: string;
  subscriptionStatus: "free" | "plus" | "pro";
  subscriptionExpiry: string | null;
  resumeGenerationsUsed: number;
  resumeGenerationsLimit: number;
  createdAt: string;
}

interface OptimizationData {
  currentScore: number;
  optimizedScore: number;
  improvements: string[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Dashboard() {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showTailoringModal, setShowTailoringModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const createSubscription = useCreateSubscription();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user");
      return response.json();
    },
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/dashboard/stats");
      return response.json();
    },
    refetchInterval: 5000,
  });

  const { data: resumes = [], refetch: refetchResumes } = useResumes();

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/activities");
      return response.json();
    },
  });

  const latestResume = resumes?.find((r) => r.atsScore && r.parsedData) || resumes?.[0];

  const handleTailorResume = () => {
    if (latestResume) {
      setSelectedResumeId(latestResume.id);
      setShowTailoringModal(true);
    }
  };

  const handleOptimizeResume = async () => {
    if (!latestResume) return;

    try {
      toast({
        title: "Optimizing Resume",
        description: "Analyzing and improving your resume for better ATS compliance...",
      });

      const response = await apiRequest("POST", `/api/resumes/${latestResume.id}/optimize`, {});
      const data = await response.json();

      setOptimizationData({
        currentScore: data.oldScore,
        optimizedScore: data.newScore,
        improvements: data.improvements || [
          "Added missing contact information formatting",
          "Enhanced skills section with industry keywords",
          "Improved experience bullets with quantifiable metrics",
          "Optimized section headers for ATS compatibility",
        ],
      });
      setShowOptimizationModal(true);

      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Could not optimize resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDemoUpload = async () => {
    const demoResumeContent = `JOHN SMITH
Senior Software Engineer
Email: john.smith@email.com | Phone: (555) 123-4567
Location: San Francisco, CA | LinkedIn: linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 6+ years developing scalable web applications and leading cross-functional teams. Expertise in full-stack development, cloud architecture, and agile methodologies.

TECHNICAL SKILLS
Programming: JavaScript, TypeScript, Python, Java
Frontend: React, Vue.js, Angular, HTML5, CSS3
Backend: Node.js, Express, Django, Spring Boot
Cloud: AWS, Docker, Kubernetes, CI/CD

EXPERIENCE

Senior Software Engineer | TechFlow Solutions | Jan 2022 - Present
• Led development of microservices architecture serving 100k+ daily users
• Implemented automated testing pipeline reducing deployment time by 40%
• Mentored 3 junior developers and conducted technical interviews

Software Engineer | StartupCorp | Mar 2020 - Dec 2021
• Built responsive web applications using React and Node.js
• Developed RESTful APIs handling 10M+ requests per month
• Integrated third-party payment systems increasing conversion by 20%

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2018

CERTIFICATIONS
AWS Certified Solutions Architect - Associate | 2023`;

    try {
      const blob = new Blob([demoResumeContent], { type: "text/plain" });
      const file = new File([blob], "demo_resume.txt", { type: "text/plain" });
      const formData = new FormData();
      formData.append("resume", file);

      toast({
        title: "Demo Upload Started",
        description: "Processing sample resume...",
      });

      await apiRequest("POST", "/api/resumes/upload", formData);

      setTimeout(() => {
        toast({
          title: "Analysis Complete!",
          description: "Demo resume processed. Check your results below.",
        });

        queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      }, 3500);
    } catch (error) {
      toast({
        title: "Demo Failed",
        description: "Could not process demo resume.",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string): ReactNode => {
    switch (type) {
      case "upload":
      case "created":
        return <CheckCircle className="h-4 w-4 text-[var(--success)]" />;
      case "tailored":
      case "exported":
        return <Download className="h-4 w-4 text-[var(--accent-cyan)]" />;
      case "parsed":
      case "optimized":
        return <Lightbulb className="h-4 w-4 text-[var(--accent-amber)]" />;
      default:
        return <Clock className="h-4 w-4 text-[var(--ink-subtle)]" />;
    }
  };

  const formatTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleResumeBuilderComplete = (resumeId: number) => {
    setShowManualForm(false);
    refetchResumes();
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    toast({
      title: "Resume Created",
      description: "Your resume is ready for optimization!",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Dashboard Navigation */}
      <nav className="glass-nav sticky top-0 z-50 border-b border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/">
                <a className="flex items-center gap-3 group">
                  <div className="w-10 h-10 border-2 border-[var(--ink)] flex items-center justify-center font-bold headline-sans transition-colors group-hover:border-[var(--accent-cyan)] group-hover:text-[var(--accent-cyan)]">
                    JF
                  </div>
                  <span className="font-semibold text-[var(--ink)] hidden sm:block">
                    JobFit AI
                  </span>
                </a>
              </Link>
              <div className="hidden md:flex items-center gap-1 text-sm">
                <Link href="/">
                  <a className="px-3 py-2 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--glass-bg-hover)] transition-colors">
                    <Home className="w-4 h-4" />
                  </a>
                </Link>
                <span className="text-[var(--ink-subtle)]">/</span>
                <span className="px-3 py-2 text-[var(--ink)]">Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--ink-muted)] hover:text-[var(--ink)] relative"
              >
                <Bell className="h-5 w-5" />
                {(activities?.length || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--accent-pink)] text-[var(--paper)] text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {activities?.length}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-2 hover:bg-[var(--glass-bg-hover)]"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-pink)] text-[var(--paper)] text-sm font-medium">
                        {user?.username?.slice(0, 2).toUpperCase() || "JD"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-[var(--ink)] font-medium">
                      {user?.username || "Demo User"}
                    </span>
                    <ChevronDown className="text-[var(--ink-muted)] h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-[var(--glass-border)]">
                  <DropdownMenuItem className="hover:bg-[var(--glass-bg-hover)] cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-[var(--glass-bg-hover)] cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[var(--glass-border)]" />
                  <DropdownMenuItem className="hover:bg-[var(--glass-bg-hover)] cursor-pointer text-[var(--error)]">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-[var(--glass-border)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-cyan)]/10 via-[var(--accent-purple)]/5 to-[var(--accent-pink)]/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[var(--ink)] mb-2">
                Welcome back{user?.username ? `, ${user.username}` : ""}
              </h1>
              <p className="text-[var(--ink-muted)]">
                Manage your resumes and discover your perfect career fit
              </p>
            </div>
            <Button
              onClick={() => setShowSubscriptionModal(true)}
              className="btn-accent flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade Plan
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              icon: FileUp,
              title: "Upload Resume",
              subtitle: "PDF, DOCX, TXT",
              color: "cyan",
              onClick: () => {
                const input = document.querySelector("[data-upload-trigger]") as HTMLInputElement;
                if (input) input.click();
              },
            },
            {
              icon: Edit,
              title: "Create Resume",
              subtitle: "Build from scratch",
              color: "green",
              onClick: () => setShowManualForm(true),
            },
            {
              icon: Wand2,
              title: "Tailor Resume",
              subtitle: latestResume ? "For specific job" : "Upload first",
              color: "pink",
              onClick: latestResume ? handleTailorResume : undefined,
              disabled: !latestResume,
            },
            {
              icon: Search,
              title: "Find Roles",
              subtitle: latestResume ? "AI recommendations" : "Upload first",
              color: "purple",
              onClick: () =>
                latestResume &&
                document.querySelector("[data-recommendations-scroll]")?.scrollIntoView({ behavior: "smooth" }),
              disabled: !latestResume,
            },
          ].map((action, index) => (
            <motion.div key={action.title} variants={fadeInUp}>
              <Card
                className={`glass-card border-0 cursor-pointer group hover-lift ${
                  action.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={action.disabled ? undefined : action.onClick}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                      style={{
                        background: `var(--accent-${action.color}-glow)`,
                        border: `1px solid rgba(var(--accent-${action.color}), 0.3)`,
                      }}
                    >
                      <action.icon
                        className="h-5 w-5"
                        style={{ color: `var(--accent-${action.color})` }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--ink)]">{action.title}</h3>
                      <p className="text-sm text-[var(--ink-muted)]">{action.subtitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-panel overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-[var(--ink)] mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)] border border-[var(--accent-cyan)]/30 flex items-center justify-center">
                      <Upload className="text-[var(--accent-cyan)] h-5 w-5" />
                    </div>
                    Upload Your Resume
                  </h2>

                  <FileUpload />

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setShowManualForm(true)}
                      className="btn-primary flex-1"
                    >
                      Build Manually
                    </Button>
                    <Button onClick={handleDemoUpload} className="btn-ghost flex-1">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Try Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resume Status */}
            {latestResume && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-panel">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-[var(--ink)] mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--success-muted)] border border-[var(--success)]/30 flex items-center justify-center">
                        <UserCircle className="text-[var(--success)] h-5 w-5" />
                      </div>
                      Resume Status
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--success-muted)]">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-[var(--success)] h-5 w-5" />
                          <span className="font-medium text-[var(--ink)]">Resume Uploaded</span>
                        </div>
                        <span className="text-sm text-[var(--ink-muted)]">
                          {formatTimeAgo(latestResume.createdAt)}
                        </span>
                      </div>

                      <div className="p-4 rounded-lg bg-[var(--glass-bg)]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Target className="text-[var(--accent-cyan)] h-5 w-5" />
                            <span className="font-medium text-[var(--ink)]">ATS Score</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={handleOptimizeResume}
                            className="btn-primary text-xs py-1 px-3"
                          >
                            Optimize
                          </Button>
                        </div>
                        <div className="w-full bg-[var(--muted)] rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${latestResume.atsScore || 0}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--success)]"
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                          <span className="text-[var(--ink-muted)]">Score</span>
                          <span className="font-semibold text-[var(--accent-cyan)]">
                            {latestResume.atsScore || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-panel">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-[var(--ink)] mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-purple-glow)] border border-[var(--accent-purple)]/30 flex items-center justify-center">
                      <Clock className="text-[var(--accent-purple)] h-5 w-5" />
                    </div>
                    Recent Activity
                  </h2>

                  <div className="space-y-3">
                    {activities?.length ? (
                      activities.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[var(--glass-bg)] flex items-center justify-center flex-shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--ink)] truncate">
                              {activity.title}
                            </p>
                            {activity.description && (
                              <p className="text-sm text-[var(--ink-muted)] truncate">
                                {activity.description}
                              </p>
                            )}
                            <span className="text-xs text-[var(--ink-subtle)]">
                              {formatTimeAgo(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[var(--ink-muted)] text-center py-8">
                        No recent activity
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Role Recommendations */}
            <div data-recommendations-scroll>
              {latestResume && <RoleRecommendations resumeId={latestResume.id} />}
            </div>

            {/* Skill Profile */}
            {latestResume && <SkillProfile resume={latestResume} />}

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-panel">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-[var(--ink)] mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-amber-glow)] border border-[var(--accent-amber)]/30 flex items-center justify-center">
                      <TrendingUp className="text-[var(--accent-amber)] h-5 w-5" />
                    </div>
                    Quick Stats
                  </h2>

                  <div className="space-y-4">
                    <div className="stat-card text-center">
                      <div className="text-3xl font-bold gradient-text mb-1">
                        {stats?.resumesCreated || 0}
                      </div>
                      <div className="text-sm text-[var(--ink-muted)]">Resumes Created</div>
                    </div>

                    <div className="stat-card text-center" style={{ background: 'var(--success-muted)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <div className="text-3xl font-bold text-[var(--success)] mb-1">
                        {stats?.averageAtsScore || 0}%
                      </div>
                      <div className="text-sm text-[var(--ink-muted)]">Avg ATS Score</div>
                    </div>

                    <div className="stat-card text-center" style={{ background: 'var(--accent-pink-glow)', borderColor: 'rgba(244, 114, 182, 0.2)' }}>
                      <div className="text-3xl font-bold text-[var(--accent-pink)] mb-1">
                        {stats?.roleMatches || 0}
                      </div>
                      <div className="text-sm text-[var(--ink-muted)]">Role Matches</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Resume Builder Dialog */}
      <Dialog open={showManualForm} onOpenChange={setShowManualForm}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 glass-panel border-[var(--glass-border)]">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl text-[var(--ink)]">Build Your Resume</DialogTitle>
            </DialogHeader>
            <ResumeBuilder
              onComplete={handleResumeBuilderComplete}
              onCancel={() => setShowManualForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Tailoring Workspace Modal */}
      <Dialog open={showTailoringModal} onOpenChange={setShowTailoringModal}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0 glass-panel border-[var(--glass-border)]">
          <TailoringWorkspace
            resumeId={selectedResumeId}
            onClose={() => setShowTailoringModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Optimization Results Modal */}
      {optimizationData && (
        <OptimizationModal
          isOpen={showOptimizationModal}
          onClose={() => setShowOptimizationModal(false)}
          resumeId={latestResume?.id || 0}
          currentScore={optimizationData.currentScore}
          optimizedScore={optimizationData.optimizedScore}
          improvements={optimizationData.improvements}
        />
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={(plan) => createSubscription.mutate(plan)}
      />
    </div>
  );
}

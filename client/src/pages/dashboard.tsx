import { useState, useRef, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useResumes, useOptimizeResume, useDeleteResume } from "@/hooks/use-resume";
import { useSubscriptionLimits, useCreateSubscription } from "@/hooks/use-subscription";
import { useScrollReveal, useStaggeredReveal } from "@/hooks/use-scroll-reveal";
import { GradientMesh } from "@/components/premium-background";
import SubscriptionModal from "@/components/subscription-modal";
import Navigation from "@/components/navigation";
import { FileUpload } from "@/components/file-upload";
import RoleRecommendations from "@/components/role-recommendations";
import SkillProfile from "@/components/skill-profile";
import TailoringWorkspace from "@/components/tailoring-workspace";
import OptimizationModal from "@/components/optimization-modal";
import ResumeBuilder from "@/components/resume-builder";
import AchievementSystem from "@/components/achievement-system";
import JobMarketTrends from "@/components/job-market-trends";
import JobBoardIntegration from "@/components/job-board-integration";
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
} from "lucide-react";
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

export default function Dashboard() {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showTailoringModal, setShowTailoringModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Scroll reveal animations
  const [heroRef, heroVisible] = useScrollReveal<HTMLDivElement>();
  const [headerRef, headerVisible] = useScrollReveal<HTMLDivElement>();
  const [actionsContainerRef, actionsVisible] = useStaggeredReveal(4);
  const [uploadRef, uploadVisible] = useScrollReveal<HTMLDivElement>();
  const [statsRef, statsVisible] = useScrollReveal<HTMLDivElement>();

  const subscriptionLimits = useSubscriptionLimits();
  const createSubscription = useCreateSubscription();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get user subscription status
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user");
      return response.json();
    },
  });

  // Fetch dashboard data
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

      // Show detailed optimization results
      setOptimizationData({
        currentScore: data.oldScore,
        optimizedScore: data.newScore,
        improvements: data.improvements || [
          "Added missing contact information formatting",
          "Enhanced skills section with industry keywords",
          "Improved experience bullets with quantifiable metrics",
          "Optimized section headers for ATS compatibility",
          "Added relevant technical skills and certifications",
        ],
      });
      setShowOptimizationModal(true);

      // Refresh data to show new score
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
Email: john.smith@email.com
Phone: (555) 123-4567
Location: San Francisco, CA
LinkedIn: linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 6+ years developing scalable web applications and leading cross-functional teams. Expertise in full-stack development, cloud architecture, and agile methodologies.

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java
Frontend: React, Vue.js, Angular, HTML5, CSS3
Backend: Node.js, Express, Django, Spring Boot
Databases: PostgreSQL, MongoDB, Redis, MySQL
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechFlow Solutions | Jan 2022 - Present
• Led development of microservices architecture serving 100k+ daily users
• Implemented automated testing pipeline reducing deployment time by 40%
• Mentored 3 junior developers and conducted technical interviews
• Optimized database queries improving application performance by 35%

Software Engineer | StartupCorp | Mar 2020 - Dec 2021
• Built responsive web applications using React and Node.js
• Developed RESTful APIs handling 10M+ requests per month
• Integrated third-party payment systems increasing conversion by 20%
• Maintained 95% test coverage and participated in code reviews

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2018
GPA: 3.7/4.0

CERTIFICATIONS
AWS Certified Solutions Architect - Associate | 2023
Certified Scrum Master (CSM) | 2021`;

    try {
      const blob = new Blob([demoResumeContent], { type: "text/plain" });
      const file = new File([blob], "demo_resume.txt", { type: "text/plain" });
      const formData = new FormData();
      formData.append("resume", file);

      toast({
        title: "Demo Upload Started",
        description: "Processing sample resume to show AI analysis...",
      });

      await apiRequest("POST", "/api/resumes/upload", formData);

      setTimeout(() => {
        toast({
          title: "AI Analysis in Progress",
          description: "Extracting skills, calculating ATS score, and finding role matches...",
        });
      }, 1000);

      setTimeout(() => {
        toast({
          title: "Analysis Complete!",
          description: "Demo resume processed. Check your dashboard for results.",
        });

        queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      }, 3500);
    } catch (error) {
      toast({
        title: "Demo Failed",
        description: "Could not process demo resume. Please try uploading your own file.",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string): ReactNode => {
    switch (type) {
      case "upload":
      case "created":
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case "tailored":
        return <Download className="h-4 w-4 text-primary-600" />;
      case "exported":
        return <Download className="h-4 w-4 text-primary-600" />;
      case "parsed":
      case "optimized":
        return <Lightbulb className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-grey-500" />;
    }
  };

  const formatTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const handleResumeBuilderComplete = (resumeId: number) => {
    setShowManualForm(false);
    refetchResumes();
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    toast({
      title: "Resume Created",
      description: "Your resume has been successfully created and is ready for optimization!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 relative">
      <GradientMesh />
      <Navigation />

      {/* Hero Banner with Premium Gradient */}
      <div
        ref={heroRef}
        className={`w-full bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 py-8 px-4 relative overflow-hidden transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Premium shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white mb-3 leading-tight">
            Transform Your Career with AI-Powered Precision
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto font-light">
            JobFit AI leverages advanced AI and real-time job market data to optimize your resume,
            match you with perfect roles, and maximize your application success rate.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Membership Tier Advertisement */}
        <div className="mb-6">
          <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden shadow-2xl">
            <CardContent className="p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-3 text-white">
                      Unlock Your Career Potential
                    </h2>
                    <p className="mb-6 text-lg text-blue-100">
                      Choose the perfect plan for your job search journey
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-3">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <span className="font-medium text-white">Plus: $0.99/month</span>
                        <span className="text-blue-100">10 resume generations</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-3">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="font-medium text-white">Pro: $4.99/month</span>
                        <span className="text-blue-100">30 resumes + AI interviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 text-lg shadow-lg"
                    >
                      View All Plans
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Section */}
        <div
          ref={headerRef}
          className={`mb-8 transition-all duration-700 delay-100 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h1 className="text-3xl font-display font-bold text-grey-900 mb-2">Dashboard</h1>
          <p className="text-grey-600">Manage your resumes and discover your perfect career fit</p>
        </div>

        {/* Quick Actions */}
        <div ref={actionsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className={`glass-card border-0 cursor-pointer group hover:shadow-glass transition-all duration-500 card-3d ${
              actionsVisible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            onClick={() => {
              const input = document.querySelector("[data-upload-trigger]") as HTMLInputElement;
              if (input) input.click();
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileUp className="text-primary-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-grey-900">Upload Resume</h3>
                  <p className="text-sm text-grey-600">PDF, DOCX, TXT</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`glass-card border-0 cursor-pointer group hover:shadow-glass transition-all duration-500 card-3d ${
              actionsVisible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            onClick={() => setShowManualForm(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-success-50 to-success-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Edit className="text-success-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-grey-900">Create Resume</h3>
                  <p className="text-sm text-grey-600">From scratch</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`glass-card border-0 cursor-pointer group hover:shadow-glass transition-all duration-500 card-3d ${
              actionsVisible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${!latestResume ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={latestResume ? handleTailorResume : undefined}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Wand2 className="text-orange-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-grey-900">Tailor Resume</h3>
                  <p className="text-sm text-grey-600">
                    {latestResume ? "For specific job" : "Upload resume first"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`glass-card border-0 cursor-pointer group hover:shadow-glass transition-all duration-500 card-3d ${
              actionsVisible[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${!latestResume ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() =>
              latestResume &&
              document.querySelector("[data-recommendations-scroll]")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Search className="text-purple-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-grey-900">Find Roles</h3>
                  <p className="text-sm text-grey-600">
                    {latestResume ? "AI recommendations" : "Upload resume first"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription-based Features */}
        {user?.subscriptionStatus === "free" && (
          <div className="mb-8">
            <AchievementSystem />
          </div>
        )}

        {user?.subscriptionStatus === "plus" && (
          <div className="mb-8">
            <JobMarketTrends resumeSection="skills" />
          </div>
        )}

        {user?.subscriptionStatus === "pro" && (
          <div className="mb-8">
            <JobBoardIntegration />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <div
              ref={uploadRef}
              className={`transition-all duration-700 ${uploadVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <Card className="glass-card border-0 card-3d overflow-hidden">
                <CardContent className="p-6 relative">
                  {/* Premium gradient accent */}
                  <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-primary-500/5 to-purple-500/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl" />

                  <h2 className="text-xl font-display font-bold text-grey-900 mb-6 flex items-center relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <Upload className="text-white h-5 w-5" />
                    </div>
                    Upload Your Resume
                  </h2>

                  <FileUpload />

                <div className="mt-6 flex justify-center">
                  <span className="text-grey-500 text-sm">or</span>
                </div>

                <div className="mt-6 text-center space-y-3">
                  <Button
                    onClick={() => setShowManualForm(true)}
                    className="bg-primary-600 text-white hover:bg-primary-700 w-full"
                  >
                    Fill Out Manually
                  </Button>
                  <Button onClick={handleDemoUpload} variant="outline" className="w-full">
                    Try Demo Resume
                  </Button>
                </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Resume Status */}
            {latestResume && (
              <Card className="glass-card border-0 card-3d">
                <CardContent className="p-6">
                  <h2 className="text-xl font-display font-bold text-grey-900 mb-6 flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <UserCircle className="text-white h-5 w-5" />
                    </div>
                    Your Profile Status
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="text-success-600 h-5 w-5" />
                        <span className="font-medium text-grey-900">Resume Uploaded</span>
                      </div>
                      <span className="text-sm text-grey-600">
                        {formatTimeAgo(latestResume.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="text-primary-600 h-5 w-5" />
                        <span className="font-medium text-grey-900">Parsing Completed</span>
                      </div>
                      <span className="text-sm text-grey-600">Complete</span>
                    </div>

                    <div className="p-4 bg-grey-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="text-success-600 h-5 w-5" />
                          <span className="font-medium text-grey-700">ATS Compliance Check</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleOptimizeResume}
                          className="text-xs"
                        >
                          Optimize
                        </Button>
                      </div>
                      <div className="w-full bg-grey-200 rounded-full h-2">
                        <div
                          className="bg-success-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${latestResume.atsScore || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-grey-600 mt-1 block">
                        Score: {latestResume.atsScore || 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="glass-card border-0 card-3d">
              <CardContent className="p-6">
                <h2 className="text-xl font-display font-bold text-grey-900 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <Clock className="text-white h-5 w-5" />
                  </div>
                  Recent Activity
                </h2>

                <div className="space-y-4">
                  {activities?.length ? (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 p-4 hover:bg-grey-50 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-grey-900">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-grey-600">{activity.description}</p>
                          )}
                          <span className="text-xs text-grey-500">
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-grey-500 text-center py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
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
            <div
              ref={statsRef}
              className={`transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <Card className="glass-card border-0 card-3d overflow-hidden">
                <CardContent className="p-6 relative">
                  {/* Premium gradient accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                  <h2 className="text-xl font-display font-bold text-grey-900 mb-6 flex items-center relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <TrendingUp className="text-white h-5 w-5" />
                    </div>
                    Quick Stats
                  </h2>

                  <div className="space-y-6 relative z-10">
                    <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl">
                      <div className="text-4xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-1">
                        {stats?.resumesCreated || 0}
                      </div>
                      <div className="text-sm text-grey-600 font-medium">Resumes Created</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100/50 rounded-xl">
                      <div className="text-4xl font-display font-bold bg-gradient-to-r from-success-600 to-success-700 bg-clip-text text-transparent mb-1">
                        {stats?.averageAtsScore || 0}%
                      </div>
                      <div className="text-sm text-grey-600 font-medium">Avg ATS Score</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl">
                      <div className="text-4xl font-display font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-1">
                        {stats?.roleMatches || 0}
                      </div>
                      <div className="text-sm text-grey-600 font-medium">Role Matches Found</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Builder Dialog */}
      <Dialog open={showManualForm} onOpenChange={setShowManualForm}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 glass-card border-0">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl">Build Your Resume</DialogTitle>
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
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0 glass-card border-0">
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

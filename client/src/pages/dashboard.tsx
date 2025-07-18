// @ts-nocheck
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useResumes, useOptimizeResume, useDeleteResume } from "@/hooks/use-resume";
import { useSubscriptionLimits, useCreateSubscription } from "@/hooks/use-subscription";
import SubscriptionModal from "@/components/subscription-modal";
import ResumeCard from "@/components/resume-card";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileUp, 
  Edit, 
  Wand2, 
  Search, 
  Upload, 
  UserCircle, 
  Clock, 
  Target,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Cog,
  Download,
  Lightbulb,
  Crown,
  Lock
} from "lucide-react";
import type { Resume, Activity } from "@shared/schema";

interface DashboardStats {
  resumesCreated: number;
  averageAtsScore: number;
  roleMatches: number;
  tailoredResumes: number;
  exports: number;
}

export default function Dashboard() {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showTailoringModal, setShowTailoringModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [optimizationData, setOptimizationData] = useState<{
    currentScore: number;
    optimizedScore: number;
    improvements: string[];
  } | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const subscriptionLimits = useSubscriptionLimits();
  const createSubscription = useCreateSubscription();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get user subscription status
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user');
      return response.json();
    },
  });

  // Fetch dashboard data
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/dashboard/stats');
      return response.json();
    },
    refetchInterval: 5000,
  });
  
  const { data: resumes = [] } = useResumes();
  
  const { data: activities } = useQuery({
    queryKey: ['/api/activities'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/activities');
      return response.json();
    },
  });

  const { data: currentResume } = useQuery({
    queryKey: ["/api/resumes", selectedResumeId],
    enabled: !!selectedResumeId,
  });

  const latestResume = resumes?.find(r => r.atsScore && r.parsedData) || resumes?.[0];

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

      const response = await apiRequest('POST', `/api/resumes/${latestResume.id}/optimize`, {});
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
          "Added relevant technical skills and certifications"
        ]
      });
      setShowOptimizationModal(true);

      // Refresh data to show new score
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
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
      const blob = new Blob([demoResumeContent], { type: 'text/plain' });
      const file = new File([blob], 'demo_resume.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', file);

      toast({
        title: "Demo Upload Started",
        description: "Processing sample resume to show AI analysis...",
      });

      await apiRequest('POST', '/api/resumes/upload', formData);
      
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
        
        queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      }, 3500);

    } catch (error) {
      toast({
        title: "Demo Failed",
        description: "Could not process demo resume. Please try uploading your own file.",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
      case 'created':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      case 'tailored':
        return <Download className="h-4 w-4 text-primary-600" />;
      case 'exported':
        return <Download className="h-4 w-4 text-primary-600" />;
      case 'parsed':
        return <Lightbulb className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-grey-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Navigation />

      {/* App Description Banner */}
      <div className="w-full bg-blue-50 border-b border-blue-200 py-4 px-4 flex items-center justify-center">
        <span className="text-lg md:text-xl font-semibold text-blue-900 text-center max-w-3xl">
          JobFit AI is a comprehensive web application designed to help job seekers optimize their resumes using AI-powered analysis, role recommendations, and tailored resume generation. The platform leverages advanced AI and real-time job market data to maximize job application success rates.
        </span>
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
                    <h2 className="text-3xl font-bold mb-3" style={{color: '#ffffff'}}>🚀 Unlock Your Career Potential</h2>
                    <p className="mb-6 text-lg" style={{color: '#f0f8ff'}}>Choose the perfect plan for your job search journey</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-3">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <span className="font-medium" style={{color: '#ffffff'}}>Plus: $0.99/month</span>
                        <span style={{color: '#e6f3ff'}}>• 10 resume generations</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white/20 rounded-lg p-3">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="font-medium" style={{color: '#ffffff'}}>Pro: $4.99/month</span>
                        <span style={{color: '#e6f3ff'}}>• 30 resumes + AI interviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 text-lg shadow-lg"
                      style={{color: '#1e40af'}}
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
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-grey-900 mb-2">Dashboard</h1>
          <p className="text-grey-600">Manage your resumes and discover your perfect career fit</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="glass-card border-0 cursor-pointer group hover:shadow-glass transition-all duration-300 shimmer"
            onClick={() => {
              const input = document.querySelector('[data-upload-trigger]') as HTMLInputElement;
              if (input) input.click();
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
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
            className="glass-card border-0 cursor-pointer group hover:shadow-glass transition-all duration-300 shimmer"
            onClick={() => setShowManualForm(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center group-hover:bg-success-100 transition-colors">
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
            className={`glass-card border-0 cursor-pointer group hover:shadow-glass transition-all duration-300 shimmer ${
              !latestResume ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleTailorResume}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Wand2 className="text-orange-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-grey-900">Tailor Resume</h3>
                  <p className="text-sm text-grey-600">
                    {latestResume ? 'For specific job' : 'Upload resume first'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`glass-card border-0 cursor-pointer group hover:shadow-glass transition-all duration-300 shimmer ${
              !latestResume ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => latestResume && document.querySelector('[data-recommendations-scroll]')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Search className="text-purple-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-grey-900">Find Roles</h3>
                  <p className="text-sm text-grey-600">
                    {latestResume ? 'AI recommendations' : 'Upload resume first'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription-based Features */}
        {user?.subscriptionStatus === 'free' && (
          <div className="mb-8">
            <AchievementSystem />
          </div>
        )}

        {user?.subscriptionStatus === 'plus' && (
          <div className="mb-8">
            <JobMarketTrends resumeSection="skills" />
          </div>
        )}

        {user?.subscriptionStatus === 'pro' && (
          <div className="mb-8">
            <JobBoardIntegration />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            <Card className="glass-card border-0 shimmer">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center">
                  <Upload className="text-primary-600 mr-3 h-5 w-5" />
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
                  <Button 
                    onClick={handleDemoUpload}
                    variant="outline"
                    className="w-full"
                  >
                    Try Demo Resume
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Resume Status */}
            {latestResume && (
              <Card className="glass-card border-0 shimmer">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center">
                    <UserCircle className="text-primary-600 mr-3 h-5 w-5" />
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
            <Card className="glass-card border-0 shimmer">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center">
                  <Clock className="text-primary-600 mr-3 h-5 w-5" />
                  Recent Activity
                </h2>
                
                <div className="space-y-4">
                  {activities?.length ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-grey-50 rounded-lg transition-colors">
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
            <Card className="glass-card border-0 shimmer">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center">
                  <TrendingUp className="text-primary-600 mr-3 h-5 w-5" />
                  Quick Stats
                </h2>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {stats?.resumesCreated || 0}
                    </div>
                    <div className="text-sm text-grey-600">Resumes Created</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-success-600 mb-1">
                      {stats?.averageAtsScore || 0}%
                    </div>
                    <div className="text-sm text-grey-600">Avg ATS Score</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {stats?.roleMatches || 0}
                    </div>
                    <div className="text-sm text-grey-600">Role Matches Found</div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              onComplete={(resumeId) => {
                setShowManualForm(false);
                refetchResumes();
                toast({
                  title: "Resume Created",
                  description: "Your resume has been successfully created and is ready for optimization!",
                });
              }}
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

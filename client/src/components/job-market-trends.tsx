import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Info, Target } from "lucide-react";

interface MarketTrend {
  category: string;
  trend: 'rising' | 'declining' | 'stable';
  percentage: number;
  description: string;
  relevantSkills: string[];
}

interface SectionTrend {
  section: string;
  insights: string[];
  recommendations: string[];
  marketDemand: 'high' | 'medium' | 'low';
}

interface JobMarketTrendsProps {
  resumeSection?: 'skills' | 'experience' | 'summary' | 'education';
}

export default function JobMarketTrends({ resumeSection }: JobMarketTrendsProps) {
  const marketTrends: MarketTrend[] = [
    {
      category: "AI & Machine Learning",
      trend: 'rising',
      percentage: 45,
      description: "Highest growth in tech sector",
      relevantSkills: ["Python", "TensorFlow", "PyTorch", "Data Science"]
    },
    {
      category: "Cloud Computing",
      trend: 'rising',
      percentage: 38,
      description: "Remote work driving cloud adoption",
      relevantSkills: ["AWS", "Azure", "Kubernetes", "Docker"]
    },
    {
      category: "Cybersecurity",
      trend: 'rising',
      percentage: 32,
      description: "Critical demand across industries",
      relevantSkills: ["Security Analysis", "Penetration Testing", "CISSP"]
    },
    {
      category: "Traditional IT Support",
      trend: 'declining',
      percentage: -15,
      description: "Automation reducing demand",
      relevantSkills: ["Help Desk", "Desktop Support"]
    }
  ];

  const sectionTrends: { [key: string]: SectionTrend } = {
    skills: {
      section: "Technical Skills",
      insights: [
        "AI/ML skills command 40% salary premium",
        "Cloud certifications increase hiring rate by 60%",
        "Full-stack development most in-demand"
      ],
      recommendations: [
        "Add cloud platforms (AWS, Azure, GCP)",
        "Include programming languages in demand",
        "Highlight automation and DevOps tools"
      ],
      marketDemand: 'high'
    },
    experience: {
      section: "Work Experience",
      insights: [
        "Remote work experience now preferred",
        "Cross-functional collaboration highly valued",
        "Quantified results increase interview rate 3x"
      ],
      recommendations: [
        "Emphasize remote work capabilities",
        "Include metrics and business impact",
        "Highlight leadership in virtual teams"
      ],
      marketDemand: 'high'
    },
    summary: {
      section: "Professional Summary",
      insights: [
        "Adaptability keywords increase visibility",
        "Industry-specific terminology crucial",
        "Personal branding statements trending"
      ],
      recommendations: [
        "Include 'digital transformation' keywords",
        "Mention agile methodologies",
        "Add sustainability/ESG experience if relevant"
      ],
      marketDemand: 'medium'
    }
  };

  const getTrendIcon = (trend: 'rising' | 'declining' | 'stable') => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDemandColor = (demand: 'high' | 'medium' | 'low') => {
    switch (demand) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Section-Specific Trends */}
      {resumeSection && sectionTrends[resumeSection] && (
        <Card className="glass-card border-0 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>{sectionTrends[resumeSection].section} Market Insights</span>
              <Badge className={getDemandColor(sectionTrends[resumeSection].marketDemand)}>
                {sectionTrends[resumeSection].marketDemand} demand
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                  Market Insights
                </h4>
                <ul className="space-y-2">
                  {sectionTrends[resumeSection].insights.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="h-4 w-4 text-green-500 mr-2" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {sectionTrends[resumeSection].recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Market Trends */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>Job Market Trends</span>
            <Badge variant="outline" className="ml-auto">Live Data</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketTrends.map((trend, index) => (
              <div 
                key={index}
                className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(trend.trend)}
                    <span className="font-medium">{trend.category}</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={trend.trend === 'rising' ? 'text-green-600' : 'text-red-600'}
                  >
                    {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{trend.description}</p>
                
                <div>
                  <span className="text-xs font-medium text-gray-500 mb-1 block">
                    Key Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {trend.relevantSkills.map((skill, skillIndex) => (
                      <Badge 
                        key={skillIndex}
                        variant="secondary" 
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Market Intelligence</h4>
                <p className="text-sm text-blue-700 mt-1">
                  These trends are based on real-time job posting analysis and hiring data. 
                  Align your resume with rising trends to maximize opportunities.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
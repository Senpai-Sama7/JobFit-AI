/**
 * JobFit-AI Role Recommendations Component
 * Version: 2025-07-10
 * Maintainer: JobFit-AI Team
 *
 * Notes:
 * - Displays AI-powered job role matches based on resume analysis.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import type { RoleRecommendation } from "@shared/schema";

interface RoleRecommendationsProps {
  resumeId: number;
}

export default function RoleRecommendations({ resumeId }: RoleRecommendationsProps) {
  const [showAllRoles, setShowAllRoles] = useState(false);
  
  const { data: recommendations, isLoading } = useQuery<RoleRecommendation[]>({
    queryKey: [`/api/resumes/${resumeId}/recommendations`],
    enabled: !!resumeId,
  });

  console.log("Role recommendations data:", { resumeId, recommendations, isLoading });

  if (isLoading) {
    return (
      <Card className="shadow-material">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-grey-200 rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border border-grey-200 rounded-lg">
                  <div className="h-4 bg-grey-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-grey-200 rounded w-full mb-3"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-grey-200 rounded w-16"></div>
                    <div className="h-6 bg-grey-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations?.length) {
    return (
      <Card className="shadow-material">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center justify-between">
            <span className="flex items-center">
              <Target className="text-primary-600 mr-3 h-5 w-5" />
              Top Role Matches
            </span>
          </h2>
          <p className="text-grey-500 text-center py-8">
            No role recommendations available. Upload a resume to see matches.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success-600 bg-success-500";
    if (score >= 70) return "text-orange-600 bg-orange-500";
    return "text-grey-600 bg-grey-500";
  };

  return (
    <Card className="glass-card border-0 shimmer">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center justify-between">
          <span className="flex items-center">
            <Target className="text-primary-600 mr-3 h-5 w-5" />
            Top Role Matches
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-600 hover:text-primary-700"
            onClick={() => setShowAllRoles(!showAllRoles)}
          >
            {showAllRoles ? 'Show Less' : 'View All'}
          </Button>
        </h2>
        
        <div className="space-y-4">
          {(showAllRoles ? recommendations : recommendations?.slice(0, 5))?.map((role) => (
            <Card 
              key={role.id} 
              className="glass-card border-0 hover:shadow-glass transition-all duration-300 cursor-pointer iridescent-border"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-grey-900 text-sm">{role.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold text-sm ${getScoreColor(role.fitScore).split(' ')[0]}`}>
                      {role.fitScore}%
                    </span>
                    <div className="w-16 bg-grey-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getScoreColor(role.fitScore).split(' ')[1]}`}
                        style={{ width: `${role.fitScore}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-grey-600 mb-3 line-clamp-2">
                  {role.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {role.requiredSkills?.slice(0, 3).map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="secondary" 
                      className="bg-primary-100 text-primary-700 text-xs"
                    >
                      {skill}
                    </Badge>
                  )) || []}
                  {role.requiredSkills && role.requiredSkills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.requiredSkills.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

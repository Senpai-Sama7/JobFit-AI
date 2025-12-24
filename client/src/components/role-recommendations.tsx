import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Loader2 } from "lucide-react";

/**
 * Extended role recommendation type that includes API response fields
 */
interface ExtendedRoleRecommendation {
  id: number;
  resumeId: number;
  jobTitle: string | null;
  title?: string | null; // Alias from API
  companyName: string | null;
  fitScore: number | null;
  description: string | null;
  source: string | null;
  requiredSkills?: string[]; // Added by API for display
  createdAt: Date;
}

interface RoleRecommendationsProps {
  resumeId: number;
}

export default function RoleRecommendations({ resumeId }: RoleRecommendationsProps) {
  const [showAllRoles, setShowAllRoles] = useState(false);

  const { data: recommendations, isLoading, error } = useQuery<ExtendedRoleRecommendation[]>({
    queryKey: [`/api/resumes/${resumeId}/recommendations`],
    enabled: !!resumeId,
  });

  if (isLoading) {
    return (
      <Card className="shadow-material">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-3 text-grey-600">Finding role matches...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-material">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center">
            <Target className="text-primary-600 mr-3 h-5 w-5" />
            Top Role Matches
          </h2>
          <p className="text-red-500 text-center py-4">
            Unable to load recommendations. Please try again later.
          </p>
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

  const getScoreColor = (score: number | null): { text: string; bg: string } => {
    const s = score || 0;
    if (s >= 85) return { text: "text-success-600", bg: "bg-success-500" };
    if (s >= 70) return { text: "text-orange-600", bg: "bg-orange-500" };
    return { text: "text-grey-600", bg: "bg-grey-500" };
  };

  const displayedRoles = showAllRoles ? recommendations : recommendations.slice(0, 5);

  return (
    <Card className="glass-card border-0 shimmer">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center justify-between">
          <span className="flex items-center">
            <Target className="text-primary-600 mr-3 h-5 w-5" />
            Top Role Matches
          </span>
          {recommendations.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:text-primary-700"
              onClick={() => setShowAllRoles(!showAllRoles)}
            >
              {showAllRoles ? "Show Less" : "View All"}
            </Button>
          )}
        </h2>

        <div className="space-y-4">
          {displayedRoles.map((role) => {
            const displayTitle = role.title || role.jobTitle || "Untitled Role";
            const scoreColors = getScoreColor(role.fitScore);
            const fitScoreValue = role.fitScore || 0;

            return (
              <Card
                key={role.id}
                className="glass-card border-0 hover:shadow-glass transition-all duration-300 cursor-pointer iridescent-border"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-grey-900 text-sm">{displayTitle}</h3>
                      {role.companyName && (
                        <p className="text-xs text-grey-500">{role.companyName}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`font-semibold text-sm ${scoreColors.text}`}>
                        {fitScoreValue}%
                      </span>
                      <div className="w-16 bg-grey-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${scoreColors.bg}`}
                          style={{ width: `${fitScoreValue}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {role.description && (
                    <p className="text-sm text-grey-600 mb-3 line-clamp-2">
                      {role.description}
                    </p>
                  )}

                  {role.requiredSkills && role.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {role.requiredSkills.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          variant="secondary"
                          className="bg-primary-100 text-primary-700 text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {role.requiredSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.requiredSkills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

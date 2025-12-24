import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import type { Resume, ParsedResume } from "@shared/schema";

interface SkillProfileProps {
  resume: Resume;
}

interface SkillWithLevel {
  name: string;
  level: number;
}

interface CategorizedSkills {
  technical: SkillWithLevel[];
  soft: SkillWithLevel[];
  domain: SkillWithLevel[];
}

export default function SkillProfile({ resume }: SkillProfileProps) {
  const parsedData = resume.parsedData as ParsedResume | null;

  if (!parsedData) {
    return (
      <Card className="shadow-material">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center">
            <BarChart3 className="text-primary-600 mr-3 h-5 w-5" />
            Your Skill Profile
          </h2>
          <p className="text-grey-500 text-center py-8">
            Resume not yet processed. Please wait for parsing to complete.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Categorize skills by type with deterministic levels based on skill name hash
  const categorizeSkills = (skills: string[]): CategorizedSkills => {
    const technical: SkillWithLevel[] = [];
    const soft: SkillWithLevel[] = [];
    const domain: SkillWithLevel[] = [];

    const techKeywords = ['python', 'sql', 'javascript', 'react', 'java', 'c++', 'html', 'css', 'git', 'aws', 'docker', 'kubernetes', 'tableau', 'excel', 'power bi'];
    const softKeywords = ['leadership', 'communication', 'teamwork', 'project management', 'problem solving', 'analytical', 'creative'];
    const domainKeywords = ['data analysis', 'machine learning', 'marketing', 'finance', 'sales', 'operations'];

    // Generate a deterministic level based on skill name hash
    const getSkillLevel = (skillName: string): number => {
      let hash = 0;
      for (let i = 0; i < skillName.length; i++) {
        hash = ((hash << 5) - hash) + skillName.charCodeAt(i);
        hash |= 0;
      }
      return 70 + Math.abs(hash % 31); // Level between 70-100
    };

    skills.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      const level = getSkillLevel(skill);

      if (techKeywords.some(keyword => lowerSkill.includes(keyword))) {
        technical.push({ name: skill, level });
      } else if (softKeywords.some(keyword => lowerSkill.includes(keyword))) {
        soft.push({ name: skill, level });
      } else if (domainKeywords.some(keyword => lowerSkill.includes(keyword))) {
        domain.push({ name: skill, level });
      } else {
        // Default to technical
        technical.push({ name: skill, level });
      }
    });

    return { technical, soft, domain };
  };

  const { technical, soft, domain } = categorizeSkills(parsedData.skills || []);
  
  // Calculate category averages
  const categories = [
    { name: 'Technical Skills', skills: technical, color: 'bg-primary-600' },
    { name: 'Data Analysis', skills: domain, color: 'bg-success-500' },
    { name: 'Project Management', skills: soft, color: 'bg-orange-500' },
    { name: 'Communication', skills: soft, color: 'bg-success-500' },
  ];

  const getLevel = (score: number) => {
    if (score >= 90) return 'Expert';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <Card className="glass-card border-0 shimmer">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-grey-900 mb-6 flex items-center">
          <BarChart3 className="text-primary-600 mr-3 h-5 w-5" />
          Your Skill Profile
        </h2>
        
        <div className="space-y-4">
          {categories.map((category) => {
            const avgScore = category.skills.length > 0
              ? Math.round(category.skills.reduce((sum, skill) => sum + skill.level, 0) / category.skills.length)
              : 75; // Default score when no skills in category

            return (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-grey-700">{category.name}</span>
                  <span className="text-sm text-grey-600">{getLevel(avgScore)}</span>
                </div>
                <div className="w-full bg-grey-200 rounded-full h-3">
                  <div 
                    className={`${category.color} h-3 rounded-full transition-all duration-1000`}
                    style={{ width: `${avgScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-grey-200">
          <h3 className="font-semibold text-grey-900 mb-3">Top Skills</h3>
          <div className="flex flex-wrap gap-2">
            {parsedData.skills && parsedData.skills.length > 0 ? (
              parsedData.skills.slice(0, 8).map((skill: string) => (
                <Badge
                  key={skill}
                  className="bg-primary-100 text-primary-700 hover:bg-primary-200"
                >
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-grey-500 text-sm">No skills extracted yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

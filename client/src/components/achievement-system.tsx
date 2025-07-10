/**
 * JobFit-AI Achievement System Component
 * Version: 2025-07-10
 * Maintainer: JobFit-AI Team
 *
 * Notes:
 * - Tracks user achievements and weekly challenges for engagement.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Star, CheckCircle, Award, TrendingUp } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  points: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  requirement: string;
  reward: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

export default function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_upload",
      title: "Getting Started",
      description: "Upload your first resume",
      icon: <Trophy className="h-5 w-5 text-yellow-500" />,
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      points: 50
    },
    {
      id: "ats_scorer",
      title: "ATS Expert",
      description: "Achieve 80+ ATS score",
      icon: <Target className="h-5 w-5 text-blue-500" />,
      progress: 0,
      maxProgress: 80,
      unlocked: false,
      points: 100
    },
    {
      id: "skill_master",
      title: "Skill Master",
      description: "Add 15+ skills to your resume",
      icon: <Star className="h-5 w-5 text-purple-500" />,
      progress: 0,
      maxProgress: 15,
      unlocked: false,
      points: 75
    },
    {
      id: "experience_boost",
      title: "Experience Booster",
      description: "Add quantified metrics to 3 job experiences",
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      progress: 0,
      maxProgress: 3,
      unlocked: false,
      points: 125
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "weekly_optimization",
      title: "Weekly Optimization Challenge",
      description: "Improve your resume's ATS score by 10 points this week",
      requirement: "Increase ATS score by 10 points",
      reward: "Achievement Badge + Resume Tips",
      progress: 0,
      maxProgress: 10,
      completed: false
    },
    {
      id: "skill_diversity",
      title: "Skill Diversity Challenge",
      description: "Add skills from 5 different categories",
      requirement: "Add technical, soft, and domain skills",
      reward: "Skill Profile Boost",
      progress: 2,
      maxProgress: 5,
      completed: false
    }
  ]);

  const totalPoints = achievements.reduce((sum, achievement) => 
    achievement.unlocked ? sum + achievement.points : sum, 0
  );

  const getProgressColor = (progress: number, max: number) => {
    const percentage = (progress / max) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <span>Achievement Progress</span>
            <Badge variant="secondary" className="ml-auto">
              {totalPoints} points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {achievement.icon}
                    <span className="font-medium">{achievement.title}</span>
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100}
                    className="h-2"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="outline" className="text-xs">
                    {achievement.points} pts
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span>Weekly Challenges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div 
                key={challenge.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                  {challenge.completed && (
                    <Badge className="bg-green-500">Completed</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Requirement: {challenge.requirement}</span>
                    <span>{challenge.progress}/{challenge.maxProgress}</span>
                  </div>
                  <Progress 
                    value={(challenge.progress / challenge.maxProgress) * 100}
                    className="h-2"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-green-600">Reward: {challenge.reward}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={challenge.completed}
                  >
                    {challenge.completed ? 'Claimed' : 'Track Progress'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
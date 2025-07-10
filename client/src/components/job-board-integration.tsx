/**
 * JobFit-AI Job Board Integration Component
 * Version: 2025-07-10
 * Maintainer: JobFit-AI Team
 *
 * Notes:
 * - Integrates job search and application tracking with external job boards.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Search, MapPin, Clock, DollarSign, Building, Target, CheckCircle } from "lucide-react";

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  postedDate: string;
  matchScore: number;
  source: 'LinkedIn' | 'Indeed' | 'Glassdoor' | 'AngelList';
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  skills: string[];
  applied: boolean;
}

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'Applied' | 'Reviewed' | 'Interview' | 'Rejected' | 'Offer';
  source: string;
  notes?: string;
}

export default function JobBoardIntegration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'search' | 'applications'>('search');

  const jobListings: JobListing[] = [
    {
      id: "1",
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      salary: "$150K - $200K",
      postedDate: "2 days ago",
      matchScore: 92,
      source: 'LinkedIn',
      type: 'Full-time',
      skills: ["React", "TypeScript", "Node.js", "AWS"],
      applied: false
    },
    {
      id: "2",
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Remote",
      salary: "$120K - $160K",
      postedDate: "1 week ago",
      matchScore: 87,
      source: 'AngelList',
      type: 'Remote',
      skills: ["JavaScript", "Python", "MongoDB", "Docker"],
      applied: true
    },
    {
      id: "3",
      title: "Frontend Engineer",
      company: "Design Studio",
      location: "New York, NY",
      salary: "$100K - $140K",
      postedDate: "3 days ago",
      matchScore: 78,
      source: 'Indeed',
      type: 'Full-time',
      skills: ["React", "CSS", "Figma", "TypeScript"],
      applied: false
    }
  ];

  const applications: Application[] = [
    {
      id: "1",
      jobTitle: "Senior React Developer",
      company: "Meta",
      appliedDate: "2024-01-05",
      status: 'Interview',
      source: 'LinkedIn',
      notes: "Second round interview scheduled for next week"
    },
    {
      id: "2",
      jobTitle: "Full Stack Engineer",
      company: "Google",
      appliedDate: "2024-01-03",
      status: 'Reviewed',
      source: 'Indeed'
    },
    {
      id: "3",
      jobTitle: "Frontend Developer",
      company: "Apple",
      appliedDate: "2023-12-28",
      status: 'Rejected',
      source: 'Glassdoor'
    }
  ];

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 75) return "text-blue-600 bg-blue-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return "bg-blue-100 text-blue-800";
      case 'Reviewed':
        return "bg-yellow-100 text-yellow-800";
      case 'Interview':
        return "bg-purple-100 text-purple-800";
      case 'Rejected':
        return "bg-red-100 text-red-800";
      case 'Offer':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceIcon = (source: string) => {
    return <ExternalLink className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'search' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Job Search
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'applications' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Application Tracker
        </button>
      </div>

      {activeTab === 'search' && (
        <>
          {/* Job Search */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-blue-500" />
                <span>Smart Job Search</span>
                <Badge variant="outline">AI-Powered</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-6">
                <Input
                  placeholder="Search jobs based on your resume..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="space-y-4">
                {jobListings.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <Badge className={getMatchColor(job.matchScore)}>
                            {job.matchScore}% match
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {job.company}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{job.source}</Badge>
                        <Badge variant="secondary">{job.type}</Badge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700 mr-2">Skills:</span>
                      <div className="inline-flex flex-wrap gap-1">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.postedDate}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          {getSourceIcon(job.source)}
                          View Job
                        </Button>
                        <Button 
                          size="sm" 
                          disabled={job.applied}
                          className={job.applied ? "bg-green-500" : ""}
                        >
                          {job.applied ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Applied
                            </>
                          ) : (
                            'Apply Now'
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Match Score Progress */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Resume Match Score</span>
                        <span>{job.matchScore}%</span>
                      </div>
                      <Progress value={job.matchScore} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Based on your resume skills and experience alignment
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'applications' && (
        <>
          {/* Application Tracker */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-500" />
                <span>Application Tracker</span>
                <Badge variant="outline">{applications.length} applications</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                        <p className="text-sm text-gray-600">{app.company}</p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span>Applied: {app.appliedDate}</span>
                      <span>Source: {app.source}</span>
                    </div>

                    {app.notes && (
                      <div className="p-2 bg-blue-50 rounded text-sm text-blue-700 mb-3">
                        {app.notes}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Application
                        </Button>
                        <Button variant="outline" size="sm">
                          Add Note
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Application Statistics */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
                  <div className="text-sm text-blue-700">Total Applications</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {applications.filter(app => app.status === 'Interview').length}
                  </div>
                  <div className="text-sm text-purple-700">Interviews</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((applications.filter(app => ['Interview', 'Offer'].includes(app.status)).length / applications.length) * 100)}%
                  </div>
                  <div className="text-sm text-green-700">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
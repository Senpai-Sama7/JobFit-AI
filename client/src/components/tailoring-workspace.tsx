import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { highlightText, getScoreColor } from "@/lib/utils";
import {
  X,
  RotateCcw,
  Wand2,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import type { Resume, TailoredResume, ParsedResume, ExperienceEntry, EducationEntry } from "@shared/schema";

interface TailoringWorkspaceProps {
  resumeId: number | null;
  onClose: () => void;
}

interface ExtendedResume extends Resume {
  recommendations?: Array<{
    id: number;
    jobTitle: string;
    companyName: string;
    fitScore: number;
    description: string;
  }>;
}

interface Improvement {
  type: string;
  reasoning: string;
}

export default function TailoringWorkspace({ resumeId, onClose }: TailoringWorkspaceProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTailoredResume, setCurrentTailoredResume] = useState<TailoredResume | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: resume, isLoading: resumeLoading } = useQuery<ExtendedResume>({
    queryKey: ["/api/resumes", resumeId],
    queryFn: async () => {
      if (!resumeId) throw new Error("No resume ID");
      const response = await apiRequest("GET", `/api/resumes/${resumeId}`);
      return response.json();
    },
    enabled: !!resumeId,
  });

  const tailorMutation = useMutation({
    mutationFn: async (data: { resumeId: number; jobDescription: string }) => {
      const response = await apiRequest("POST", `/api/resumes/${data.resumeId}/tailor`, {
        jobDescription: data.jobDescription,
      });
      return response.json() as Promise<TailoredResume>;
    },
    onSuccess: (data: TailoredResume) => {
      setCurrentTailoredResume(data);
      setIsProcessing(false);
      toast({
        title: "Resume Tailored Successfully",
        description: `ATS Score improved to ${data.atsScore}%`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast({
        title: "Tailoring Failed",
        description: error.message || "Failed to tailor resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (data: { resumeId: number; format: string }) => {
      const response = await apiRequest("POST", `/api/resumes/${data.resumeId}/export`, {
        format: data.format,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Export Successful",
        description: `Resume exported as ${(data.format as string)?.toUpperCase() || "TXT"}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTailorResume = () => {
    if (!resumeId || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a job description to tailor your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    tailorMutation.mutate({ resumeId, jobDescription });
  };

  const handleReset = () => {
    setCurrentTailoredResume(null);
    setJobDescription("");
  };

  const handleExport = (format: string) => {
    if (!resumeId) return;
    exportMutation.mutate({ resumeId, format });
  };

  const renderResumeContent = (parsedData: ParsedResume | null, highlights: string[] = []) => {
    if (!parsedData) return <div className="text-grey-500">No content available</div>;

    return (
      <div className="text-sm text-grey-700 space-y-4">
        {/* Header */}
        <div className="border-b border-grey-200 pb-4">
          <div className="font-bold text-lg text-grey-900">
            {parsedData.contact?.name || "Unknown"}
          </div>
          <div className="text-grey-600">
            {parsedData.contact?.email} {parsedData.contact?.phone && `• ${parsedData.contact.phone}`}{" "}
            {parsedData.contact?.location && `• ${parsedData.contact.location}`}
          </div>
          {parsedData.contact?.linkedin && (
            <div className="text-primary-600 text-sm">{parsedData.contact.linkedin}</div>
          )}
        </div>

        {/* Summary */}
        {parsedData.summary && (
          <div>
            <div className="font-semibold text-grey-900 mb-2">PROFESSIONAL SUMMARY</div>
            <div
              className="text-grey-700"
              dangerouslySetInnerHTML={{
                __html:
                  highlights.length > 0
                    ? highlightText(parsedData.summary, highlights)
                    : parsedData.summary,
              }}
            />
          </div>
        )}

        {/* Experience */}
        {parsedData.experience && parsedData.experience.length > 0 && (
          <div>
            <div className="font-semibold text-grey-900 mb-3">PROFESSIONAL EXPERIENCE</div>
            <div className="space-y-4">
              {parsedData.experience.map((exp: ExperienceEntry, index: number) => (
                <div key={index}>
                  <div className="font-medium text-grey-900">{exp.role || exp.title}</div>
                  <div className="text-grey-600 text-sm mb-2">
                    {exp.company} • {exp.startDate} - {exp.endDate || "Present"}
                  </div>
                  {(exp.bullets || exp.details) && (exp.bullets || exp.details)!.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {(exp.bullets || exp.details)!.map((bullet: string, bulletIndex: number) => (
                        <li
                          key={bulletIndex}
                          className="text-grey-700"
                          dangerouslySetInnerHTML={{
                            __html:
                              highlights.length > 0 ? highlightText(bullet, highlights) : bullet,
                          }}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {parsedData.education && parsedData.education.length > 0 && (
          <div>
            <div className="font-semibold text-grey-900 mb-2">EDUCATION</div>
            <div className="space-y-2">
              {parsedData.education.map((edu: EducationEntry | string, index: number) => {
                if (typeof edu === "string") {
                  return (
                    <div key={index}>
                      <div className="font-medium text-grey-900">{edu}</div>
                    </div>
                  );
                }
                return (
                  <div key={index}>
                    <div className="font-medium text-grey-900">{edu.degree}</div>
                    <div className="text-grey-600 text-sm">
                      {edu.institution} {edu.graduationDate && `• ${edu.graduationDate}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Skills */}
        {parsedData.skills && parsedData.skills.length > 0 && (
          <div>
            <div className="font-semibold text-grey-900 mb-2">SKILLS</div>
            <div className="flex flex-wrap gap-2">
              {parsedData.skills.map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className={`text-xs ${
                    highlights.some((h) => skill.toLowerCase().includes(h.toLowerCase()))
                      ? "bg-yellow-200 text-grey-900 border-yellow-300"
                      : "bg-grey-100 text-grey-700"
                  }`}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const extractHighlights = (tailoredResume: TailoredResume): string[] => {
    const highlights: string[] = [];

    if (tailoredResume.improvements && Array.isArray(tailoredResume.improvements)) {
      (tailoredResume.improvements as Improvement[]).forEach((improvement: Improvement) => {
        if (improvement.type === "keyword_added") {
          const keywords = improvement.reasoning.match(/:\s*([^.]+)/);
          if (keywords) {
            const keywordList = keywords[1].split(",").map((k: string) => k.trim());
            highlights.push(...keywordList);
          }
        }
      });
    }

    return highlights;
  };

  if (resumeLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-grey-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-grey-600">Resume not found</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </div>
    );
  }

  const parsedResumeData = resume.parsedData as ParsedResume | null;
  const tailoredContent = currentTailoredResume?.tailoredContent as ParsedResume | null;
  const improvements = currentTailoredResume?.improvements as Improvement[] | null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-grey-200">
        <h3 className="text-xl font-semibold text-grey-900">Resume Tailoring Workspace</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Job Description Input */}
      <div className="p-6 border-b border-grey-200 bg-grey-50">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-grey-900 mb-2">
              Job Description
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to tailor your resume..."
              className="min-h-[100px] resize-none"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleTailorResume}
              disabled={!jobDescription.trim() || isProcessing}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Tailor Resume
                </>
              )}
            </Button>
            {currentTailoredResume && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Two-Pane Editor */}
      <div className="flex-1 flex min-h-0">
        {/* Left Pane - Original Resume */}
        <div className="w-1/2 border-r border-grey-200 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-grey-200 bg-white">
            <h4 className="font-semibold text-grey-900">Original Resume</h4>
            <div className="flex items-center space-x-2">
              {resume.atsScore && (
                <Badge variant="outline" className={getScoreColor(resume.atsScore).text}>
                  ATS Score: {resume.atsScore}%
                </Badge>
              )}
            </div>
          </div>
          <div className="flex-1 p-4 bg-grey-50 overflow-y-auto">
            {parsedResumeData ? (
              renderResumeContent(parsedResumeData)
            ) : (
              <div className="text-center text-grey-500 py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-grey-400" />
                <p>Resume content not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Tailored Resume */}
        <div className="w-1/2 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-grey-200 bg-white">
            <h4 className="font-semibold text-grey-900">Tailored Resume</h4>
            <div className="flex items-center space-x-2">
              {currentTailoredResume?.atsScore && (
                <Badge
                  className={`${getScoreColor(currentTailoredResume.atsScore).text} bg-success-50 border-success-200`}
                >
                  ATS Score: {currentTailoredResume.atsScore}%
                </Badge>
              )}
            </div>
          </div>
          <div className="flex-1 p-4 bg-grey-50 overflow-y-auto">
            {tailoredContent ? (
              renderResumeContent(tailoredContent, extractHighlights(currentTailoredResume!))
            ) : (
              <div className="text-center text-grey-500 py-8">
                <Wand2 className="h-12 w-12 mx-auto mb-4 text-grey-400" />
                <p>Tailored version will appear here</p>
                <p className="text-sm mt-2">
                  Enter a job description and click "Tailor Resume" to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Improvements Summary */}
      {improvements && improvements.length > 0 && (
        <div className="border-t border-grey-200 p-4 bg-white max-h-48 overflow-y-auto">
          <h5 className="font-semibold text-grey-900 mb-3">Improvements Made</h5>
          <div className="space-y-2">
            {improvements.map((improvement: Improvement, index: number) => (
              <div
                key={index}
                className="text-sm bg-success-50 border border-success-200 rounded-lg p-3"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-success-600" />
                  <span className="font-medium text-success-700 capitalize">
                    {improvement.type.replace("_", " ")}
                  </span>
                </div>
                <p className="text-grey-700">{improvement.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-6 border-t border-grey-200 bg-white">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleReset} disabled={!currentTailoredResume}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={handleTailorResume}
            disabled={!jobDescription.trim() || isProcessing}
            className="text-orange-700 border-orange-200 hover:bg-orange-50"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Auto-Enhance
          </Button>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" disabled={!currentTailoredResume}>
            Save Draft
          </Button>
          <Button
            onClick={() => handleExport("txt")}
            disabled={!currentTailoredResume || exportMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            {exportMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Resume
          </Button>
        </div>
      </div>
    </div>
  );
}

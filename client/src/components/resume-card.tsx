import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Wand2,
  FileText,
  Calendar,
  Target,
  Sparkles,
  Copy,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteResume, useOptimizeResume } from "@/hooks/use-resume";
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo, getScoreColor } from "@/lib/utils";
import ExportModal from "./export-modal";
import type { Resume } from "@shared/schema";

/**
 * Extended Resume type with additional fields that may come from the API
 */
interface ExtendedResume extends Omit<Resume, 'createdAt'> {
  uploadedAt?: Date;
  createdAt: Date;
}

/**
 * Optimization result returned from the optimize mutation
 */
interface OptimizationResult {
  oldScore: number;
  newScore: number;
  improvements: string[];
}

interface ResumeCardProps {
  resume: Resume;
  onTailor: (resumeId: number) => void;
  onOptimize: (data: { currentScore: number; optimizedScore: number; improvements: string[] }) => void;
}

export default function ResumeCard({ resume, onTailor, onOptimize }: ResumeCardProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const deleteResume = useDeleteResume();
  const optimizeMutation = useOptimizeResume();
  const { toast } = useToast();

  const handleOptimize = async () => {
    try {
      toast({
        title: "Optimizing Resume",
        description: "AI is analyzing and improving your resume...",
      });

      const result = await optimizeMutation.mutateAsync(resume.id);

      // Runtime validation to ensure the result matches the expected shape
      if (
        typeof result !== 'object' ||
        result === null ||
        typeof result.oldScore !== 'number' ||
        typeof result.newScore !== 'number' ||
        !Array.isArray(result.improvements)
      ) {
        console.error("Invalid optimization result shape:", result);
        toast({
          title: "Optimization Error",
          description: "Received invalid data from server. Please try again.",
          variant: "destructive",
        });
        return;
      }

      onOptimize({
        currentScore: result.oldScore,
        optimizedScore: result.newScore,
        improvements: result.improvements,
      });
    } catch (error) {
      console.error('Optimization failed:', error);
      toast({
        title: "Optimization Failed",
        description: "Could not optimize resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResume.mutateAsync(resume.id);
      setShowDeleteDialog(false);
      toast({
        title: "Resume Deleted",
        description: "Your resume has been permanently deleted.",
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(resume.originalFileName || 'Resume');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = getScoreColor(resume.atsScore || 0);
  const isProcessing = resume.processingStatus === 'processing' || resume.processingStatus === 'pending';
  const hasScore = resume.atsScore !== null && resume.atsScore !== undefined;

  return (
    <TooltipProvider>
      <>
        <Card className="glass-card border-0 group hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-grey-900 truncate max-w-[200px]">
                        {resume.originalFileName}
                      </h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleCopyName}
                          >
                            {copied ? (
                              <CheckCircle className="h-3 w-3 text-success-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-grey-400" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copied ? 'Copied!' : 'Copy filename'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Badge
                      variant={resume.processingStatus === 'completed' ? 'default' : 'secondary'}
                      className={`text-xs mt-1 ${
                        isProcessing
                          ? 'bg-orange-100 text-orange-700'
                          : resume.processingStatus === 'completed'
                          ? 'bg-success-100 text-success-700'
                          : 'bg-grey-100 text-grey-700'
                      }`}
                    >
                      {isProcessing && <Sparkles className="h-3 w-3 mr-1 animate-pulse" />}
                      {resume.processingStatus}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-grey-500 mt-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatTimeAgo(resume.createdAt)}</span>
                  </div>
                  {hasScore && (
                    <div className="flex items-center space-x-1">
                      <Target className="h-3 w-3" />
                      <span className={`font-medium ${scoreColor.text}`}>
                        ATS: {resume.atsScore}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-grey-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-0 w-48">
                  <DropdownMenuItem onClick={() => onTailor(resume.id)} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4 text-primary-600" />
                    Tailor Resume
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowExportModal(true)} className="cursor-pointer">
                    <Download className="mr-2 h-4 w-4 text-blue-600" />
                    Export Resume
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleOptimize}
                    disabled={optimizeMutation.isPending || isProcessing}
                    className="cursor-pointer"
                  >
                    <Wand2 className="mr-2 h-4 w-4 text-purple-600" />
                    {optimizeMutation.isPending ? 'Optimizing...' : 'AI Optimize'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleteResume.isPending}
                    className="text-red-600 hover:text-red-700 cursor-pointer focus:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ATS Score Progress */}
            {hasScore && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-grey-600 font-medium">ATS Compatibility</span>
                  <span className={`font-bold ${scoreColor.text}`}>
                    {resume.atsScore}%
                  </span>
                </div>
                <div className="relative">
                  <Progress value={resume.atsScore || 0} className="h-2" />
                  {(resume.atsScore || 0) >= 80 && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                {(resume.atsScore || 0) < 60 && (
                  <p className="text-xs text-orange-600 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Click Optimize to improve your score
                  </p>
                )}
              </div>
            )}

            {/* Processing state */}
            {isProcessing && (
              <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center space-x-2 text-orange-700">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">AI is analyzing your resume...</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTailor(resume.id)}
                      disabled={isProcessing}
                      className="flex items-center space-x-1 hover:border-primary-500 hover:text-primary-600"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Tailor</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Customize for a specific job</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOptimize}
                      disabled={optimizeMutation.isPending || isProcessing}
                      className="flex items-center space-x-1 hover:border-purple-500 hover:text-purple-600"
                    >
                      {optimizeMutation.isPending ? (
                        <Sparkles className="h-3 w-3 animate-spin" />
                      ) : (
                        <Wand2 className="h-3 w-3" />
                      )}
                      <span>{optimizeMutation.isPending ? 'Optimizing...' : 'Optimize'}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>AI-powered ATS optimization</TooltipContent>
                </Tooltip>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExportModal(true)}
                    disabled={isProcessing}
                    className="flex items-center space-x-1 hover:border-blue-500 hover:text-blue-600"
                  >
                    <Download className="h-3 w-3" />
                    <span>Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download in multiple formats</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          resumeId={resume.id}
          resumeName={resume.originalFileName || 'resume'}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="glass-card border-0">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <span>Delete Resume</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-grey-600">
                Are you sure you want to delete "{resume.originalFileName}"? This action cannot be undone
                and all associated data including optimization history will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteResume.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteResume.isPending ? 'Deleting...' : 'Delete Resume'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </TooltipProvider>
  );
}
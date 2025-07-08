import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2, 
  Wand2, 
  FileText,
  Calendar,
  Target
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteResume, useOptimizeResume } from "@/hooks/use-resume";
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo, getScoreColor } from "@/lib/utils";
import ExportModal from "./export-modal";
import type { Resume } from "@shared/schema";

interface ResumeCardProps {
  resume: Resume;
  onTailor: (resumeId: number) => void;
  onOptimize: (data: { currentScore: number; optimizedScore: number; improvements: string[] }) => void;
}

export default function ResumeCard({ resume, onTailor, onOptimize }: ResumeCardProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();
  const deleteResume = useDeleteResume();
  const optimizeMutation = useOptimizeResume();

  const handleOptimize = async () => {
    try {
      const result = await optimizeMutation.mutateAsync(resume.id);
      onOptimize({
        currentScore: result.oldScore,
        optimizedScore: result.newScore,
        improvements: result.improvements,
      });
    } catch (error) {
      console.error('Optimization failed:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      try {
        await deleteResume.mutateAsync(resume.id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const scoreColor = getScoreColor(resume.atsScore || 0);

  return (
    <>
      <Card className="glass-card border-0 group hover:bg-white/5 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-primary-600" />
                <h3 className="font-medium text-grey-900 truncate">
                  {resume.originalFileName}
                </h3>
                <Badge 
                  variant={resume.processingStatus === 'completed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {resume.processingStatus}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-grey-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTimeAgo(resume.uploadedAt)}</span>
                </div>
                {resume.atsScore && (
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>ATS: {resume.atsScore}%</span>
                  </div>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-0">
                <DropdownMenuItem onClick={() => onTailor(resume.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Tailor Resume
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowExportModal(true)}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Resume
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleOptimize} disabled={optimizeMutation.isPending}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  {optimizeMutation.isPending ? 'Optimizing...' : 'Optimize'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={deleteResume.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteResume.isPending ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {resume.atsScore && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-600">ATS Compatibility</span>
                <span className={`font-medium ${scoreColor.text}`}>
                  {resume.atsScore}%
                </span>
              </div>
              <Progress value={resume.atsScore} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTailor(resume.id)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-3 w-3" />
                <span>Tailor</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptimize}
                disabled={optimizeMutation.isPending}
                className="flex items-center space-x-1"
              >
                <Wand2 className="h-3 w-3" />
                <span>{optimizeMutation.isPending ? 'Optimizing...' : 'Optimize'}</span>
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-1"
            >
              <Download className="h-3 w-3" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resumeId={resume.id}
        resumeName={resume.originalFileName}
      />
    </>
  );
}
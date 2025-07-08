import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, TrendingUp, Lightbulb, Download, Sparkles } from "lucide-react";
import { getScoreColor } from "@/lib/utils";
import ExportModal from "./export-modal";
import { useState } from "react";

interface OptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: number;
  currentScore: number;
  optimizedScore: number;
  improvements: string[];
}

export default function OptimizationModal({ 
  isOpen, 
  onClose, 
  resumeId, 
  currentScore, 
  optimizedScore, 
  improvements 
}: OptimizationModalProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  
  const scoreImprovement = optimizedScore - currentScore;
  const currentScoreColor = getScoreColor(currentScore);
  const optimizedScoreColor = getScoreColor(optimizedScore);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-card border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              <span>Resume Optimization Results</span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Score Comparison */}
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-grey-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 text-primary-600 mr-2" />
                  ATS Score Improvement
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Original Score */}
                  <div className="text-center">
                    <p className="text-sm text-grey-600 mb-2">Original Score</p>
                    <div className={`text-3xl font-bold ${currentScoreColor.text} mb-2`}>
                      {currentScore}%
                    </div>
                    <Progress value={currentScore} className="h-2" />
                  </div>

                  {/* Arrow */}
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-2 bg-primary-100 px-4 py-2 rounded-full">
                        <TrendingUp className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-medium text-primary-700">
                          +{scoreImprovement}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optimized Score */}
                  <div className="text-center">
                    <p className="text-sm text-grey-600 mb-2">Optimized Score</p>
                    <div className={`text-3xl font-bold ${optimizedScoreColor.text} mb-2`}>
                      {optimizedScore}%
                    </div>
                    <Progress value={optimizedScore} className="h-2" />
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <Badge 
                    variant="secondary" 
                    className="bg-success-100 text-success-800 border-success-200"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {scoreImprovement > 10 ? 'Significant Improvement' : 'Improvement Applied'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Improvements List */}
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-grey-900 mb-4 flex items-center">
                  <Lightbulb className="h-5 w-5 text-primary-600 mr-2" />
                  Applied Optimizations
                </h3>
                
                <div className="space-y-3">
                  {improvements.map((improvement, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-3 p-3 bg-success-50 rounded-lg border-l-4 border-success-400"
                    >
                      <CheckCircle className="h-4 w-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-grey-700 leading-relaxed">{improvement}</p>
                    </div>
                  ))}
                </div>

                {improvements.length === 0 && (
                  <div className="text-center py-4 text-grey-600">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No specific improvements were identified.</p>
                    <p className="text-sm">Your resume is already well-optimized!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-grey-600">
                <p>Your optimized resume is ready for download</p>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  onClick={() => setShowExportModal(true)}
                  className="bg-primary-600 text-white hover:bg-primary-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Optimized Resume
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resumeId={resumeId}
        resumeName="Optimized_Resume"
        optimized={true}
      />
    </>
  );
}
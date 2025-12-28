import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, File, FileImage, Code, CheckCircle, Loader, Sparkles } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: number;
  resumeName: string;
  optimized?: boolean;
}

export default function ExportModal({
  isOpen,
  onClose,
  resumeId,
  resumeName,
  optimized = false
}: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentFormat, setCurrentFormat] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const { toast } = useToast();

  const exportFormats = [
    {
      format: 'pdf' as const,
      name: 'PDF Document',
      description: 'Professional format, best for sharing and printing',
      icon: File,
      recommended: true,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      format: 'docx' as const,
      name: 'Word Document',
      description: 'Editable format, compatible with Microsoft Word',
      icon: FileImage,
      recommended: false,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      format: 'txt' as const,
      name: 'Plain Text',
      description: 'Simple text format, compatible with all systems',
      icon: FileText,
      recommended: false,
      color: 'text-grey-500',
      bgColor: 'bg-grey-50',
    },
    {
      format: 'json' as const,
      name: 'JSON Data',
      description: 'Structured data format for developers and integrations',
      icon: Code,
      recommended: false,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
  ];

  const handleExport = async (format: 'pdf' | 'docx' | 'txt' | 'json') => {
    setIsExporting(true);
    setCurrentFormat(format);
    setExportProgress(0);
    setExportSuccess(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const response = await fetch(`/api/resumes/${resumeId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          optimized,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Export failed');
      }

      clearInterval(progressInterval);
      setExportProgress(100);

      const content = await response.text();
      const contentType = format === 'json'
        ? 'application/json'
        : format === 'pdf'
        ? 'application/pdf'
        : format === 'docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'text/plain';

      const blob = new Blob([content], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeName.replace(/\.[^/.]+$/, "")}${optimized ? '_optimized' : ''}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportSuccess(true);

      toast({
        title: "Export Successful",
        description: `Your ${optimized ? 'optimized ' : ''}resume has been downloaded as ${format.toUpperCase()}.`,
      });

      // Auto close after success
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
        setCurrentFormat(null);
        setExportProgress(0);
      }, 1500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Could not export resume. Please try again.",
        variant: "destructive",
      });
      setExportProgress(0);
      setCurrentFormat(null);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl">Export {optimized ? 'Optimized ' : ''}Resume</span>
              {optimized && (
                <div className="flex items-center text-sm text-primary-600 mt-0.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-optimized version
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Success State */}
          {exportSuccess && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-grey-900">Export Complete!</h3>
              <p className="text-sm text-grey-600">Your resume has been downloaded.</p>
            </div>
          )}

          {/* Export Progress */}
          {isExporting && !exportSuccess && (
            <div className="py-6">
              <div className="flex items-center justify-center mb-4">
                <Loader className="h-8 w-8 text-primary-600 animate-spin" />
              </div>
              <div className="text-center mb-4">
                <p className="font-medium text-grey-900">
                  Generating {currentFormat?.toUpperCase()} file...
                </p>
              </div>
              <Progress value={exportProgress} className="h-2" />
              <p className="text-center text-sm text-grey-500 mt-2">{exportProgress}%</p>
            </div>
          )}

          {/* Format Selection */}
          {!isExporting && !exportSuccess && (
            <>
              <p className="text-sm text-grey-600">
                Choose your preferred format to download your {optimized ? 'optimized ' : ''}resume:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exportFormats.map((formatOption) => {
                  const Icon = formatOption.icon;
                  return (
                    <Card
                      key={formatOption.format}
                      className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                        formatOption.recommended
                          ? 'ring-2 ring-primary-500 bg-primary-50/50'
                          : 'glass-card border-0 hover:bg-white/10'
                      }`}
                      onClick={() => handleExport(formatOption.format)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-12 h-12 ${formatOption.bgColor} rounded-xl flex items-center justify-center`}>
                            <Icon className={`h-6 w-6 ${formatOption.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-grey-900">{formatOption.name}</h3>
                              {formatOption.recommended && (
                                <Badge className="bg-primary-600 text-white text-xs">
                                  Best
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-grey-500 mt-1 line-clamp-2">
                              {formatOption.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-xs text-grey-400">
                  Files are generated securely on our servers
                </p>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
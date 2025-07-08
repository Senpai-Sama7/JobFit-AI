import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, File, FileImage } from "lucide-react";

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
  const { toast } = useToast();

  const exportFormats = [
    {
      format: 'txt' as const,
      name: 'Plain Text',
      description: 'Simple text format, compatible with all systems',
      icon: FileText,
      recommended: false,
    },
    {
      format: 'pdf' as const,
      name: 'PDF Document',
      description: 'Professional format, best for sharing and printing',
      icon: File,
      recommended: true,
    },
    {
      format: 'docx' as const,
      name: 'Word Document',
      description: 'Editable format, compatible with Microsoft Word',
      icon: FileImage,
      recommended: false,
    },
  ];

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    setIsExporting(true);
    
    try {
      toast({
        title: "Preparing Export",
        description: `Generating your ${optimized ? 'optimized ' : ''}resume as ${format.toUpperCase()}...`,
      });

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

      const content = await response.text();
      const blob = new Blob([content], { type: response.headers.get('content-type') || 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeName.replace(/\.[^/.]+$/, "")}${optimized ? '_optimized' : ''}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: `Your ${optimized ? 'optimized ' : ''}resume has been downloaded as ${format.toUpperCase()}.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Could not export resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export {optimized ? 'Optimized ' : ''}Resume</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="text-sm text-grey-600 mb-4">
            Choose your preferred format to download your {optimized ? 'optimized ' : ''}resume:
          </div>

          <div className="space-y-3">
            {exportFormats.map((formatOption) => {
              const Icon = formatOption.icon;
              return (
                <Card 
                  key={formatOption.format} 
                  className={`glass-card border-0 cursor-pointer transition-all hover:bg-white/10 ${
                    formatOption.recommended ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => handleExport(formatOption.format)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Icon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-grey-900">{formatOption.name}</h3>
                            {formatOption.recommended && (
                              <Badge variant="secondary" className="text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-grey-600 mt-1">
                            {formatOption.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isExporting}
                        className="flex-shrink-0"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isExporting ? 'Exporting...' : 'Download'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
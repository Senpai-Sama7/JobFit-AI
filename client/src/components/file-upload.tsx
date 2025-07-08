import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileUp, X, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";

interface FileUploadProps {
  onUploadComplete?: (resumeId: number) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          if (next >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return next;
        });
      }, 200);

      try {
        const response = await apiRequest('POST', '/api/resumes/upload', formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        return response.json();
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Initial upload success
      toast({
        title: "Upload Successful",
        description: "Your resume has been uploaded and is being processed.",
      });
      
      // Show parsing notification
      setTimeout(() => {
        toast({
          title: "AI Analysis in Progress",
          description: "Extracting skills, calculating ATS score, and finding role matches...",
        });
      }, 1000);
      
      // Show completion notification and refresh data
      setTimeout(() => {
        toast({
          title: "Analysis Complete!",
          description: "Check your dashboard for ATS score and role recommendations.",
        });
        
        // Refresh dashboard data
        queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      }, 3500);
      
      onUploadComplete?.(data.id);
      
      // Reset after processing
      setTimeout(() => {
        setUploadProgress(0);
        setUploadedFile(null);
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
      setUploadedFile(null);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/rtf': ['.rtf'],
      'application/vnd.oasis.opendocument.text': ['.odt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  if (uploadedFile && uploadProgress < 100) {
    return (
      <Card className="glass-card border-0 iridescent-border shimmer">
        <CardContent className="p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileUp className="text-primary-600 h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-grey-900">{uploadedFile.name}</p>
                  <p className="text-sm text-grey-600">
                    {Math.round(uploadedFile.size / 1024)}KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-grey-500 hover:text-grey-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-grey-600">Uploading...</span>
                <span className="text-grey-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (uploadedFile && uploadProgress === 100) {
    return (
      <Card className="glass-card border-0 iridescent-border shimmer">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-success-600 h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-grey-900">Upload Complete!</p>
              <p className="text-grey-600">Your resume is being processed...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card 
        {...getRootProps()} 
        className="glass-card border-0 iridescent-border cursor-pointer hover:shadow-glass transition-all duration-300 shimmer"
      >
        <CardContent className="p-8">
          <input {...getInputProps()} data-upload-trigger />
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-grey-100 rounded-full flex items-center justify-center mx-auto">
              <FileUp className="text-grey-400 h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-grey-900">
                {isDragActive 
                  ? "Drop your resume here" 
                  : "Drag and drop your resume here"
                }
              </p>
              <p className="text-grey-600">or click to browse files</p>
            </div>
            <div className="flex justify-center space-x-4 text-sm text-grey-500">
              <span>PDF</span>
              <span>•</span>
              <span>DOCX</span>
              <span>•</span>
              <span>TXT</span>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {fileRejections.length > 0 && (
        <Card className="mt-4 border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Upload Error</span>
            </div>
            <ul className="mt-2 text-sm text-destructive">
              {fileRejections.map(({ file, errors }) => (
                <li key={file.name}>
                  {file.name}: {errors[0]?.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

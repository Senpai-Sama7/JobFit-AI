import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadResume, useResumeStatus } from '@/hooks/use-resume';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { CheckCircle, AlertTriangle, Loader, Upload, FileText, File, FileImage, X, Sparkles } from 'lucide-react';

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/rtf': ['.rtf'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <File className="h-8 w-8 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileImage className="h-8 w-8 text-blue-500" />;
    default:
      return <FileText className="h-8 w-8 text-grey-500" />;
  }
};

export function FileUpload() {
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadMutation = useUploadResume();
  const { data: statusData } = useResumeStatus(resumeId);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      console.error('File rejected:', error.message);
      return;
    }

    if (acceptedFiles[0]) {
      setSelectedFile(acceptedFiles[0]);

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      uploadMutation.mutate(acceptedFiles[0], {
        onSuccess: (data) => {
          setUploadProgress(100);
          setResumeId(data.resumeId);
          clearInterval(progressInterval);
        },
        onError: () => {
          clearInterval(progressInterval);
          setUploadProgress(0);
        },
      });
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    noClick: false,
    noKeyboard: false,
  });

  const isProcessing = statusData?.status === 'processing';
  const isProcessed = statusData?.status === 'processed';
  const isError = statusData?.status === 'error' || uploadMutation.isError;

  const clearFile = () => {
    setSelectedFile(null);
    setResumeId(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Hidden input with data attribute for programmatic triggering */}
      <input {...getInputProps()} data-upload-trigger />

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive && !isDragReject
            ? 'border-primary-500 bg-primary-50/50 scale-[1.02]'
            : isDragReject
            ? 'border-red-500 bg-red-50/50'
            : 'border-grey-300 hover:border-primary-400 hover:bg-grey-50/50'
          }
        `}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isDragActive
              ? 'bg-primary-100 scale-110'
              : 'bg-gradient-to-br from-primary-100 to-primary-200'
            }
          `}>
            <Upload className={`h-8 w-8 ${isDragActive ? 'text-primary-600 animate-bounce' : 'text-primary-500'}`} />
          </div>

          <div className="text-center">
            <p className="text-lg font-medium text-grey-900">
              {isDragActive
                ? isDragReject
                  ? 'This file type is not supported'
                  : 'Drop your resume here'
                : 'Drag & drop your resume here'
              }
            </p>
            <p className="text-sm text-grey-500 mt-1">
              or <span className="text-primary-600 font-medium hover:underline">browse files</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {['PDF', 'DOCX', 'DOC', 'TXT', 'MD', 'RTF'].map((format) => (
              <span
                key={format}
                className="px-2 py-1 text-xs font-medium bg-grey-100 text-grey-600 rounded-md"
              >
                {format}
              </span>
            ))}
          </div>

          <p className="text-xs text-grey-400">Maximum file size: 10MB</p>
        </div>
      </div>

      {/* Selected File Display */}
      {selectedFile && !isProcessed && (
        <div className="mt-4 p-4 bg-grey-50 rounded-lg border border-grey-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile.name)}
              <div>
                <p className="font-medium text-grey-900 truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-grey-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!uploadMutation.isPending && !isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="text-grey-400 hover:text-grey-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {(uploadMutation.isPending || isProcessing) && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-grey-600">
                  {uploadMutation.isPending ? 'Uploading...' : 'Analyzing...'}
                </span>
                <span className="text-primary-600 font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      <div className="mt-4">
        {uploadMutation.isPending && (
          <div className="flex items-center justify-center gap-2 p-3 bg-primary-50 rounded-lg text-primary-700">
            <Loader className="h-5 w-5 animate-spin" />
            <span className="font-medium">Uploading your resume...</span>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 rounded-lg text-orange-700">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="font-medium">AI is analyzing your resume...</span>
          </div>
        )}

        {isProcessed && (
          <div className="flex items-center justify-center gap-2 p-4 bg-success-50 rounded-lg border border-success-200">
            <CheckCircle className="h-6 w-6 text-success-600" />
            <div className="text-center">
              <p className="font-semibold text-success-700">Resume processed successfully!</p>
              <p className="text-sm text-success-600">Your resume has been analyzed and is ready.</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center gap-2 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div className="text-center">
              <p className="font-semibold text-red-700">Upload failed</p>
              <p className="text-sm text-red-600">Please try again or use a different file format.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFile}
              className="ml-4 text-red-600 border-red-300 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

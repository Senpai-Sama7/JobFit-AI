import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadResume, useResumeStatus } from '@/hooks/use-resume';
import { Progress } from './ui/progress';
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react';

export function FileUpload() {
  const [resumeId, setResumeId] = useState<number | null>(null);
  const uploadMutation = useUploadResume();
  const { data: statusData } = useResumeStatus(resumeId);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      uploadMutation.mutate(acceptedFiles[0], {
        onSuccess: (data) => {
          setResumeId(data.resumeId);
        },
      });
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  const isProcessing = statusData?.status === 'processing';
  const isProcessed = statusData?.status === 'processed';
  const isError = statusData?.status === 'error' || uploadMutation.isError;

  return (
    <div className="w-full text-center p-4 border rounded-lg">
      <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-10 cursor-pointer hover:border-primary">
        <input {...getInputProps()} />
        <p>{isDragActive ? 'Drop the file here...' : 'Drag & drop resume, or click to select'}</p>
      </div>

      {uploadMutation.isPending && (
        <div className="flex items-center gap-2 mt-4"><Loader className="animate-spin" /> Uploading...</div>
      )}

      {isProcessing && (
        <div className="mt-4">
          <div className="flex items-center gap-2"><Loader className="animate-spin" /> Analyzing resume...</div>
          <Progress value={50} className="w-full mt-2" />
        </div>
      )}

      {isProcessed && (
        <div className="flex items-center gap-2 mt-4 text-green-600"><CheckCircle /> Resume processed successfully!</div>
      )}

      {isError && (
        <div className="flex items-center gap-2 mt-4 text-red-600"><AlertTriangle /> An error occurred. Please try again.</div>
      )}
    </div>
  );
}

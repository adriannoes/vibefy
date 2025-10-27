import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, File, Image, FileText } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  maxFiles = 5,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ['image/*', 'application/pdf', 'text/*'],
  className,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const files = acceptedFiles.slice(0, maxFiles);
    const uploadingFiles = files.map(file => ({
      file,
      progress: 0,
    }));

    setUploadingFiles(uploadingFiles);
    setIsUploading(true);

    try {
      await onUpload(files);
      setUploadingFiles([]);
    } catch (error) {
      setUploadingFiles(prev => 
        prev.map(f => ({ ...f, error: 'Upload failed' }))
      );
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    disabled: isUploading,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>

          {uploadingFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadingFiles.map((uploadingFile, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getFileIcon(uploadingFile.file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadingFile.file.size)}
                    </p>
                    {uploadingFile.error ? (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{uploadingFile.error}</AlertDescription>
                      </Alert>
                    ) : (
                      <Progress value={uploadingFile.progress} className="mt-2" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadingFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploader;

import { useState } from 'react';
import { Upload, X, File } from 'lucide-react';

interface FileUploadProps {
  label: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
}

export function FileUpload({
  label,
  description,
  accept = '*/*',
  maxSizeMB = 10,
  maxFiles = 1,
  value,
  onChange
}: FileUploadProps) {
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const isMultiple = maxFiles > 1;
  const files = isMultiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (value ? [value as string] : []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError('');
    setUploading(true);

    try {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const newFiles: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        if (file.size > maxSizeBytes) {
          setError(`File ${file.name} exceeds ${maxSizeMB}MB limit`);
          setUploading(false);
          return;
        }

        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(JSON.stringify({
              name: file.name,
              type: file.type,
              size: file.size,
              data: result
            }));
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newFiles.push(fileData);
      }

      if (isMultiple) {
        const currentFiles = Array.isArray(value) ? value : (value ? [value] : []);
        const combined = [...currentFiles, ...newFiles];
        if (combined.length > maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
          setUploading(false);
          return;
        }
        onChange(combined);
      } else {
        onChange(newFiles[0]);
      }
    } catch (err) {
      setError('Error uploading file');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    if (isMultiple) {
      const currentFiles = Array.isArray(value) ? value : [];
      onChange(currentFiles.filter((_, i) => i !== index));
    } else {
      onChange('');
    }
  };

  const getFileName = (fileStr: string): string => {
    try {
      const parsed = JSON.parse(fileStr);
      return parsed.name || 'Uploaded file';
    } catch {
      return 'Uploaded file';
    }
  };

  const getFileSize = (fileStr: string): string => {
    try {
      const parsed = JSON.parse(fileStr);
      const sizeInMB = (parsed.size / (1024 * 1024)).toFixed(2);
      return `${sizeInMB} MB`;
    } catch {
      return 'Unknown size';
    }
  };

  const canUploadMore = isMultiple && files.length < maxFiles;
  const showUploadButton = !isMultiple && files.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getFileName(file)}
                  </p>
                  <p className="text-xs text-gray-500">{getFileSize(file)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(showUploadButton || canUploadMore) && (
        <div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className={`w-8 h-8 mb-2 ${uploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
              <p className="mb-1 text-sm text-gray-600 font-medium">
                {uploading ? 'Uploading...' : 'Click to upload'}
              </p>
              <p className="text-xs text-gray-500">
                {accept.includes('image') ? 'Images' : accept.includes('csv') ? 'CSV' : 'Files'} up to {maxSizeMB}MB
                {isMultiple && ` (max ${maxFiles} files)`}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept={accept}
              multiple={isMultiple}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

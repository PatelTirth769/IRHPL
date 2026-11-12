import { forwardRef, useState, useEffect } from 'react';
import { UploadCloud, X, File as FileIcon, FileText, Eye } from 'lucide-react';

const FileUpload = forwardRef(({ label, error, onChange, value, accept = "image/*,.pdf", className = '', helperText, readOnly, ...props }, ref) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    if (value instanceof File && value.type.includes('image')) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [value]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const removeFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
  };

  const handleView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      window.open(url, '_blank');
    } else if (typeof value === 'string') {
      window.open(value, '_blank');
    } else if (value?.fileUrl) {
      window.open(value.fileUrl, '_blank');
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {!value ? (
        <div 
          className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-colors
            ${readOnly ? 'border-slate-200 bg-slate-50 opacity-60' : dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
          onDragEnter={!readOnly ? handleDrag : undefined}
          onDragLeave={!readOnly ? handleDrag : undefined}
          onDragOver={!readOnly ? handleDrag : undefined}
          onDrop={!readOnly ? handleDrop : undefined}
        >
          {!readOnly && (
            <input
              ref={ref}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept={accept}
              {...props}
            />
          )}
          <UploadCloud className={`w-8 h-8 mb-2 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600 font-medium text-center">
            {readOnly ? 'No file available' : 'Click or drag file to upload'}
          </p>
          {helperText && !readOnly && (
            <p className="text-[12px] text-gray-400 mt-1 text-center">{helperText}</p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white shadow-sm group">
          <div 
            className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1" 
            onClick={handleView}
            title="Click to view file"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 group-hover:border-blue-300 transition-colors">
               {preview ? (
                 <img src={preview} alt="preview" className="w-full h-full object-cover" />
               ) : value?.type?.includes('pdf') ? (
                 <FileText className="w-5 h-5 text-red-500" />
               ) : (
                 <FileIcon className="w-5 h-5 text-blue-500" />
               )}
            </div>
            <div className="truncate pr-2">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {value.name || 'Uploaded File'}
              </p>
              {value.size && (
                <p className="text-xs text-gray-500">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button 
              type="button" 
              onClick={handleView}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View File"
            >
              <Eye className="w-4 h-4" />
            </button>
            {!readOnly && (
              <button 
                type="button" 
                onClick={removeFile}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove File"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-[13px] font-medium text-red-500 mt-0.5">{error?.message}</p>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;

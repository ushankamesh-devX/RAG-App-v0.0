import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadSection({ onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setUploadStatus('error');
      setMessage('Only PDF files are supported.');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setUploadStatus('success');
      setMessage(`Uploaded ${file.name}`);
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setUploadStatus('error');
      setMessage(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-[#2D2A24] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#D97706]" />
          Documents
        </h2>
        <p className="text-xs text-[#9C8E7C] mt-1">
          Upload a PDF to chat with its contents.
        </p>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 
          ${isUploading 
            ? 'border-[#C4B8A5] bg-[#EDE7DD] cursor-not-allowed' 
            : 'border-[#C4B8A5] hover:border-[#D97706] hover:bg-[#FDF8F0] group'
          }`}
      >
        <input 
          type="file" 
          accept=".pdf" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <div className="w-8 h-8 border-2 border-[#D97706]/30 border-t-[#D97706] rounded-full animate-spin" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#EDE7DD] flex items-center justify-center group-hover:bg-[#D97706]/10 transition-colors">
              <UploadCloud className="w-5 h-5 text-[#9C8E7C] group-hover:text-[#D97706] transition-colors" />
            </div>
          )}
          
          <div className="text-xs text-[#9C8E7C]">
            {isUploading ? (
              <span className="text-[#D97706] font-medium">Processing...</span>
            ) : (
              <span>
                <span className="text-[#D97706] font-medium">Click to upload</span> a PDF
              </span>
            )}
          </div>
        </div>
      </div>

      {uploadStatus && (
        <div className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
          uploadStatus === 'success' 
            ? 'bg-[#E8F5E2] text-[#3D7A1C]' 
            : 'bg-[#FDE8E8] text-[#B91C1C]'
        }`}>
          {uploadStatus === 'success' 
            ? <CheckCircle className="w-4 h-4 shrink-0" /> 
            : <AlertCircle className="w-4 h-4 shrink-0" />
          }
          <p className="leading-tight pt-0.5">{message}</p>
        </div>
      )}
    </div>
  );
}

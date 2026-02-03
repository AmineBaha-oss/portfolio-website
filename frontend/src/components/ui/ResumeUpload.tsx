/**
 * Resume upload component with direct FormData upload
 */

"use client";

import { useState, useRef, ChangeEvent, RefObject } from "react";
import { uploadResume } from "@/lib/api/admin-client";

interface ResumeUploadProps {
  onUploadSuccess: () => void;
  onUploadError?: (error: string) => void;
  currentFileUrl?: string;
  disabled?: boolean;
  language?: "en" | "fr";
  fileInputRef?: RefObject<HTMLInputElement>;
}

export function ResumeUpload({
  onUploadSuccess,
  onUploadError,
  currentFileUrl,
  disabled = false,
  language = "en",
  fileInputRef: externalRef,
}: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const internalRef = useRef<HTMLInputElement>(null);
  const fileInputRef = externalRef || internalRef;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      const error = "Only PDF files are allowed";
      onUploadError?.(error);
      return;
    }

    // Validate file size (10MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      const error = "File size exceeds 10MB limit";
      onUploadError?.(error);
      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      await uploadResume(file, language);
      onUploadSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="resume-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={disabled || uploading}
      />

      <div 
        className={`upload-area ${uploading ? 'uploading' : ''}`}
        onClick={handleButtonClick}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "1rem", opacity: 0.7 }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        
        <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: 500 }}>
          {uploading ? "Uploading..." : "Upload Resume"}
        </h4>
        <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.6 }}>
          Click to select a PDF file (max 10MB)
        </p>
      </div>

      {fileName && (
        <div className="file-selected">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{fileName}</span>
        </div>
      )}

      <style jsx>{`
        .resume-upload {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .upload-area {
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.8);
        }

        .upload-area:hover:not(.uploading) {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.05);
        }

        .upload-area.uploading {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .file-selected {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
        }

        .file-selected svg {
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.6)

        .file-selected span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

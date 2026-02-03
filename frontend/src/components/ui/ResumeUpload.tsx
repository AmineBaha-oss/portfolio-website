/**
 * Resume upload component with direct FormData upload
 */

"use client";

import { useState, useRef, ChangeEvent } from "react";
import { uploadResume } from "@/lib/api/admin-client";

interface ResumeUploadProps {
  onUploadSuccess: () => void;
  onUploadError?: (error: string) => void;
  currentFileUrl?: string;
  disabled?: boolean;
  language?: "en" | "fr";
}

export function ResumeUpload({
  onUploadSuccess,
  onUploadError,
  currentFileUrl,
  disabled = false,
  language = "en",
}: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      const error = "Only PDF files are allowed";
      onUploadError?.(error);
      alert(error);
      return;
    }

    // Validate file size (10MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      const error = "File size exceeds 10MB limit";
      onUploadError?.(error);
      alert(error);
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
      alert(`Upload failed: ${errorMessage}`);
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

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled || uploading}
        className="upload-button"
      >
        {uploading ? "Uploading..." : "Choose Resume PDF"}
      </button>

      {fileName && (
        <p className="file-name">
          Selected: {fileName}
        </p>
      )}

      {currentFileUrl && (
        <div className="current-file">
          <a href={currentFileUrl} target="_blank" rel="noopener noreferrer">
            View Current Resume
          </a>
        </div>
      )}

      <style jsx>{`
        .resume-upload {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .upload-button {
          padding: 0.5rem 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .upload-button:hover:not(:disabled) {
          background-color: #0051cc;
        }

        .upload-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .file-name {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .current-file a {
          color: #0070f3;
          text-decoration: none;
          font-size: 14px;
        }

        .current-file a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

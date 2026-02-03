/**
 * File upload component for images and PDFs
 */

"use client";

import { useState, useRef, ChangeEvent } from "react";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  fileType: "image" | "pdf";
  folder?: string;
  onUploadSuccess: (url: string, key: string) => void;
  onUploadError?: (error: string) => void;
  buttonText?: string;
  showPreview?: boolean;
  currentFileUrl?: string;
  disabled?: boolean;
}

export function FileUpload({
  accept = "*/*",
  maxSize = 10,
  fileType,
  folder,
  onUploadSuccess,
  onUploadError,
  buttonText = "Choose File",
  showPreview = true,
  currentFileUrl,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentFileUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      const error = `File size exceeds ${maxSize}MB limit`;
      onUploadError?.(error);
      alert(error);
      return;
    }

    setFileName(file.name);

    // Show preview for images
    if (fileType === "image" && showPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", fileType);
      if (folder) {
        formData.append("folder", folder);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      onUploadSuccess(data.url, data.key);
      setPreview(data.url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      onUploadError?.(errorMessage);
      alert(`Upload failed: ${errorMessage}`);
      // Reset preview on error
      setPreview(currentFileUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
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
        {uploading ? "Uploading..." : buttonText}
      </button>

      {fileName && (
        <p className="file-name">
          Selected: {fileName}
        </p>
      )}

      {showPreview && preview && fileType === "image" && (
        <div className="preview">
          <img src={preview} alt="Preview" style={{ maxWidth: "300px", maxHeight: "300px" }} />
        </div>
      )}

      {preview && fileType === "pdf" && (
        <div className="preview">
          <a href={preview} target="_blank" rel="noopener noreferrer">
            View Current PDF
          </a>
        </div>
      )}

      <style jsx>{`
        .file-upload {
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
          color: #666;
          margin: 0;
        }

        .preview {
          margin-top: 1rem;
        }

        .preview img {
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .preview a {
          color: #0070f3;
          text-decoration: none;
        }

        .preview a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

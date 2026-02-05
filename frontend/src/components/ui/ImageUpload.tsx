/**
 * Image upload component for projects and hobbies
 */

"use client";

import { useState, useRef, ChangeEvent, RefObject } from "react";
import { uploadImage } from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";
import { getCdnUrl } from "@/lib/utils/cdn-url";

interface ImageUploadProps {
  onUploadSuccess: (imageKey: string) => void;
  onUploadError?: (error: string) => void;
  onRemove?: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
  fileInputRef?: RefObject<HTMLInputElement>;
}

export function ImageUpload({
  onUploadSuccess,
  onUploadError,
  onRemove,
  currentImageUrl,
  disabled = false,
  fileInputRef: externalRef,
}: ImageUploadProps) {
  const { t } = useTranslations();
  const [uploading, setUploading] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const internalRef = useRef<HTMLInputElement>(null);
  const fileInputRef = externalRef || internalRef;
  
  // The preview to display - use local preview if available, otherwise use currentImageUrl
  const preview = localPreview || currentImageUrl || null;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      const error = "Only image files (JPEG, PNG, GIF, WebP) are allowed";
      onUploadError?.(error);
      return;
    }

    // Validate file size (10MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      const error = "Image size exceeds 10MB limit";
      onUploadError?.(error);
      return;
    }

    // Show preview immediately using FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const data = await uploadImage(file);
      // After upload, set the local preview to the DO Spaces URL
      const fullUrl = getCdnUrl(data.key);
      setLocalPreview(fullUrl);
      setImageUrl(fullUrl);
      onUploadSuccess(data.key);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      onUploadError?.(errorMessage);
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      onUploadError?.("Please enter a valid URL");
      return;
    }
    
    // Extract the key from the URL or use the full URL
    // If it's a DO Spaces URL, extract the key part
    let key = imageUrl;
    if (imageUrl.includes("digitaloceanspaces.com/")) {
      const parts = imageUrl.split("digitaloceanspaces.com/");
      if (parts[1]) {
        key = parts[1];
        // Remove any query parameters (for pre-signed URLs)
        key = key.split("?")[0];
      }
    }
    
    // Set preview to show the image
    const fullUrl = getCdnUrl(key);
    setLocalPreview(fullUrl);
    onUploadSuccess(key);
  };

  return (
    <div className="image-upload">
      <div className="toggle-buttons">
        <button
          type="button"
          onClick={() => {
            setUseUrl(false);
          }}
          className={!useUrl ? "active" : ""}
        >
          {t('dashboardContactInfo.uploadFile')}
        </button>
        <button
          type="button"
          onClick={() => {
            setUseUrl(true);
            if (preview) {
              setImageUrl(preview);
            }
          }}
          className={useUrl ? "active" : ""}
        >
          {t('dashboardContactInfo.useUrl')}
        </button>
        {onRemove && preview && (
          <button
            type="button"
            onClick={() => {
              if (confirm(t('dashboardContactInfo.removeImage') + '?')) {
                setLocalPreview(null);
                setImageUrl("");
                onRemove();
              }
            }}
            className="remove-button"
          >
            {t('dashboardContactInfo.removeImage')}
          </button>
        )}
      </div>

      {!useUrl ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={disabled || uploading}
          />

          <div 
            className={`upload-area ${uploading ? 'uploading' : ''} ${preview ? 'has-preview' : ''}`}
            onClick={handleButtonClick}
          >
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Preview" className="preview-image" />
              </div>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "1rem", opacity: 0.7 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="8.5" r="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: 500 }}>
                  {uploading ? "Uploading..." : "Upload Image"}
                </h4>
                <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.6 }}>
                  Click to select an image (max 10MB)
                </p>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="url-input-container">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://portfolio-app.nyc3.digitaloceanspaces.com/images/..."
              className="url-input"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="url-submit-button"
            >
              {t('dashboardContactInfo.setUrl')}
            </button>
          </div>
          {preview && (
            <div 
              className={`upload-area has-preview`}
              style={{ cursor: 'default', padding: 0 }}
            >
              <div className="preview-container">
                <img src={preview} alt="Preview" className="preview-image" />
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .image-upload {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .toggle-buttons {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .toggle-buttons button {
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          borderRadius: 8px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          fontSize: 0.875rem;
          transition: all 0.2s;
        }

        .toggle-buttons button.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .toggle-buttons button:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .remove-button {
          background: rgba(239, 68, 68, 0.1) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
          color: rgb(239, 68, 68) !important;
        }

        .remove-button:hover {
          background: rgba(239, 68, 68, 0.2) !important;
        }

        .url-input-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .url-input {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          borderRadius: 8px;
          color: white;
          fontSize: 0.875rem;
        }

        .url-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .url-submit-button {
          padding: 0.75rem 1.5rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          borderRadius: 8px;
          color: white;
          cursor: pointer;
          fontSize: 0.875rem;
          transition: all 0.2s;
        }

        .url-submit-button:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .upload-area {
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 2rem 1.5rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.8);
          position: relative;
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .upload-area:hover:not(.uploading) {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.05);
        }

        .upload-area.uploading {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .upload-area.has-preview {
          padding: 0;
        }

        .preview-container {
          width: 100%;
          height: 200px;
          position: relative;
          border-radius: 10px;
          overflow: hidden;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

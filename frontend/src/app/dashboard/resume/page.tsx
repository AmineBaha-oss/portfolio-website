"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { useTranslations } from "@/lib/i18n/hooks";
import { ResumeUpload } from "@/components/ui/ResumeUpload";
import { getResume, deleteResume } from "@/lib/api/admin-client";

interface Resume {
  id: string;
  filename: string;
  fileUrl: string;
  fileKey?: string;
  fileSize?: number;
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ResumeManagementPage() {
  const { t } = useTranslations();
  const [uploadedCV, setUploadedCV] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "fr">("en");

  useEffect(() => {
    fetchResume();
  }, [selectedLanguage]);

  const fetchResume = async () => {
    try {
      const data = await getResume(selectedLanguage);
      setUploadedCV(data.resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async () => {
    await fetchResume();
    setShowUpload(false);
    alert("Resume uploaded successfully!");
  };

  const handleDelete = async () => {
    if (!uploadedCV || !confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      await deleteResume(uploadedCV.id);
      setUploadedCV(null);
      alert("Resume deleted successfully!");
    } catch (error) {
      console.error("Error deleting resume:", error);
      alert(`Failed to delete resume: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.topBar}>
            <div className={styles.breadcrumb}>
              <a href="/dashboard">{t('dashboard.title')}</a>
              <span>/</span>
              <span>{t('dashboardResume.title')}</span>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>{t('dashboardResume.title')}</h1>
            <p>{t('dashboardResume.subtitle')}</p>
          </div>
          
          {/* Language Selector */}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <label style={{ color: "white", fontWeight: "500" }}>View Resume:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as "en" | "fr")}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "white",
                cursor: "pointer",
              }}
            >
              <option value="en" style={{ backgroundColor: "#1a1a1a" }}>English</option>
              <option value="fr" style={{ backgroundColor: "#1a1a1a" }}>Français</option>
            </select>
          </div>
        </motion.div>

        <div className={`${styles.grid} ${styles.cols2}`}>
          {/* Current CV Section */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 style={{ fontSize: "1.25rem", color: "white", margin: "0 0 1.5rem 0" }}>
              {t('dashboardResume.current')}
            </h3>

            {uploadedCV ? (
              <div>
                <div style={{ 
                  padding: "1.5rem", 
                  background: "rgba(255, 255, 255, 0.03)", 
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "1rem", color: "white", margin: "0 0 0.25rem 0", fontWeight: 500 }}>
                        {uploadedCV.filename}
                      </p>
                      <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
                        {formatFileSize(uploadedCV.fileSize)}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)" }}>
                    {t('dashboardResume.uploaded')}: {new Date(uploadedCV.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <a 
                    href={uploadedCV.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`${styles.button} ${styles.primary}`}
                  >
                    {t('dashboardResume.download')}
                  </a>
                  <button 
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => setShowUpload(true)}
                  >
                    {t('dashboardResume.replace')}
                  </button>
                  <button 
                    className={`${styles.button} ${styles.danger}`}
                    onClick={handleDelete}
                  >
                    {t('dashboard.delete')}
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className={styles.emptyState}>
                <div className={styles.icon}>⏳</div>
                <h3>Loading...</h3>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.icon}>📄</div>
                <h3>{t('dashboardResume.noResume')}</h3>
                <p>{t('dashboardResume.noResumeDesc')}</p>
                <button 
                  className={`${styles.button} ${styles.primary}`}
                  onClick={() => setShowUpload(true)}
                  style={{ marginTop: "1rem" }}
                >
                  Upload Resume
                </button>
              </div>
            )}
          </motion.div>

          {/* Upload New CV Section */}
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 style={{ fontSize: "1.25rem", color: "white", margin: "0 0 1.5rem 0" }}>
              {t('dashboardResume.uploadNew')}
            </h3>

            {showUpload || !uploadedCV ? (
              <div>
                <ResumeUpload
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={(error) => alert(error)}
                  currentFileUrl={uploadedCV?.fileUrl}
                  language={selectedLanguage}
                />
                
                {showUpload && uploadedCV && (
                  <button 
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => setShowUpload(false)}
                    style={{ marginTop: "1rem" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                border: "2px dashed rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "3rem 2rem",
                textAlign: "center",
                background: "rgba(255, 255, 255, 0.02)",
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>
                  ✅
                </div>
                <h4 style={{ fontSize: "1rem", color: "white", margin: "0 0 0.5rem 0" }}>
                  Resume Uploaded
                </h4>
                <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
                  Use the "Replace" button to upload a new version
                </p>
              </div>
            )}

            <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "8px" }}>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)", margin: 0, lineHeight: "1.6" }}>
                <strong style={{ color: "white" }}>{t('dashboardResume.tipLabel')}:</strong> {t('dashboardResume.tipText')}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Resume Statistics */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginTop: "1.5rem" }}
        >
          <h3 style={{ fontSize: "1.25rem", color: "white", margin: "0 0 1.5rem 0" }}>
            {t('dashboardResume.stats')}
          </h3>

          <div className={`${styles.grid} ${styles.cols3}`}>
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <p style={{ fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                127
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {t('dashboardResume.totalDownloads')}
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <p style={{ fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                23
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {t('dashboardResume.thisMonth')}
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <p style={{ fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                5
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {t('dashboardResume.today')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

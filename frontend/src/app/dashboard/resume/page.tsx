"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { useTranslations } from "@/lib/i18n/hooks";
import { ResumeUpload } from "@/components/ui/ResumeUpload";
import { getResume, deleteResume, getResumeStats } from "@/lib/api/admin-client";
import { Toast } from "@/components/ui/Toast";
import { useDialog } from "@/components/ui/ConfirmDialog";
import { triggerDataRefresh } from "@/lib/hooks/useDataRefresh";

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
  const { showConfirm } = useDialog();
  const [uploadedCV, setUploadedCV] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "fr">("en");
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, today: 0 });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    fetchResume();
    fetchStats();
  }, [selectedLanguage]);

  const fetchStats = async () => {
    try {
      const data = await getResumeStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

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
    await fetchStats();
    setShowUpload(false);
    setToast({ message: "Resume uploaded successfully!", type: "success" });
    triggerDataRefresh();
  };

  const handleDelete = async () => {
    if (!uploadedCV) {
      return;
    }

    const confirmed = await showConfirm({ message: "Are you sure you want to delete this resume?", title: t('dashboard.delete') });
    if (!confirmed) {
      return;
    }

    try {
      await deleteResume(uploadedCV.id);
      setUploadedCV(null);
      setToast({ message: "Resume deleted successfully!", type: "success" });
      await fetchStats();
    } catch (error) {
      console.error("Error deleting resume:", error);
      setToast({ 
        message: `Failed to delete resume: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error"
      });
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
            <label style={{ color: "white", fontWeight: "500" }}>{t('dashboardResume.viewResume')}:</label>
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
                    onClick={triggerFileUpload}
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
                <svg className={styles.icon} width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3>Loading...</h3>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <svg className={styles.icon} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15H15" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11H15" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>{t('dashboardResume.noResume')}</h3>
                <p>{t('dashboardResume.noResumeDesc')}</p>
                <button 
                  className={`${styles.button} ${styles.primary}`}
                  onClick={triggerFileUpload}
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

            <div style={{ display: "none" }}>
              <ResumeUpload
                fileInputRef={fileInputRef}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={(error) => setToast({ message: error, type: "error" })}
                currentFileUrl={uploadedCV?.fileUrl}
                language={selectedLanguage}
              />
            </div>

            {!uploadedCV ? (
              <div style={{
                border: "2px dashed rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "3rem 2rem",
                textAlign: "center",
                background: "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
              }}
              onClick={triggerFileUpload}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 1rem", opacity: 0.7 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h4 style={{ fontSize: "1rem", color: "white", margin: "0 0 0.5rem 0" }}>
                  Click to Upload Resume
                </h4>
                <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
                  Select a PDF file (max 10MB)
                </p>
              </div>
            ) : (
              <div style={{
                border: "2px dashed rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "3rem 2rem",
                textAlign: "center",
                background: "rgba(255, 255, 255, 0.02)",
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 1rem" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" fill="rgba(255, 255, 255, 0.05)"/>
                  <path d="M8 12L11 15L16 9" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h4 style={{ fontSize: "1rem", color: "white", margin: "0 0 0.5rem 0" }}>
                  {t('dashboardResume.uploadedTitle')}
                </h4>
                <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
                  {t('dashboardResume.uploadedDesc')}
                </p>
              </div>
            )}
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
            <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" style={{ margin: "0 auto 0.75rem" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                {stats.total}
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {t('dashboardResume.totalDownloads')}
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" style={{ margin: "0 auto 0.75rem" }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                {stats.thisMonth}
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {t('dashboardResume.thisMonth')}
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" style={{ margin: "0 auto 0.75rem" }}>
                <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                {stats.today}
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

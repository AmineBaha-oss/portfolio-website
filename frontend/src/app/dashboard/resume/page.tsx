"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";

export default function ResumeManagementPage() {
  const [uploadedCV, setUploadedCV] = useState<{
    filename: string;
    uploadedAt: string;
    size: string;
  } | null>({
    filename: "Amine_Baha_Resume.pdf",
    uploadedAt: "2024-01-15",
    size: "245 KB",
  });

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
              <a href="/dashboard">Dashboard</a>
              <span>/</span>
              <span>Resume</span>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>Resume / CV</h1>
            <p>Manage your downloadable resume file</p>
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
              Current Resume
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
                        {uploadedCV.size}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)" }}>
                    Uploaded: {new Date(uploadedCV.uploadedAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <button className={`${styles.button} ${styles.primary}`}>
                    Download
                  </button>
                  <button className={`${styles.button} ${styles.secondary}`}>
                    Replace
                  </button>
                  <button className={`${styles.button} ${styles.danger}`}>
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.icon}>📄</div>
                <h3>No Resume Uploaded</h3>
                <p>Upload your resume to make it available for download</p>
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
              Upload New Resume
            </h3>

            <div style={{
              border: "2px dashed rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              padding: "3rem 2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              background: "rgba(255, 255, 255, 0.02)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
            }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>
                ⬆️
              </div>
              <h4 style={{ fontSize: "1rem", color: "white", margin: "0 0 0.5rem 0" }}>
                Click to upload or drag and drop
              </h4>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
                PDF files only (Max 5MB)
              </p>
              <input 
                type="file" 
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle file upload
                    console.log("File selected:", file.name);
                  }
                }}
              />
            </div>

            <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "8px" }}>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)", margin: 0, lineHeight: "1.6" }}>
                <strong style={{ color: "white" }}>Tip:</strong> Make sure your resume is up-to-date and professionally formatted before uploading.
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
            Download Statistics
          </h3>

          <div className={`${styles.grid} ${styles.cols3}`}>
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <p style={{ fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                127
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                Total Downloads
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <p style={{ fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                23
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                This Month
              </p>
            </div>
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <p style={{ fontSize: "2.5rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 600 }}>
                5
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                Today
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

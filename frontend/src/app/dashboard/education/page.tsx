"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";

export default function EducationManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const education = [
    {
      id: 1,
      degree: "Master of Science in Computer Science",
      institution: "University of Technology",
      location: "Boston, MA",
      startDate: "2018-09",
      endDate: "2020-05",
      gpa: "3.9",
      description: "Specialized in Machine Learning and Artificial Intelligence",
    },
    {
      id: 2,
      degree: "Bachelor of Science in Software Engineering",
      institution: "Tech University",
      location: "San Francisco, CA",
      startDate: "2014-09",
      endDate: "2018-05",
      gpa: "3.7",
      description: "Focus on full-stack web development and software design patterns",
    },
  ];

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
              <span>Education</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => setShowAddModal(true)}
              >
                + Add Education
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>Education</h1>
            <p>Manage your educational background and qualifications</p>
          </div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {education.map((edu, index) => (
            <motion.div
              key={edu.id}
              className={styles.card}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.25rem", color: "white", margin: "0 0 0.5rem 0" }}>
                    {edu.degree}
                  </h3>
                  
                  <p style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.7)", margin: "0 0 0.5rem 0" }}>
                    {edu.institution} • {edu.location}
                  </p>
                  
                  <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
                      {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                      {new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                    {edu.gpa && (
                      <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
                        GPA: {edu.gpa}/4.0
                      </p>
                    )}
                  </div>
                  
                  {edu.description && (
                    <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.875rem", lineHeight: "1.6" }}>
                      {edu.description}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginLeft: "2rem" }}>
                  <button className={`${styles.button} ${styles.secondary}`}>
                    Edit
                  </button>
                  <button className={`${styles.button} ${styles.danger}`}>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {showAddModal && (
          <AddEducationModal onClose={() => setShowAddModal(false)} />
        )}
      </div>
    </div>
  );
}

function AddEducationModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalCard}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem" }}>
          Add Education
        </h2>

        <form>
          <div className={styles.formGroup}>
            <label>Degree/Certification</label>
            <input type="text" placeholder="e.g. Bachelor of Science in Computer Science" />
          </div>

          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}>
              <label>Institution</label>
              <input type="text" placeholder="University/School name" />
            </div>

            <div className={styles.formGroup}>
              <label>Location</label>
              <input type="text" placeholder="City, Country" />
            </div>
          </div>

          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input type="month" />
            </div>

            <div className={styles.formGroup}>
              <label>End Date (or Expected)</label>
              <input type="month" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>GPA (Optional)</label>
            <input type="text" placeholder="e.g. 3.8/4.0" />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea 
              placeholder="Relevant courses, achievements, specializations..." 
              rows={4}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button type="submit" className={`${styles.button} ${styles.primary}`} style={{ flex: 1 }}>
              Add Education
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.button} ${styles.secondary}`}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

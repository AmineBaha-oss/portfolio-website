"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";

export default function ExperienceManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const experiences = [
    {
      id: 1,
      position: "Senior Full Stack Developer",
      company: "Tech Solutions Inc.",
      location: "Remote",
      startDate: "2022-01",
      endDate: "Present",
      current: true,
      description: "Leading development of enterprise applications",
    },
    {
      id: 2,
      position: "Full Stack Developer",
      company: "Digital Agency Co.",
      location: "New York, NY",
      startDate: "2020-06",
      endDate: "2021-12",
      current: false,
      description: "Developed client websites and web applications",
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
              <span>Experience</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => setShowAddModal(true)}
              >
                + Add Experience
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>Work Experience</h1>
            <p>Manage your professional work history</p>
          </div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              className={styles.card}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem", color: "white", margin: 0 }}>
                      {exp.position}
                    </h3>
                    {exp.current && (
                      <span className={styles.badge}>Current</span>
                    )}
                  </div>
                  
                  <p style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.7)", margin: "0 0 0.5rem 0" }}>
                    {exp.company} • {exp.location}
                  </p>
                  
                  <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: "0 0 1rem 0" }}>
                    {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                    {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                  
                  <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.875rem", lineHeight: "1.6" }}>
                    {exp.description}
                  </p>
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
          <AddExperienceModal onClose={() => setShowAddModal(false)} />
        )}
      </div>
    </div>
  );
}

function AddExperienceModal({ onClose }: { onClose: () => void }) {
  const [isCurrent, setIsCurrent] = useState(false);

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
          Add Work Experience
        </h2>

        <form>
          <div className={styles.formGroup}>
            <label>Position/Role</label>
            <input type="text" placeholder="e.g. Senior Full Stack Developer" />
          </div>

          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}>
              <label>Company</label>
              <input type="text" placeholder="Company name" />
            </div>

            <div className={styles.formGroup}>
              <label>Location</label>
              <input type="text" placeholder="City, Country or Remote" />
            </div>
          </div>

          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input type="month" />
            </div>

            <div className={styles.formGroup}>
              <label>End Date</label>
              <input type="month" disabled={isCurrent} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
              />
              <span>I currently work here</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea 
              placeholder="Describe your responsibilities and achievements..." 
              rows={6}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button type="submit" className={`${styles.button} ${styles.primary}`} style={{ flex: 1 }}>
              Add Experience
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

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";

export default function ProjectsManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const projects = [
    {
      id: 1,
      title: "E-commerce Platform",
      description: "Full-stack e-commerce solution with payment integration",
      status: "Published",
      technologies: ["React", "Node.js", "Stripe"],
      featured: true,
    },
    {
      id: 2,
      title: "Portfolio Website",
      description: "Modern portfolio with admin dashboard",
      status: "Published",
      technologies: ["Next.js", "PostgreSQL"],
      featured: true,
    },
    {
      id: 3,
      title: "Task Management App",
      description: "Collaborative task management tool",
      status: "Draft",
      technologies: ["Vue.js", "Firebase"],
      featured: false,
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
              <span>Projects</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => setShowAddModal(true)}
              >
                + Add Project
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>Projects</h1>
            <p>Manage your portfolio projects and case studies</p>
          </div>
        </motion.div>

        <div className={`${styles.grid} ${styles.cols2}`}>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", color: "white", margin: "0 0 0.5rem 0" }}>
                    {project.title}
                  </h3>
                  {project.featured && (
                    <span className={styles.badge}>Featured</span>
                  )}
                </div>
                <span className={styles.badge}>
                  {project.status}
                </span>
              </div>

              <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {project.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <button className={`${styles.button} ${styles.secondary}`} style={{ flex: 1 }}>
                  Edit
                </button>
                <button className={`${styles.button} ${styles.danger}`}>
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {showAddModal && (
          <AddProjectModal onClose={() => setShowAddModal(false)} />
        )}
      </div>
    </div>
  );
}

function AddProjectModal({ onClose }: { onClose: () => void }) {
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
          Add New Project
        </h2>

        <form>
          <div className={styles.formGroup}>
            <label>Project Title</label>
            <input type="text" placeholder="Enter project title" />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea placeholder="Brief description of the project" rows={3} />
          </div>

          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}>
              <label>Client/Company</label>
              <input type="text" placeholder="Client name (optional)" />
            </div>

            <div className={styles.formGroup}>
              <label>Date</label>
              <input type="date" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Technologies Used</label>
            <input type="text" placeholder="React, Node.js, MongoDB (comma separated)" />
          </div>

          <div className={styles.formGroup}>
            <label>Project URL</label>
            <input type="url" placeholder="https://example.com" />
          </div>

          <div className={styles.formGroup}>
            <label>GitHub Repository</label>
            <input type="url" placeholder="https://github.com/username/repo" />
          </div>

          <div className={styles.formGroup}>
            <label>Full Description</label>
            <textarea placeholder="Detailed project description" rows={6} />
          </div>

          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}>
              <label>Status</label>
              <select>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="checkbox" />
                <span>Featured Project</span>
              </label>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button type="submit" className={`${styles.button} ${styles.primary}`} style={{ flex: 1 }}>
              Add Project
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

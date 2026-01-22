"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import styles from "../shared.module.scss";

export default function SkillsManagementPage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data - will be replaced with database
  const skills = [
    { id: 1, name: "React", category: "Frontend", level: "Expert", order: 1 },
    { id: 2, name: "Node.js", category: "Backend", level: "Advanced", order: 2 },
    { id: 3, name: "TypeScript", category: "Languages", level: "Expert", order: 3 },
    { id: 4, name: "PostgreSQL", category: "Database", level: "Advanced", order: 4 },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.topBar}>
            <div className={styles.breadcrumb}>
              <a href="/dashboard">Dashboard</a>
              <span>/</span>
              <span>Skills</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => setShowAddModal(true)}
              >
                + Add Skill
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>Skills</h1>
            <p>Manage your technical skills and expertise</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Category</th>
                <th>Level</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, index) => (
                <motion.tr
                  key={skill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                >
                  <td style={{ fontWeight: 500 }}>{skill.name}</td>
                  <td>{skill.category}</td>
                  <td>
                    <span className={styles.badge}>
                      {skill.level}
                    </span>
                  </td>
                  <td>{skill.order}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className={`${styles.button} ${styles.secondary}`}>
                        Edit
                      </button>
                      <button className={`${styles.button} ${styles.danger}`}>
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {showAddModal && (
          <AddSkillModal onClose={() => setShowAddModal(false)} />
        )}
      </div>
    </div>
  );
}

function AddSkillModal({ onClose }: { onClose: () => void }) {
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
          Add New Skill
        </h2>

        <form>
          <div className={styles.formGroup}>
            <label>Skill Name</label>
            <input type="text" placeholder="e.g. React" />
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <select>
              <option value="">Select category</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="database">Database</option>
              <option value="languages">Languages</option>
              <option value="tools">Tools</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Proficiency Level</label>
            <select>
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Display Order</label>
            <input type="number" placeholder="1" min="1" />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button type="submit" className={`${styles.button} ${styles.primary}`} style={{ flex: 1 }}>
              Add Skill
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

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";

export default function HobbiesManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data
  const hobbies = [
    {
      id: 1,
      title: "Photography",
      description: "Landscape and street photography",
      order: 1,
    },
    {
      id: 2,
      title: "Hiking",
      description: "Exploring nature trails and mountains",
      order: 2,
    },
    {
      id: 3,
      title: "Reading",
      description: "Tech books and sci-fi novels",
      order: 3,
    },
    {
      id: 4,
      title: "Gaming",
      description: "Strategy and puzzle games",
      order: 4,
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
              <span>Hobbies</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => setShowAddModal(true)}
              >
                + Add Hobby
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>Hobbies & Interests</h1>
            <p>Manage your personal interests and hobbies</p>
          </div>
        </motion.div>

        <div className={`${styles.grid} ${styles.cols3}`}>
          {hobbies.map((hobby, index) => (
            <motion.div
              key={hobby.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", color: "white", margin: "0 0 0.5rem 0" }}>
                  {hobby.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                  {hobby.description}
                </p>
              </div>

              <div style={{ 
                display: "flex", 
                gap: "0.75rem", 
                paddingTop: "1rem", 
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              }}>
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
          <AddHobbyModal onClose={() => setShowAddModal(false)} />
        )}
      </div>
    </div>
  );
}

function AddHobbyModal({ onClose }: { onClose: () => void }) {
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
          Add New Hobby
        </h2>

        <form>
          <div className={styles.formGroup}>
            <label>Hobby/Interest Name</label>
            <input type="text" placeholder="e.g. Photography" />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea placeholder="Brief description of your hobby..." rows={3} />
          </div>

          <div className={styles.formGroup}>
            <label>Display Order</label>
            <input type="number" defaultValue="1" min="1" />
          </div>

          <div className={styles.formGroup}>
            <label>Display Order</label>
            <input type="number" defaultValue="1" min="1" />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button type="submit" className={`${styles.button} ${styles.primary}`} style={{ flex: 1 }}>
              Add Hobby
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

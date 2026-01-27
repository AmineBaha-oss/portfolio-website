"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { getSkills, createSkill, updateSkill, deleteSkill } from "@/lib/api/admin-client";

export default function SkillsManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSkills();
      setSkills(response.skills);
    } catch (err: any) {
      console.error('Error fetching skills:', err);
      setError(err.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      await deleteSkill(id);
      await fetchSkills();
    } catch (err: any) {
      alert(err.message || 'Failed to delete skill');
    }
  };

  const handleEdit = (skill: any) => {
    setEditingSkill(skill);
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Skills</h1>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <span>Skills</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => {
                  setEditingSkill(null);
                  setShowAddModal(true);
                }}
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
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, index) => {
                const name = typeof skill.name === 'object' ? skill.name.en || skill.name.fr : skill.name;
                return (
                  <motion.tr
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  >
                    <td style={{ fontWeight: 500 }}>{name}</td>
                    <td>{skill.category}</td>
                    <td>{skill.order}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button 
                          className={`${styles.button} ${styles.secondary}`}
                          onClick={() => handleEdit(skill)}
                        >
                          Edit
                        </button>
                        <button 
                          className={`${styles.button} ${styles.danger}`}
                          onClick={() => handleDelete(skill.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        {showAddModal && (
          <SkillModal 
            skill={editingSkill}
            onClose={() => {
              setShowAddModal(false);
              setEditingSkill(null);
            }}
            onSuccess={fetchSkills}
          />
        )}
      </div>
    </div>
  );
}

function SkillModal({ skill, onClose, onSuccess }: { skill: any; onClose: () => void; onSuccess: () => void }) {
  const isEditing = !!skill;
  const [formData, setFormData] = useState({
    name: { en: '', fr: '' },
    category: '',
    order: 0,
  });
  const [orderInput, setOrderInput] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (skill) {
      const name = typeof skill.name === 'object' ? skill.name : { en: skill.name, fr: '' };
      setFormData({
        name,
        category: skill.category || '',
        order: skill.order ?? 0,
      });
      setOrderInput(String(skill.order ?? 0));
    } else {
      setOrderInput('0');
    }
  }, [skill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const order = parseInt(orderInput, 10) || 0;
    const payload = { ...formData, order };

    try {
      if (isEditing) {
        await updateSkill(skill.id, payload);
      } else {
        await createSkill(payload);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {isEditing ? 'Edit Skill' : 'Add New Skill'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Skill Name (English) *</label>
            <input 
              type="text" 
              placeholder="e.g. React"
              value={formData.name.en}
              onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Skill Name (French) *</label>
            <input 
              type="text" 
              placeholder="e.g. React"
              value={formData.name.fr}
              onChange={(e) => setFormData({ ...formData, name: { ...formData.name, fr: e.target.value } })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              <option value="Languages">Languages</option>
              <option value="Back-End">Back-End</option>
              <option value="Front-End & Mobile">Front-End & Mobile</option>
              <option value="Databases">Databases</option>
              <option value="DevOps & Tools">DevOps & Tools</option>
              <option value="AI & Data">AI & Data</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Display Order</label>
            <input 
              type="number" 
              placeholder="0" 
              min={0}
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button 
              type="submit" 
              className={`${styles.button} ${styles.primary}`} 
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Skill' : 'Add Skill')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.button} ${styles.secondary}`}
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

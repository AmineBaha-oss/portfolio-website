"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { getSkills, createSkill, updateSkill, deleteSkill } from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";
import { triggerDataRefresh } from "@/lib/hooks/useDataRefresh";
import { useDialog } from "@/components/ui/ConfirmDialog";

export default function SkillsManagementPage() {
  const { t, locale } = useTranslations();
  const { showConfirm, showAlert } = useDialog();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map category keys to translation keys
  const getCategoryTranslation = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'Languages': 'skills.categories.languages',
      'Back-End': 'skills.categories.backend',
      'Front-End & Mobile': 'skills.categories.frontend',
      'Databases': 'skills.categories.databases',
      'DevOps & Tools': 'skills.categories.devops',
      'AI & Data': 'skills.categories.ai',
    };
    return t(categoryMap[category] || category);
  };

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
    const confirmed = await showConfirm({ message: t('dashboard.deleteConfirm'), title: t('dashboard.delete') });
    if (!confirmed) return;
    
    try {
      await deleteSkill(id);
      await fetchSkills();
      triggerDataRefresh();
    } catch (err: any) {
      await showAlert(err.message || t('dashboard.error'), 'error');
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
            <h1>{t('skills.title')}</h1>
            <p>{t('dashboard.loading')}</p>
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
              <a href="/dashboard">{t('dashboard.title')}</a>
              <span>/</span>
              <span>{t('skills.title')}</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => {
                  setEditingSkill(null);
                  setShowAddModal(true);
                }}
              >
                + {t('dashboardSkills.addNew')}
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>{t('dashboardSkills.title')}</h1>
            <p>{t('skills.subtitle')}</p>
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
                <th>{t('dashboardSkills.name')}</th>
                <th>{t('dashboardSkills.category')}</th>
                <th>{t('dashboardSkills.order')}</th>
                <th>{t('dashboard.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, index) => {
                const name = typeof skill.name === 'object' && skill.name && locale in skill.name ? skill.name[locale] : String(skill.name ?? '');
                return (
                  <motion.tr
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  >
                    <td style={{ fontWeight: 500 }}>{name}</td>
                    <td>{getCategoryTranslation(skill.category)}</td>
                    <td>{skill.order}</td>
                    <td>
                      <div className={styles.cardActions}>
                        <button 
                          className={`${styles.button} ${styles.secondary}`}
                          onClick={() => handleEdit(skill)}
                        >
                          {t('dashboard.edit')}
                        </button>
                        <button 
                          className={`${styles.button} ${styles.danger}`}
                          onClick={() => handleDelete(skill.id)}
                        >
                          {t('dashboard.delete')}
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
            skills={skills}
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

function SkillModal({ skill, skills, onClose, onSuccess }: { skill: any; skills: any[]; onClose: () => void; onSuccess: () => void }) {
  const { t } = useTranslations();
  const { showAlert } = useDialog();
  const isEditing = !!skill;
  
  // Calculate the default order as max order + 1
  const getDefaultOrder = () => {
    if (skills.length === 0) return 0;
    const maxOrder = Math.max(...skills.map(s => s.order ?? 0));
    return maxOrder + 1;
  };
  
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
      const defaultOrder = getDefaultOrder();
      setFormData(prev => ({ ...prev, order: defaultOrder }));
      setOrderInput(String(defaultOrder));
    }
  }, [skill, skills]);

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
      
      triggerDataRefresh();
      onSuccess();
      onClose();
    } catch (err: any) {
      await showAlert(err.message || 'Failed to save skill', 'error');
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
          {isEditing ? t('dashboardSkills.editTitle') : t('dashboardSkills.addNew')}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>{t('dashboardSkills.name')} (English) *</label>
            <input 
              type="text" 
              placeholder="e.g. React"
              value={formData.name.en}
              onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardSkills.name')} (French) *</label>
            <input 
              type="text" 
              placeholder="e.g. React"
              value={formData.name.fr}
              onChange={(e) => setFormData({ ...formData, name: { ...formData.name, fr: e.target.value } })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardSkills.category')} *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">{t('common.select')}</option>
              <option value="Languages">{t('skills.categories.languages')}</option>
              <option value="Back-End">{t('skills.categories.backend')}</option>
              <option value="Front-End & Mobile">{t('skills.categories.frontend')}</option>
              <option value="Databases">{t('skills.categories.databases')}</option>
              <option value="DevOps & Tools">{t('skills.categories.devops')}</option>
              <option value="AI & Data">{t('skills.categories.ai')}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardSkills.order')}</label>
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
              {isSubmitting ? t('common.submitting') : (isEditing ? t('dashboard.save') : t('dashboard.add'))}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.button} ${styles.secondary}`}
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {t('dashboard.cancel')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { getExperience, createExperience, updateExperience, deleteExperience } from "@/lib/api/admin-client";

export default function ExperienceManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await getExperience();
      setExperiences(response.experiences);
    } catch (err: any) {
      alert(err.message || 'Failed to load experience');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      await deleteExperience(id);
      await fetchExperiences();
    } catch (err: any) {
      alert(err.message || 'Failed to delete experience');
    }
  };

  if (loading) return <div className={styles.pageContainer}><div className={styles.container}><p>Loading...</p></div></div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.topBar}>
            <div className={styles.breadcrumb}><a href="/dashboard">Dashboard</a><span>/</span><span>Experience</span></div>
            <div className={styles.actions}>
              <button className={`${styles.button} ${styles.primary}`} onClick={() => { setEditingExp(null); setShowAddModal(true); }}>+ Add Experience</button>
            </div>
          </div>
          <div className={styles.pageTitle}><h1>Work Experience</h1><p>Manage your professional work history</p></div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {experiences.map((exp, index) => {
            const pos = typeof exp.position === 'object' && exp.position && 'en' in exp.position ? (exp.position as { en?: string }).en : String(exp.position ?? '');
            const co = typeof exp.company === 'object' && exp.company && 'en' in exp.company ? (exp.company as { en?: string }).en : String(exp.company ?? '');
            const loc = typeof exp.location === 'object' && exp.location && 'en' in exp.location ? (exp.location as { en?: string }).en : String(exp.location ?? '');
            const desc = typeof exp.description === 'object' && exp.description && 'en' in exp.description ? (exp.description as { en?: string }).en : String(exp.description ?? '');
            return (
            <motion.div key={exp.id} className={styles.card} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem", color: "white", margin: 0 }}>{pos}</h3>
                    {exp.current && <span className={styles.badge}>Current</span>}
                  </div>
                  <p style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.7)", margin: "0 0 0.5rem 0" }}>{co} • {loc}</p>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: "0 0 1rem 0" }}>
                    {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '')}
                  </p>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.875rem", lineHeight: "1.6" }}>{desc}</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginLeft: "2rem" }}>
                  <button className={`${styles.button} ${styles.secondary}`} onClick={() => { setEditingExp(exp); setShowAddModal(true); }}>Edit</button>
                  <button className={`${styles.button} ${styles.danger}`} onClick={() => handleDelete(exp.id)}>Delete</button>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>

        {showAddModal && <ExperienceModal exp={editingExp} onClose={() => { setShowAddModal(false); setEditingExp(null); }} onSuccess={fetchExperiences} />}
      </div>
    </div>
  );
}

function toBilingual(v: unknown): { en: string; fr: string } {
  if (v && typeof v === 'object' && 'en' in v && 'fr' in v) return { en: String((v as { en: unknown }).en ?? ''), fr: String((v as { fr: unknown }).fr ?? '') };
  const s = typeof v === 'string' ? v : String(v ?? '');
  return { en: s, fr: s };
}

function ExperienceModal({ exp, onClose, onSuccess }: { exp: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<{
    position: { en: string; fr: string };
    company: { en: string; fr: string };
    location: { en: string; fr: string };
    description: { en: string; fr: string };
    startDate: string;
    endDate: string;
    current: boolean;
  }>({
    position: { en: '', fr: '' },
    company: { en: '', fr: '' },
    location: { en: '', fr: '' },
    description: { en: '', fr: '' },
    startDate: '',
    endDate: '',
    current: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (exp) {
      setFormData({
        position: toBilingual(exp.position),
        company: toBilingual(exp.company),
        location: toBilingual(exp.location),
        description: toBilingual(exp.description),
        startDate: exp.startDate ? (typeof exp.startDate === 'string' ? exp.startDate.slice(0, 10) : '') : '',
        endDate: exp.endDate ? (typeof exp.endDate === 'string' ? exp.endDate.slice(0, 10) : '') : '',
        current: !!exp.current,
      });
    }
  }, [exp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      position: formData.position,
      company: formData.company,
      location: formData.location,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      current: formData.current,
    };
    try {
      if (exp) await updateExperience(exp.id, payload);
      else await createExperience(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save experience');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className={styles.modalCard} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem" }}>{exp ? 'Edit Experience' : 'Add Work Experience'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><label>Position (English)</label><input type="text" placeholder="e.g. Senior Full Stack Developer" value={formData.position.en} onChange={(e) => setFormData({ ...formData, position: { ...formData.position, en: e.target.value } })} required /></div>
          <div className={styles.formGroup}><label>Position (French)</label><input type="text" placeholder="e.g. Développeur Full Stack Senior" value={formData.position.fr} onChange={(e) => setFormData({ ...formData, position: { ...formData.position, fr: e.target.value } })} /></div>
          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}><label>Company (English)</label><input type="text" placeholder="Company name" value={formData.company.en} onChange={(e) => setFormData({ ...formData, company: { ...formData.company, en: e.target.value } })} required /></div>
            <div className={styles.formGroup}><label>Company (French)</label><input type="text" placeholder="Nom de l'entreprise" value={formData.company.fr} onChange={(e) => setFormData({ ...formData, company: { ...formData.company, fr: e.target.value } })} /></div>
          </div>
          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}><label>Location (English)</label><input type="text" placeholder="City, Country or Remote" value={formData.location.en} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, en: e.target.value } })} required /></div>
            <div className={styles.formGroup}><label>Location (French)</label><input type="text" placeholder="Ville, Pays ou Télétravail" value={formData.location.fr} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, fr: e.target.value } })} /></div>
          </div>
          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}><label>Start Date</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
            <div className={styles.formGroup}><label>End Date</label><input type="date" disabled={formData.current} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
          </div>
          <div className={styles.formGroup}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={formData.current} onChange={(e) => setFormData({ ...formData, current: e.target.checked })} />
              <span>I currently work here</span>
            </label>
          </div>
          <div className={styles.formGroup}><label>Description (English)</label><textarea placeholder="Describe your responsibilities and achievements..." rows={4} value={formData.description.en} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })} required /></div>
          <div className={styles.formGroup}><label>Description (French)</label><textarea placeholder="Décrivez vos responsabilités et réalisations..." rows={4} value={formData.description.fr} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })} /></div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button type="submit" className={`${styles.button} ${styles.primary}`} style={{ flex: 1 }} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (exp ? 'Update' : 'Add Experience')}</button>
            <button type="button" onClick={onClose} className={`${styles.button} ${styles.secondary}`} style={{ flex: 1 }} disabled={isSubmitting}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

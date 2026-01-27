"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { getEducation, createEducation, updateEducation, deleteEducation } from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";

export default function EducationManagementPage() {
  const { t, locale } = useTranslations();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEdu, setEditingEdu] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const response = await getEducation();
      setEducation(response.education);
    } catch (err: any) {
      alert(err.message || 'Failed to load education');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('dashboard.deleteConfirm'))) return;
    try {
      await deleteEducation(id);
      await fetchEducation();
    } catch (err: any) {
      alert(err.message || t('dashboard.error'));
    }
  };

  if (loading) return <div className={styles.pageContainer}><div className={styles.container}><p>{t('dashboard.loading')}</p></div></div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.topBar}>
            <div className={styles.breadcrumb}><a href="/dashboard">{t('dashboard.title')}</a><span>/</span><span>{t('education.title')}</span></div>
            <div className={styles.actions}>
              <button className={`${styles.button} ${styles.primary}`} onClick={() => { setEditingEdu(null); setShowAddModal(true); }}>+ {t('dashboardEducation.addNew')}</button>
            </div>
          </div>
          <div className={styles.pageTitle}><h1>{t('dashboardEducation.title')}</h1><p>{t('education.subtitle')}</p></div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {education.map((edu, index) => {
            const deg = typeof edu.degree === 'object' && edu.degree && locale in edu.degree ? edu.degree[locale] : String(edu.degree ?? '');
            const inst = typeof edu.institution === 'object' && edu.institution && locale in edu.institution ? edu.institution[locale] : String(edu.institution ?? '');
            const loc = typeof edu.location === 'object' && edu.location && locale in edu.location ? edu.location[locale] : String(edu.location ?? '');
            const desc = typeof edu.description === 'object' && edu.description && locale in edu.description ? edu.description[locale] : String(edu.description ?? '');
            return (
            <motion.div key={edu.id} className={styles.card} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.25rem", color: "white", margin: "0 0 0.5rem 0" }}>{deg}</h3>
                  <p style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.7)", margin: "0 0 0.5rem 0" }}>{inst} • {loc}</p>
                  <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
                      {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                    </p>
                    {edu.gpa && <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>GPA: {edu.gpa}/4.0</p>}
                  </div>
                  {desc && <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.875rem", lineHeight: "1.6" }}>{desc}</p>}
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginLeft: "2rem" }}>
                  <button className={`${styles.button} ${styles.secondary}`} onClick={() => { setEditingEdu(edu); setShowAddModal(true); }}>{t('dashboard.edit')}</button>
                  <button className={`${styles.button} ${styles.danger}`} onClick={() => handleDelete(edu.id)}>{t('dashboard.delete')}</button>
                </div>
              </div>
            </motion.div>
          );})}
        </div>

        {showAddModal && <EducationModal edu={editingEdu} onClose={() => { setShowAddModal(false); setEditingEdu(null); }} onSuccess={fetchEducation} />}
      </div>
    </div>
  );
}

function toBilingual(v: unknown): { en: string; fr: string } {
  if (v && typeof v === 'object' && 'en' in v && 'fr' in v) return { en: String((v as { en: unknown }).en ?? ''), fr: String((v as { fr: unknown }).fr ?? '') };
  const s = typeof v === 'string' ? v : String(v ?? '');
  return { en: s, fr: s };
}

function EducationModal({ edu, onClose, onSuccess }: { edu: any; onClose: () => void; onSuccess: () => void }) {
  const { t } = useTranslations();
  const [formData, setFormData] = useState<{
    degree: { en: string; fr: string };
    institution: { en: string; fr: string };
    location: { en: string; fr: string };
    description: { en: string; fr: string };
    startDate: string;
    endDate: string;
    gpa: string;
  }>({
    degree: { en: '', fr: '' },
    institution: { en: '', fr: '' },
    location: { en: '', fr: '' },
    description: { en: '', fr: '' },
    startDate: '',
    endDate: '',
    gpa: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (edu) {
      setFormData({
        degree: toBilingual(edu.degree),
        institution: toBilingual(edu.institution),
        location: toBilingual(edu.location),
        description: toBilingual(edu.description),
        startDate: edu.startDate ? (typeof edu.startDate === 'string' ? edu.startDate.slice(0, 10) : '') : '',
        endDate: edu.endDate ? (typeof edu.endDate === 'string' ? edu.endDate.slice(0, 10) : '') : '',
        gpa: edu.gpa || '',
      });
    }
  }, [edu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      degree: formData.degree,
      institution: formData.institution,
      location: formData.location,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      gpa: formData.gpa || undefined,
    };
    try {
      if (edu) await updateEducation(edu.id, payload);
      else await createEducation(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || t('dashboard.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className={styles.modalCard} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem" }}>{edu ? t('dashboardEducation.editTitle') : t('dashboardEducation.addNew')}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><label>{t('dashboardEducation.degree')} (English)</label><input type="text" placeholder={t('dashboardEducation.degreePlaceholder')} value={formData.degree.en} onChange={(e) => setFormData({ ...formData, degree: { ...formData.degree, en: e.target.value } })} required /></div>
          <div className={styles.formGroup}><label>{t('dashboardEducation.degree')} (French)</label><input type="text" placeholder={t('dashboardEducation.degreePlaceholderFr')} value={formData.degree.fr} onChange={(e) => setFormData({ ...formData, degree: { ...formData.degree, fr: e.target.value } })} /></div>
          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}><label>{t('dashboardEducation.institution')} (English)</label><input type="text" placeholder={t('dashboardEducation.institutionPlaceholder')} value={formData.institution.en} onChange={(e) => setFormData({ ...formData, institution: { ...formData.institution, en: e.target.value } })} required /></div>
            <div className={styles.formGroup}><label>{t('dashboardEducation.institution')} (French)</label><input type="text" placeholder={t('dashboardEducation.institutionPlaceholderFr')} value={formData.institution.fr} onChange={(e) => setFormData({ ...formData, institution: { ...formData.institution, fr: e.target.value } })} /></div>
          </div>
          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}><label>{t('dashboardEducation.location')} (English)</label><input type="text" placeholder={t('dashboardEducation.locationPlaceholder')} value={formData.location.en} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, en: e.target.value } })} required /></div>
            <div className={styles.formGroup}><label>{t('dashboardEducation.location')} (French)</label><input type="text" placeholder={t('dashboardEducation.locationPlaceholderFr')} value={formData.location.fr} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, fr: e.target.value } })} /></div>
          </div>
          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}><label>{t('dashboardEducation.startDate')}</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
            <div className={styles.formGroup}><label>{t('dashboardEducation.endDate')}</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
          </div>
          <div className={styles.formGroup}><label>{t('dashboardEducation.gpa')}</label><input type="text" placeholder={t('dashboardEducation.gpaPlaceholder')} value={formData.gpa} onChange={(e) => setFormData({ ...formData, gpa: e.target.value })} /></div>
          <div className={styles.formGroup}><label>{t('dashboardEducation.description')} (English)</label><textarea placeholder={t('dashboardEducation.descriptionPlaceholder')} rows={3} value={formData.description.en} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })} /></div>
          <div className={styles.formGroup}><label>{t('dashboardEducation.description')} (French)</label><textarea placeholder={t('dashboardEducation.descriptionPlaceholderFr')} rows={3} value={formData.description.fr} onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })} /></div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button type="submit" className={`${styles.button} ${styles.primary}`} style={{ flex: 1 }} disabled={isSubmitting}>{isSubmitting ? t('common.submitting') : (edu ? t('dashboard.save') : t('dashboard.add'))}</button>
            <button type="button" onClick={onClose} className={`${styles.button} ${styles.secondary}`} style={{ flex: 1 }} disabled={isSubmitting}>{t('dashboard.cancel')}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

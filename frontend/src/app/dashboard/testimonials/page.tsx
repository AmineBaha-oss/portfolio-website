"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { getTestimonials, approveTestimonial, rejectTestimonial, deleteTestimonial, toggleTestimonialActive } from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";
import { triggerDataRefresh } from "@/lib/hooks/useDataRefresh";
import { useDialog } from "@/components/ui/ConfirmDialog";

export default function TestimonialsManagementPage() {
  const { t } = useTranslations();
  const { showConfirm, showAlert } = useDialog();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await getTestimonials();
      setTestimonials(response.testimonials);
    } catch (err: any) {
      showAlert(err.message || t('dashboard.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveTestimonial(id);
      await fetchTestimonials();
      triggerDataRefresh();
    } catch (err: any) {
      await showAlert(err.message || t('dashboard.error'), 'error');
    }
  };

  const handleReject = async (id: string) => {
    const confirmed = await showConfirm({ message: t('dashboardTestimonials.rejectConfirm'), title: t('dashboardTestimonials.reject') });
    if (!confirmed) return;
    try {
      await rejectTestimonial(id);
      await fetchTestimonials();
      triggerDataRefresh();
    } catch (err: any) {
      await showAlert(err.message || t('dashboard.error'), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({ message: t('dashboard.deleteConfirm'), title: t('dashboard.delete') });
    if (!confirmed) return;
    try {
      await deleteTestimonial(id);
      await fetchTestimonials();
      triggerDataRefresh();
    } catch (err: any) {
      await showAlert(err.message || t('dashboard.error'), 'error');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleTestimonialActive(id);
      await fetchTestimonials();
      triggerDataRefresh();
    } catch (err: any) {
      await showAlert(err.message || t('dashboard.error'), 'error');
    }
  };

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.status === filter);

  const pendingCount = testimonials.filter(t => t.status === "pending").length;

  if (loading) return <div className={styles.pageContainer}><div className={styles.container}><p>{t('dashboard.loading')}</p></div></div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.topBar}>
            <div className={styles.breadcrumb}><a href="/dashboard">{t('dashboard.title')}</a><span>/</span><span>{t('testimonials.title')}</span></div>
            {pendingCount > 0 && <span className={`${styles.badge} ${styles.warning}`}>{pendingCount} {t('dashboardTestimonials.pendingReview')}</span>}
          </div>
          <div className={styles.pageTitle}><h1>{t('testimonials.title')}</h1><p>{t('dashboardTestimonials.subtitle')}</p></div>
        </motion.div>

        <div className={styles.filterButtons}>
          <button className={`${styles.button} ${filter === 'all' ? styles.primary : styles.secondary}`} onClick={() => setFilter('all')}>{t('dashboardTestimonials.all')} ({testimonials.length})</button>
          <button className={`${styles.button} ${filter === 'pending' ? styles.primary : styles.secondary}`} onClick={() => setFilter('pending')}>{t('dashboardTestimonials.pending')} ({testimonials.filter(t => t.status === "pending").length})</button>
          <button className={`${styles.button} ${filter === 'approved' ? styles.primary : styles.secondary}`} onClick={() => setFilter('approved')}>{t('dashboardTestimonials.approved')} ({testimonials.filter(t => t.status === "approved").length})</button>
          <button className={`${styles.button} ${filter === 'rejected' ? styles.primary : styles.secondary}`} onClick={() => setFilter('rejected')}>{t('dashboardTestimonials.rejected')} ({testimonials.filter(t => t.status === "rejected").length})</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {filteredTestimonials.map((testimonial, index) => (
            <motion.div key={testimonial.id} className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.05 }}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", color: "white", margin: "0 0 0.25rem 0" }}>{testimonial.name}</h3>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>{testimonial.position}</p>
                </div>
                <div className={styles.badgeGroup}>
                  <span className={styles.badge}>{testimonial.status}</span>
                  {testimonial.active ? (
                    <span className={styles.badge} style={{ backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }}>Active</span>
                  ) : (
                    <span className={styles.badge} style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>Inactive</span>
                  )}
                </div>
              </div>
              <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.875rem", lineHeight: "1.6", marginBottom: "1rem" }}>"{testimonial.message}"</p>
              <div className={styles.cardFooter}>
                <div className={styles.cardMeta}>
                  <div>{t('dashboardTestimonials.email')}: {testimonial.email}</div>
                  <div>{t('dashboardTestimonials.submitted')}: {new Date(testimonial.submittedAt).toLocaleDateString()}</div>
                </div>
                <div className={styles.cardActions}>
                  {testimonial.status === "pending" && (
                    <>
                      <button className={`${styles.button} ${styles.primary}`} onClick={() => handleApprove(testimonial.id)}>{t('dashboardTestimonials.approve')}</button>
                      <button className={`${styles.button} ${styles.danger}`} onClick={() => handleReject(testimonial.id)}>{t('dashboardTestimonials.reject')}</button>
                    </>
                  )}
                  {testimonial.status !== "pending" && (
                    <>
                      <button 
                        className={`${styles.button} ${testimonial.active ? styles.secondary : styles.primary}`} 
                        onClick={() => handleToggleActive(testimonial.id)}
                      >
                        {testimonial.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className={`${styles.button} ${styles.danger}`} onClick={() => handleDelete(testimonial.id)}>{t('dashboard.delete')}</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

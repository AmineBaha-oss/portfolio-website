'use client';

import styles from './style.module.scss';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { getTestimonials, submitTestimonial, type Testimonial } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Testimonials() {
  const { locale } = useLanguage();
  const { t } = useTranslations();
  const [testimonialsData, setTestimonialsData] = useState<Array<{ id: string; name: string; role: string; company: string; testimonial: string; rating: number; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    testimonial: '',
    email: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTestimonials(locale);
        const mappedTestimonials = response.testimonials.map(t => ({
          id: t.id,
          name: t.name,
          role: t.position,
          company: t.company || '',
          testimonial: t.message,
          rating: t.rating,
          status: t.status
        }));
        setTestimonialsData(mappedTestimonials);
      } catch (err: any) {
        console.error('Error fetching testimonials:', err);
        setError(err.message);
        setTestimonialsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await submitTestimonial({
        name: formData.name,
        position: formData.role,
        company: formData.company || undefined,
        email: formData.email,
        message: formData.testimonial,
        rating: formData.rating
      });
      
      setSubmitSuccess(true);
      setFormData({ name: '', role: '', company: '', testimonial: '', email: '', rating: 5 });
      setTimeout(() => {
        setShowForm(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting testimonial:', error);
      alert('Error submitting testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>{t('testimonials.title')}</h2>
          <p className={styles.subtitle}>{t('testimonials.subtitle')}</p>
        </motion.div>

        <div className={styles.body}>
          {loading ? (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
              {t('dashboard.loading')}
            </p>
          ) : error ? (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
              {t('dashboard.error')}
            </p>
          ) : (
            <div className={styles.testimonialsGrid}>
              {testimonialsData.length > 0 ? testimonialsData.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className={styles.testimonialCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.authorInfo}>
                    <div className={styles.avatar}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className={styles.authorDetails}>
                      <h4>{testimonial.name}</h4>
                      <p className={styles.role}>{testimonial.role}</p>
                      <p className={styles.company}>{testimonial.company}</p>
                    </div>
                  </div>
                  <div className={styles.rating}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
                <p className={styles.quote}>"{testimonial.testimonial}"</p>
              </motion.div>
              )) : (
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>
                  {t('testimonials.noTestimonials')}
                </p>
              )}
            </div>
          )}

          <motion.div
            className={styles.submitSection}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {!showForm ? (
              <button
                className={styles.submitButton}
                onClick={() => setShowForm(true)}
              >
                {t('testimonials.submitButton')}
              </button>
            ) : (
              <motion.div
                className={styles.formContainer}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <h3>{t('testimonials.formTitle')}</h3>
                <p className={styles.formSubtitle}>{t('testimonials.formSubtitle')}</p>
                {submitSuccess && (
                  <div style={{ 
                    padding: '1rem', 
                    background: 'rgba(34, 197, 94, 0.1)', 
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#22c55e'
                  }}>
                    {t('testimonials.successMessage')}
                  </div>
                )}
                <form className={styles.testimonialForm} onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>{t('testimonials.yourName')} *</label>
                      <input
                        type="text"
                        placeholder={t('testimonials.namePlaceholder')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t('testimonials.yourEmail')} *</label>
                      <input
                        type="email"
                        placeholder={t('testimonials.emailPlaceholder')}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>{t('testimonials.yourRole')} *</label>
                      <input
                        type="text"
                        placeholder={t('testimonials.rolePlaceholder')}
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t('testimonials.schoolCompany')}</label>
                      <input
                        type="text"
                        placeholder={t('testimonials.companyPlaceholder')}
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('testimonials.yourTestimonial')} *</label>
                    <textarea
                      placeholder={t('testimonials.testimonialPlaceholder')}
                      value={formData.testimonial}
                      onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                      required
                      rows={5}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('testimonials.rating')} *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating })}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            color: formData.rating >= rating ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)',
                            transition: 'color 0.2s'
                          }}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ marginLeft: '0.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {formData.rating} / 5
                      </span>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setShowForm(false)}
                      disabled={isSubmitting}
                    >
                      {t('dashboard.cancel')}
                    </button>
                    <button
                      type="submit"
                      className={styles.submitFormButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t('testimonials.submitting') : t('testimonials.submitButton')}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

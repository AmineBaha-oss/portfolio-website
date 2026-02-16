'use client';

import styles from './style.module.scss';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { getTestimonials, submitTestimonial, ApiError, type Testimonial } from '@/lib/api/client';
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
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

  const validateTestimonialForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    } else if (formData.role.length > 60) {
      errors.role = 'Role must be less than 60 characters';
    }
    
    if (formData.company.length > 60) {
      errors.company = 'Company must be less than 60 characters';
    }
    
    if (!formData.testimonial.trim()) {
      errors.testimonial = 'Testimonial is required';
    } else if (formData.testimonial.length > 500) {
      errors.testimonial = 'Testimonial must be less than 500 characters';
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    const errors = validateTestimonialForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitErrorMessage(null);

    try {
      await submitTestimonial({
        name: formData.name,
        position: formData.role,
        company: formData.company || undefined,
        email: formData.email,
        message: formData.testimonial,
        rating: 5
      });
      
      setSubmitSuccess(true);
      setFormData({ name: '', role: '', company: '', testimonial: '', email: '' });
      setTimeout(() => {
        setShowForm(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      console.error('Error submitting testimonial:', err);
      const isRateLimit = err instanceof ApiError
        ? err.status === 429
        : (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 429);
      const message = isRateLimit ? t('testimonials.rateLimit') : t('testimonials.error');
      setSubmitErrorMessage(message);
      setTimeout(() => setSubmitErrorMessage(null), 6000);
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
              {testimonialsData.length > 0 ? testimonialsData.slice(0, 6).map((testimonial, index) => (
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
                {submitErrorMessage && (
                  <div style={{ 
                    padding: '1rem', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#ef4444'
                  }}>
                    {submitErrorMessage}
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
                        maxLength={50}
                        className={validationErrors.name ? styles.errorInput : ''}
                      />
                      {validationErrors.name && (
                        <span className={styles.errorText}>{validationErrors.name}</span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t('testimonials.yourEmail')} *</label>
                      <input
                        type="email"
                        placeholder={t('testimonials.emailPlaceholder')}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className={validationErrors.email ? styles.errorInput : ''}
                      />
                      {validationErrors.email && (
                        <span className={styles.errorText}>{validationErrors.email}</span>
                      )}
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
                        maxLength={60}
                        className={validationErrors.role ? styles.errorInput : ''}
                      />
                      {validationErrors.role && (
                        <span className={styles.errorText}>{validationErrors.role}</span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t('testimonials.schoolCompany')}</label>
                      <input
                        type="text"
                        placeholder={t('testimonials.companyPlaceholder')}
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        maxLength={60}
                        className={validationErrors.company ? styles.errorInput : ''}
                      />
                      {validationErrors.company && (
                        <span className={styles.errorText}>{validationErrors.company}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <div className={styles.labelRow}>
                      <label>{t('testimonials.yourTestimonial')} *</label>
                      <span className={styles.charCount}>{formData.testimonial.length}/500</span>
                    </div>
                    <textarea
                      placeholder={t('testimonials.testimonialPlaceholder')}
                      value={formData.testimonial}
                      onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                      required
                      rows={5}
                      maxLength={500}
                      className={validationErrors.testimonial ? styles.errorInput : ''}
                    />
                    {validationErrors.testimonial && (
                      <span className={styles.errorText}>{validationErrors.testimonial}</span>
                    )}
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

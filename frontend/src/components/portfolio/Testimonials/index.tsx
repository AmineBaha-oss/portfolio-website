'use client';

import styles from './style.module.scss';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { getTestimonials, submitTestimonial, type Testimonial } from '@/lib/api/client';

export default function Testimonials() {
  const { locale } = useLanguage();
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
          <h2 className={styles.title}>Testimonials</h2>
          <p className={styles.subtitle}>What people say about working with me</p>
        </motion.div>

        <div className={styles.body}>
          {loading ? (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
              Loading testimonials...
            </p>
          ) : error ? (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
              Error loading testimonials. Please try again later.
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
                  No testimonials available yet.
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
                Submit a Testimonial
              </button>
            ) : (
              <motion.div
                className={styles.formContainer}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <h3>Share Your Experience</h3>
                <p className={styles.formSubtitle}>Your testimonial will be reviewed before being published</p>
                {submitSuccess && (
                  <div style={{ 
                    padding: '1rem', 
                    background: 'rgba(34, 197, 94, 0.1)', 
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#22c55e'
                  }}>
                    Thank you! Your testimonial has been submitted and is pending admin approval.
                  </div>
                )}
                <form className={styles.testimonialForm} onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Your Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Email *</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Your Role *</label>
                      <input
                        type="text"
                        placeholder="CEO, Developer, etc."
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>School / Company (Optional)</label>
                      <input
                        type="text"
                        placeholder="University Name or Company Name"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Your Testimonial *</label>
                    <textarea
                      placeholder="Share your experience working with me..."
                      value={formData.testimonial}
                      onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                      required
                      rows={5}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Rating *</label>
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
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitFormButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
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

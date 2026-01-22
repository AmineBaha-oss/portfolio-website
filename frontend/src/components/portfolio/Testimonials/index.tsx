'use client';

import styles from './style.module.scss';
import { motion } from 'framer-motion';
import { useState } from 'react';

// Placeholder testimonials - will be fetched from backend (only approved ones)
const testimonialsData = [
  {
    id: 1,
    name: 'John Doe',
    role: 'CEO at Tech Corp',
    company: 'Tech Corp',
    testimonial: 'Exceptional developer with great attention to detail. Delivered the project on time and exceeded expectations.',
    rating: 5,
    status: 'approved'
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Product Manager',
    company: 'Innovation Labs',
    testimonial: 'Professional, communicative, and highly skilled. A pleasure to work with!',
    rating: 5,
    status: 'approved'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'Startup Founder',
    company: 'StartupXYZ',
    testimonial: 'Transformed our vision into reality. Highly recommended for any web development project.',
    rating: 5,
    status: 'approved'
  }
];

export default function Testimonials() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    testimonial: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Send to backend API
      // const response = await fetch('/api/testimonials', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Placeholder success
      setTimeout(() => {
        alert('Thank you! Your testimonial has been submitted and is pending admin approval.');
        setFormData({ name: '', role: '', company: '', testimonial: '', email: '' });
        setShowForm(false);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      alert('Error submitting testimonial. Please try again.');
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
          <div className={styles.testimonialsGrid}>
            {testimonialsData.map((testimonial, index) => (
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
            ))}
          </div>

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

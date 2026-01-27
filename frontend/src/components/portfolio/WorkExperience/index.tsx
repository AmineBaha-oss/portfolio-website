'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './style.module.scss';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/context';
import { getExperience, type WorkExperience } from '@/lib/api/client';

function formatDate(dateString: string, locale: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
}

export default function WorkExperience() {
  const { locale } = useLanguage();
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getExperience(locale);
        setExperiences(response.experiences);
      } catch (err: any) {
        console.error('Error fetching experience:', err);
        setError(err.message);
        setExperiences([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [locale]);

  const experienceData = useMemo(() => {
    return experiences.map((exp) => {
      const period = exp.current 
        ? `${formatDate(exp.startDate, locale)} - Present`
        : `${formatDate(exp.startDate, locale)} - ${exp.endDate ? formatDate(exp.endDate, locale) : ''}`;
      
      // Split description by newlines for achievements, or use as single description
      const descriptionLines = exp.description ? exp.description.split('\n').filter(line => line.trim()) : [];
      const description = descriptionLines[0] || '';
      const achievements = descriptionLines.length > 1 ? descriptionLines.slice(1) : [];

      return {
        title: exp.position,
        company: exp.company,
        period,
        description,
        achievements,
      };
    });
  }, [experiences, locale]);
  if (loading) {
    return (
      <section id="experience" className={styles.experience}>
        <div className={styles.container}>
          <h2 className={styles.title}>Work Experience</h2>
          <p className={styles.subtitle}>Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="experience" className={styles.experience}>
        <div className={styles.container}>
          <h2 className={styles.title}>Work Experience</h2>
          <p className={styles.subtitle}>Error loading experience. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" className={styles.experience}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>Work Experience</h2>
          <p className={styles.subtitle}>
            My professional journey and achievements
          </p>
        </motion.div>

        <div className={styles.timeline}>
          {experienceData.length > 0 ? experienceData.map((exp, index) => (
            <motion.div
              key={index}
              className={styles.timelineItem}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className={styles.timelineDot}></div>
              <div className={styles.content}>
                <span className={styles.period}>{exp.period}</span>
                <h3>{exp.title}</h3>
                <h4>{exp.company}</h4>
                <p>{exp.description}</p>
                <ul>
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
              No work experience available.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

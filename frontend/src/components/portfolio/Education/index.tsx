'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './style.module.scss';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/context';
import { getEducation, type Education } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';

function formatDate(dateString: string, locale: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
}

export default function Education() {
  const { locale } = useLanguage();
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getEducation(locale);
        setEducation(response.education);
      } catch (err: any) {
        console.error('Error fetching education:', err);
        setError(err.message);
        setEducation([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, [locale]);

  const educationData = useMemo(() => {
    return education.map((edu) => {
      const period = edu.endDate 
        ? `${formatDate(edu.startDate, locale)} - ${formatDate(edu.endDate, locale)}`
        : `${formatDate(edu.startDate, locale)} - ${locale === 'fr' ? 'Présent' : 'Present'}`;
      
      // Split description by newlines for achievements, or use as single description
      const descriptionLines = edu.description ? edu.description.split('\n').filter(line => line.trim()) : [];
      const description = descriptionLines[0] || '';
      const achievements = descriptionLines.length > 1 ? descriptionLines.slice(1) : [];

      return {
        degree: edu.degree,
        institution: edu.institution,
        period,
        description,
        achievements,
      };
    });
  }, [education, locale]);
  const { t } = useTranslations();

  if (loading) {
    return (
      <section id="education" className={styles.education}>
        <div className={styles.container}>
          <h2 className={styles.title}>{t('education.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.loading')}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="education" className={styles.education}>
        <div className={styles.container}>
          <h2 className={styles.title}>{t('education.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.error')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="education" className={styles.education}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>{t('education.title')}</h2>
          <p className={styles.subtitle}>{t('education.subtitle')}</p>
        </motion.div>

        <div className={styles.educationGrid}>
          {educationData.length > 0 ? educationData.map((edu, index) => (
            <motion.div
              key={index}
              className={styles.educationCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <span className={styles.period}>{edu.period}</span>
              <h3>{edu.degree}</h3>
              <h4>{edu.institution}</h4>
              <p>{edu.description}</p>
              <ul>
                {edu.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
                ))}
              </ul>
            </motion.div>
          )) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
              No education information available.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

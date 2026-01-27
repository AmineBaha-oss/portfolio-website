'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './style.module.scss';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/context';
import { getSkills, type Skill } from '@/lib/api/client';

export default function Skills() {
  const { locale } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSkills(locale);
        setSkills(response.skills);
      } catch (err: any) {
        console.error('Error fetching skills:', err);
        setError(err.message);
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [locale]);

  // Group skills by category
  const skillsData = useMemo(() => {
    const grouped: { [key: string]: string[] } = {};
    skills.forEach((skill) => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill.name);
    });
    
    return Object.entries(grouped).map(([category, skillsList]) => ({
      category,
      skills: skillsList,
    }));
  }, [skills]);
  if (loading) {
    return (
      <section id="skills" className={styles.skills}>
        <div className={styles.container}>
          <h2 className={styles.title}>Skills & Technologies</h2>
          <p className={styles.subtitle}>Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="skills" className={styles.skills}>
        <div className={styles.container}>
          <h2 className={styles.title}>Skills & Technologies</h2>
          <p className={styles.subtitle}>Error loading skills. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className={styles.skills}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>Skills & Technologies</h2>
          <p className={styles.subtitle}>
            Technologies and tools I work with to bring ideas to life
          </p>
        </motion.div>

        <div className={styles.skillsGrid}>
          {skillsData.length > 0 ? skillsData.map((category, _index) => (
            <motion.div
              key={category.category}
              className={styles.skillCategory}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <h3>{category.category}</h3>
              <div className={styles.skillsList}>
                {category.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    className={styles.skillTag}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.4,
                      delay: skillIndex * 0.08,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    viewport={{ once: true, amount: 0.5 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
              No skills available.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

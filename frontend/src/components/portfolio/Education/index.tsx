'use client';

import styles from './style.module.scss';
import { motion } from 'framer-motion';

const educationData = [
  {
    degree: 'Diplôme d\'études collégiales (DEC) — Computer Science Technology',
    institution: 'Champlain College Saint-Lambert',
    period: 'Aug 2023 - Jun 2026 (Expected)',
    description: 'Techniques de l\'informatique / Computer Science Technology',
    achievements: ['Software Development', 'Database Design', 'Agile/Scrum methodologies']
  }
];

export default function Education() {
  return (
    <section id="education" className={styles.education}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>Education</h2>
          <p className={styles.subtitle}>Academic background and qualifications</p>
        </motion.div>

        <div className={styles.educationGrid}>
          {educationData.map((edu, index) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import styles from './style.module.scss';
import { motion } from 'framer-motion';

// Placeholder data - will be dynamic from backend later
const experienceData = [
  {
    title: 'Peer Tutor — Computer Science',
    company: 'Champlain College Saint-Lambert',
    period: 'Sep 2025 - Dec 2025',
    description: 'Provided one-on-one and group tutoring in computer science fundamentals.',
    achievements: [
      'Tutored in Java, C#, data structures, SQL, and web fundamentals',
      'Guided debugging, schema design, and exam preparation',
      'Created practice exercises and reviewed Git workflows and Linux tooling'
    ]
  }
];

export default function WorkExperience() {
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
          {experienceData.map((exp, index) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import styles from './style.module.scss';
import { motion } from 'framer-motion';

// Placeholder skills data - will be dynamic from backend later
const skillsData = [
  {
    category: 'Languages',
    skills: ['Java', 'C#', 'Kotlin', 'PHP', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'HTML/CSS']
  },
  {
    category: 'Back-End',
    skills: ['Spring Boot', 'ASP.NET MVC', 'Laravel', 'Node.js', 'REST APIs', 'GraphQL', 'JWT']
  },
  {
    category: 'Front-End & Mobile',
    skills: ['React', 'Next.js', 'Android', 'Tailwind CSS', 'Bootstrap', 'Blade']
  },
  {
    category: 'Databases',
    skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'TimescaleDB']
  },
  {
    category: 'DevOps & Tools',
    skills: ['Docker', 'Git', 'Linux/Bash', 'Gradle', 'Postman', 'Jira', 'VS Code']
  },
  {
    category: 'AI & Data',
    skills: ['OpenAI API', 'Langchain', 'PDF Processing', 'Audio Processing', 'Prompt Engineering']
  }
];

export default function Skills() {
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
          {skillsData.map((category, _index) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}

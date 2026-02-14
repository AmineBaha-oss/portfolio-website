'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './style.module.scss';
import { useLanguage } from '@/lib/i18n/context';
import { getSkills, type Skill } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';
import { getSkillIcon, getSkillIconColor } from '@/lib/utils/skill-icons';

export default function Skills() {
  const { locale } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isHoveringNavRef = useRef(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSkills(locale);
        setSkills(response.skills);
      } catch (err: unknown) {
        console.error('Error fetching skills:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSkills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [locale]);

  const skillsData = useMemo(() => {
    const grouped: Record<string, { name: string; icon?: string | null }[]> = {};
    skills.forEach((skill) => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push({ name: skill.name, icon: skill.icon });
    });
    return Object.entries(grouped).map(([category, skillsList]) => ({
      category,
      skills: skillsList,
    }));
  }, [skills]);

  const { t } = useTranslations();

  const getCategoryTranslation = (category: string): string => {
    const categoryMap: Record<string, string> = {
      Languages: 'skills.categories.languages',
      Backend: 'skills.categories.backend',
      'Back-End': 'skills.categories.backend',
      Frontend: 'skills.categories.frontend',
      'Front-End & Mobile': 'skills.categories.frontend',
      Databases: 'skills.categories.databases',
      DevOps: 'skills.categories.devops',
      'DevOps & Tools': 'skills.categories.devops',
      'AI & Machine Learning': 'skills.categories.ai',
      'AI & Data': 'skills.categories.ai',
    };
    return categoryMap[category] || category;
  };

  const goToIndex = useCallback((index: number) => {
    const next = Math.max(0, Math.min(skillsData.length - 1, index));
    setDirection(next > activeIndex ? 1 : -1);
    setActiveIndex(next);
  }, [skillsData.length, activeIndex]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isHoveringNavRef.current || skillsData.length === 0) return;

      const isScrollDown = e.deltaY > 0;

      if (isScrollDown) {
        if (activeIndex < skillsData.length - 1) {
          e.preventDefault();
          e.stopPropagation();
          goToIndex(activeIndex + 1);
        }
      } else {
        if (activeIndex > 0) {
          e.preventDefault();
          e.stopPropagation();
          goToIndex(activeIndex - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', handleWheel, { capture: true });
  }, [activeIndex, skillsData.length, goToIndex]);

  if (loading) {
    return (
      <section ref={sectionRef} id="skills" className={styles.skills}>
        <div className={styles.viewport}>
          <h2 className={styles.title}>{t('skills.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.loading')}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section ref={sectionRef} id="skills" className={styles.skills}>
        <div className={styles.viewport}>
          <h2 className={styles.title}>{t('skills.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.error')}</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="skills" className={styles.skills}>
      <div className={styles.viewport}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('skills.title')}</h2>
          <p className={styles.subtitle}>{t('skills.subtitle')}</p>
        </div>

        {skillsData.length > 0 ? (
          <>
            <nav
              className={styles.categoryNav}
              aria-label="Skill categories"
              onMouseEnter={() => { isHoveringNavRef.current = true; }}
              onMouseLeave={() => { isHoveringNavRef.current = false; }}
            >
              {skillsData.map(({ category }, i) => (
                <button
                  key={category}
                  type="button"
                  className={activeIndex === i ? styles.active : ''}
                  onClick={() => goToIndex(i)}
                >
                  {t(getCategoryTranslation(category))}
                </button>
              ))}
            </nav>

            <div
              className={styles.scrollIndicator}
              aria-hidden
              onMouseEnter={() => { isHoveringNavRef.current = true; }}
              onMouseLeave={() => { isHoveringNavRef.current = false; }}
            >
              {skillsData.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={activeIndex === i ? styles.indicatorActive : ''}
                  onClick={() => goToIndex(i)}
                  aria-label={t(getCategoryTranslation(skillsData[i]?.category ?? ''))}
                />
              ))}
            </div>

            <div className={styles.slider}>
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                {skillsData[activeIndex] && (
                  <motion.div
                    key={skillsData[activeIndex].category}
                    className={styles.slide}
                    custom={direction}
                    initial={
                      direction === 0
                        ? false
                        : { opacity: 0, y: direction > 0 ? 32 : -32 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: direction > 0 ? -32 : 32 }}
                    transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <h3 className={styles.categoryTitle}>
                      {t(getCategoryTranslation(skillsData[activeIndex].category))}
                    </h3>
                    <div className={styles.skillsFlow}>
                      {skillsData[activeIndex].skills.map((skill) => {
                        const IconComponent = getSkillIcon(skill.icon);
                        const iconColor = getSkillIconColor(skill.icon);
                        const hasIcon = !!IconComponent;
                        return hasIcon ? (
                          <div key={skill.name} className={styles.skillCard}>
                            <IconComponent
                              className={styles.skillCardIcon}
                              style={iconColor ? { color: iconColor } : undefined}
                            />
                            <span className={styles.skillCardLabel}>{skill.name}</span>
                          </div>
                        ) : (
                          <div key={skill.name} className={styles.skillCard}>
                            <span className={styles.skillCardLabel}>{skill.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <p className={styles.empty}>No skills available.</p>
        )}
      </div>
    </section>
  );
}

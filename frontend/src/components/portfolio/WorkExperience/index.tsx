'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './style.module.scss';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/context';
import { getExperience, type WorkExperience } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';
import { usePortfolioVisit } from '@/components/providers';

type Chapter = { title: string; company: string; period: string; description: string; achievements: string[] };

function ExperienceChapters({ entries }: { entries: Chapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [complete, setComplete] = useState(false);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const update = () => {
    const nodes = ref.current?.querySelectorAll<HTMLElement>('[data-experience-chapter]');
    if (!nodes?.length) return;
    let selected = 0;
    nodes.forEach((node, index) => { if (node.getBoundingClientRect().top < window.innerHeight * 0.55) selected = index; });
    setActive(selected);
    if (nodes[nodes.length - 1].getBoundingClientRect().bottom < window.innerHeight * 0.9) setComplete(true);
  };
  useMotionValueEvent(scrollY, 'change', update);
  useEffect(update, [entries.length]);
  if (!entries.length) return null;
  const current = entries[active] || entries[0];
  return <div className={styles.chapters} ref={ref}>
    <aside className={styles.chapterPanel} aria-hidden="true">
      <div className={styles.counterFrame}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={active} className={styles.chapterNumber}
            initial={{ y: reduced ? 0 : '85%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: reduced ? 0 : '-85%', opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}>{String(active + 1).padStart(2, '0')}</motion.span>
        </AnimatePresence>
        <span className={styles.chapterTotal}>/ {String(entries.length).padStart(2, '0')}</span>
      </div>
      <div className={styles.chapterBars}>{entries.map((_, i) => <span key={i} className={i <= active ? styles.barFilled : ''} />)}</div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={active} initial={{ opacity: 0, y: reduced ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -10 }} transition={{ duration: reduced ? 0 : 0.25 }}>
          <p className={styles.panelCompany}>{current.company}</p>
          <p className={styles.panelRole}>{current.title}</p>
          <span className={styles.panelPeriod}>{current.period}</span>
        </motion.div>
      </AnimatePresence>
    </aside>
    <div className={styles.chapterList}>
      {entries.map((entry, index) => <motion.article key={`${entry.company}-${index}`} data-experience-chapter className={styles.chapter}
        animate={{ opacity: reduced || complete || index === active ? 1 : 0.28 }} transition={{ duration: reduced ? 0 : 0.6 }}>
        <div className={styles.chapterMeta}><span>{String(index + 1).padStart(2, '0')}</span><span>{entry.period}</span></div>
        <h3>{entry.title}</h3><h4>{entry.company}</h4>
        {entry.description && <p>{entry.description}</p>}
        {entry.achievements.length > 0 && <ul>{entry.achievements.map((text, i) => <li key={i}><span aria-hidden="true">↗</span>{text}</li>)}</ul>}
      </motion.article>)}
    </div>
  </div>;
}

function formatDate(dateString: string, locale: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
}

export default function WorkExperience() {
  const { hasVisitedHome } = usePortfolioVisit();
  const { locale } = useLanguage();
  const { t } = useTranslations();
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
        ? `${formatDate(exp.startDate, locale)} - ${t('experience.present')}`
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
          <h2 className={styles.title}>{t('experience.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.loading')}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="experience" className={styles.experience}>
        <div className={styles.container}>
          <h2 className={styles.title}>{t('experience.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.error')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" className={styles.experience}>
      <div className={styles.container}>
        <motion.div
          initial={hasVisitedHome ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>{t('experience.title')}</h2>
          <p className={styles.subtitle}>
            {t('experience.subtitle')}
          </p>
        </motion.div>

        <ExperienceChapters entries={experienceData} />
      </div>
    </section>
  );
}

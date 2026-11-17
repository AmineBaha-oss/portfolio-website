'use client';

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import styles from './style.module.scss';
import { motion, useScroll, useSpring, useReducedMotion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/context';
import { getEducation, type Education } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';
import { usePortfolioVisit } from '@/components/providers';

type JourneyEntry = { degree: string; institution: string; period: string; description: string; achievements: string[] };
let journeyFinished = false;

function Journey({ entries, skip }: { entries: JourneyEntry[]; skip: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [geometry, setGeometry] = useState({ height: 1, anchors: [] as number[], path: '' });
  const [finished, setFinished] = useState(skip || journeyFinished);
  const [markerY, setMarkerY] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 55%', 'end 55%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 32 });
  const dotX = useMotionValue(80);
  const dotY = useMotionValue(0);
  const dotOpacity = useMotionValue(1);
  useEffect(() => { if (skip) setFinished(true); }, [skip]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const anchors = Array.from(el.querySelectorAll<HTMLElement>('[data-education-stop]')).map(node => {
        const milestone = node.firstElementChild as HTMLElement;
        return node.offsetTop + milestone.offsetTop + milestone.offsetHeight / 2;
      });
      const height = el.offsetHeight;
      let path = 'M 80 0';
      let previous = 0;
      [...anchors, height].forEach((y, index) => {
        const bend = index % 2 ? 150 : 10;
        path += ` C ${bend} ${previous + (y - previous) * 0.4}, ${bend} ${previous + (y - previous) * 0.65}, 80 ${y}`;
        previous = y;
      });
      setGeometry({ height, anchors, path });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [entries.length]);

  useMotionValueEvent(progress, 'change', value => {
    if (finished || !pathRef.current) return;
    const point = pathRef.current.getPointAtLength(Math.max(0, Math.min(1, value)) * pathRef.current.getTotalLength());
    dotX.set(point.x);
    dotY.set(point.y);
    const nearest = Math.min(...geometry.anchors.map(y => Math.hypot(point.x - 80, point.y - y)));
    const fade = Math.max(0, Math.min(1, (nearest - 75) / 40));
    dotOpacity.set(fade * fade * (3 - 2 * fade));
    setMarkerY(point.y);
    if (value >= 0.995) { journeyFinished = true; setFinished(true); }
  });

  const activeIndex = geometry.anchors.reduce((active, y, index) => markerY >= y - 100 ? index : active, 0);
  return <div ref={ref} className={`${styles.educationGrid} ${finished ? styles.finished : ''}`}>
    <svg className={styles.road} viewBox={`0 0 160 ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true">
      <path ref={pathRef} d={geometry.path} className={styles.roadTrack} />
      <motion.path d={geometry.path} className={styles.roadInk} style={{ pathLength: finished ? 1 : progress }} />
      {!finished && <motion.g style={{ opacity: dotOpacity }}>
        <motion.circle cx={dotX} cy={dotY} r="35" className={styles.travelerHalo} />
        <motion.circle cx={dotX} cy={dotY} r="19" className={styles.travelerRing} />
        <motion.circle cx={dotX} cy={dotY} r="8" className={styles.traveler} />
      </motion.g>}
    </svg>
    {entries.map((edu, index) => {
      const arrived = finished || markerY >= (geometry.anchors[index] ?? Infinity) - 100;
      const active = !finished && activeIndex === index && arrived;
      return <article key={`${edu.institution}-${index}`} data-education-stop
        className={`${styles.educationCard} ${arrived ? styles.arrived : ''} ${active ? styles.active : ''}`}>
        <span className={styles.milestone} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <motion.div className={styles.cardTop} animate={{ opacity: arrived ? 1 : 0.2, y: arrived ? 0 : 25 }} transition={{ duration: 0.55 }}>
          <span className={styles.year} aria-hidden="true">{edu.period.match(/\d{4}/)?.[0]}</span>
          <span className={styles.period}>{edu.period}</span>
        </motion.div>
        <motion.div className={styles.cardBody}
          animate={{ opacity: arrived ? 1 : 0.15, y: arrived ? 0 : 45, filter: arrived ? 'blur(0px)' : 'blur(3px)' }}
          transition={{ duration: skip ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <span className={styles.chapter}>{String(index + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}</span>
          <h3>{edu.degree}</h3><h4>{edu.institution}</h4>
          {edu.description && <p>{edu.description}</p>}
          {edu.achievements.length > 0 && <ul>{edu.achievements.map((text, i) => <li key={i}>{text}</li>)}</ul>}
        </motion.div>
      </article>;
    })}
    <div className={styles.endMark} aria-hidden="true"><span>{finished ? '✓' : '↓'}</span></div>
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

export default function Education() {
  const { locale } = useLanguage();
  const { hasVisitedHome } = usePortfolioVisit();
  const returning = useRef(hasVisitedHome);
  const reducedMotion = useReducedMotion();
  const skipReveal = returning.current || !!reducedMotion;
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
          initial={skipReveal ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.title}>{t('education.title')}</h2>
          <p className={styles.subtitle}>{t('education.subtitle')}</p>
        </motion.div>

        <Journey entries={educationData} skip={skipReveal} />
      </div>
    </section>
  );
}

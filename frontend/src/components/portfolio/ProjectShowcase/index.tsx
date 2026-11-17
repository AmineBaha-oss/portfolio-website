'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getProjects, type Project } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';
import { DEFAULT_BACKGROUND } from '@/lib/utils/cdn-url';
import styles from './style.module.scss';
import { usePortfolioVisit } from '@/components/providers';

const ease = [0.22, 1, 0.36, 1] as const;
const detailReveal = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } } };

function ProjectScene({ project, index, skip, locale, label }: { project: Project; index: number; skip: boolean; locale: string; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const movement = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const y = useSpring(movement, { stiffness: 120, damping: 30 });
  return <motion.article ref={ref} className={`${styles.project} ${styles.open}`}
    initial={skip ? 'visible' : 'hidden'} whileInView="visible" viewport={{ once: true, amount: 0.12 }}
    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}>
    <motion.div className={styles.row} variants={detailReveal}>
      <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
      <Link href={`/projects/${project.id}`} className={styles.title}>{project.title}</Link>
      <Link href={`/projects/${project.id}`} className={styles.toggle} aria-label={`${label}: ${project.title}`}>↗</Link>
    </motion.div>
    <div className={styles.preview}>
      <Link href={`/projects/${project.id}`} className={styles.visual} style={{ backgroundColor: project.color || '#292b2e' }} aria-label={`${label}: ${project.title}`}>
        <motion.div className={styles.artwork} style={{ y: skip ? 0 : y }}>
          <motion.div className={styles.imageZoom} variants={{ hidden: { scale: 1.15 }, visible: { scale: 1, transition: { duration: 1.3, ease } } }}>
            <Image src={project.imageUrl || DEFAULT_BACKGROUND} alt={project.title} fill sizes="(max-width: 768px) 90vw, 60vw" unoptimized style={{ objectFit: 'cover' }} />
          </motion.div>
        </motion.div>
        <motion.div className={styles.imageCurtain} aria-hidden="true"
          variants={{ hidden: { x: '0%' }, visible: { x: '101%', transition: { duration: 0.95, ease } } }} />
        <motion.span className={styles.imageArrow} aria-hidden="true" variants={detailReveal}>↗</motion.span>
      </Link>
      <motion.div className={styles.details} variants={{ hidden: {}, visible: { transition: { delayChildren: 0.25, staggerChildren: 0.13 } } }}>
        <motion.span variants={detailReveal} className={styles.label}>{locale === 'fr' ? 'Le projet' : 'Inside the project'}</motion.span>
        <motion.p variants={detailReveal}>{project.description}</motion.p>
        <motion.div className={styles.tags} variants={detailReveal}>{project.technologies.map(tech => <span key={tech}>{tech}</span>)}</motion.div>
        <motion.div className={styles.exploreWrap} variants={detailReveal}><Link href={`/projects/${project.id}`} className={styles.explore}>{label}<span aria-hidden="true">↗</span></Link></motion.div>
      </motion.div>
    </div>
  </motion.article>;
}

export default function ProjectShowcase({ featured = false }: { featured?: boolean }) {
  const { locale, t } = useTranslations();
  const reduced = useReducedMotion();
  const { hasVisitedHome } = usePortfolioVisit();
  const returning = useRef(hasVisitedHome);
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getProjects(locale, featured).then(({ projects: data }) => {
      if (cancelled) return;
      const selected = featured ? data.slice(0, 4) : data;
      setProjects(selected); setStatus('ready');
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [locale, featured]);
  return <section className={styles.showcase}>
    <header className={styles.heading}>
      {!featured && <Link href="/#projects" className={styles.back}>← {t('common.back')}</Link>}
      {featured ? <h2>{t('projects.title')}</h2> : <h1>{t('projects.allProjects')}</h1>}
      <p>{t(featured ? 'projects.subtitle' : 'projects.allProjectsSubtitle')}</p>
    </header>
    {status !== 'ready' && <p role="status">{t(status === 'loading' ? 'dashboard.loading' : 'dashboard.error')}</p>}
    <div className={styles.list}>
      {projects.map((project, index) => <ProjectScene key={project.id} project={project} index={index} skip={!!reduced || returning.current} locale={locale} label={t('projects.viewProject')} />)}
    </div>
    {status === 'ready' && projects.length === 0 && <p>{t('dashboard.noData')}</p>}
    {featured && <Link href="/projects" className={styles.all}>{t('projects.moreWork')} <span aria-hidden="true">↗</span></Link>}
  </section>;
}

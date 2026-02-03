'use client';

import styles from './page.module.scss';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { getProjects, type Project } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';

const scaleAnimation = {
  initial: { scale: 0, x: "-50%", y: "-50%" },
  enter: { scale: 1, x: "-50%", y: "-50%", transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] } },
  closed: { scale: 0, x: "-50%", y: "-50%", transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] } }
};

export default function ProjectsPage() {
  const { locale } = useLanguage();
  const { t } = useTranslations();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState({ active: false, index: 0 });
  const { active, index } = modal;
  const modalContainer = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const cursorLabel = useRef<HTMLDivElement>(null);

  const xMoveContainer = useRef<((value: number) => void) | null>(null);
  const yMoveContainer = useRef<((value: number) => void) | null>(null);
  const xMoveCursor = useRef<((value: number) => void) | null>(null);
  const yMoveCursor = useRef<((value: number) => void) | null>(null);
  const xMoveCursorLabel = useRef<((value: number) => void) | null>(null);
  const yMoveCursorLabel = useRef<((value: number) => void) | null>(null);

  // Force scroll to top on mount/navigation
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scroll(0, 0);
    
    const timeout1 = setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scroll(0, 0);
    }, 10);

    const timeout2 = setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scroll(0, 0);
    }, 50);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProjects(locale, false);
        setProjects(response.projects);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [locale]);

  useEffect(() => {
    if (!modalContainer.current || !cursor.current || !cursorLabel.current) {
      return;
    }

    xMoveContainer.current = gsap.quickTo(modalContainer.current, "left", { duration: 0.8, ease: "power3" });
    yMoveContainer.current = gsap.quickTo(modalContainer.current, "top", { duration: 0.8, ease: "power3" });
    xMoveCursor.current = gsap.quickTo(cursor.current, "left", { duration: 0.5, ease: "power3" });
    yMoveCursor.current = gsap.quickTo(cursor.current, "top", { duration: 0.5, ease: "power3" });
    xMoveCursorLabel.current = gsap.quickTo(cursorLabel.current, "left", { duration: 0.45, ease: "power3" });
    yMoveCursorLabel.current = gsap.quickTo(cursorLabel.current, "top", { duration: 0.45, ease: "power3" });
  }, [projects]);

  const moveItems = (x: number, y: number) => {
    if (xMoveContainer.current) xMoveContainer.current(x);
    if (yMoveContainer.current) yMoveContainer.current(y);
    if (xMoveCursor.current) xMoveCursor.current(x);
    if (yMoveCursor.current) yMoveCursor.current(y);
    if (xMoveCursorLabel.current) xMoveCursorLabel.current(x);
    if (yMoveCursorLabel.current) yMoveCursorLabel.current(y);
  };

  const manageModal = (active: boolean, index: number, x: number, y: number) => {
    moveItems(x, y);
    setModal({ active, index });
  };

  if (loading) {
    return (
      <main className={styles.projects}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('projects.title')}</h1>
          <p className={styles.subtitle}>{t('dashboard.loading')}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.projects}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('projects.title')}</h1>
          <p className={styles.subtitle}>{t('dashboard.error')}</p>
        </div>
      </main>
    );
  }

  return (
    <main onMouseMove={(e) => { moveItems(e.clientX, e.clientY) }} className={styles.projects}>
      <div className={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/#projects" scroll={false} className={styles.backLink}>← {t('common.back')}</Link>
          <h1 className={styles.title}>{t('projects.allProjects')}</h1>
          <p className={styles.subtitle}>{t('projects.allProjectsSubtitle')}</p>
        </motion.div>
      </div>

      <div className={styles.body}>
        {projects.length > 0 ? projects.map((project, index) => (
          <Link href={`/projects/${project.id}`} key={project.id} scroll={false} onClick={() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            window.scroll(0, 0);
          }}>
            <motion.div
              className={styles.project}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={(e) => { manageModal(true, index, e.clientX, e.clientY) }}
              onMouseLeave={(e) => { manageModal(false, index, e.clientX, e.clientY) }}
            >
              <h2>{project.title}</h2>
              <p>{project.description || t('projects.designDevelopment')}</p>
            </motion.div>
          </Link>
        )) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
            {t('dashboard.noData')}
          </p>
        )}
      </div>

      <>
        <motion.div ref={modalContainer} variants={scaleAnimation as any} initial="initial" animate={active ? "enter" : "closed"} className={styles.modalContainer}>
          <div style={{ top: index * -100 + "%" }} className={styles.modalSlider}>
            {projects.map((project, index) => (
              <div className={styles.modal} style={{ backgroundColor: project.color || "#2a2b2c" }} key={`modal_${index}`}>
                <Image
                  src={project.imageUrl || "https://portfolio-app.nyc3.digitaloceanspaces.com/images/background.jpg"}
                  width={300}
                  height={0}
                  alt={project.title}
                />
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div ref={cursor} className={styles.cursor} variants={scaleAnimation as any} initial="initial" animate={active ? "enter" : "closed"}></motion.div>
        <motion.div ref={cursorLabel} className={styles.cursorLabel} variants={scaleAnimation as any} initial="initial" animate={active ? "enter" : "closed"}>View</motion.div>
      </>
    </main>
  );
}

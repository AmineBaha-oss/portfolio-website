'use client';
import styles from './style.module.scss'
import { useState, useEffect, useRef } from 'react';
import Project from './components/project';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Image from 'next/image';
import Rounded from '@/common/RoundedButton';
import { useLanguage } from '@/lib/i18n/context';
import { getProjects } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';
import Link from 'next/link';
import { DEFAULT_BACKGROUND } from '@/lib/utils/cdn-url';

const scaleAnimation = {
    initial: {scale: 0, x:"-50%", y:"-50%"},
    enter: {scale: 1, x:"-50%", y:"-50%", transition: {duration: 0.4, ease: [0.76, 0, 0.24, 1] as any} as any},
    closed: {scale: 0, x:"-50%", y:"-50%", transition: {duration: 0.4, ease: [0.32, 0, 0.67, 0] as any} as any}
} as any

export default function Home() {
  const { locale } = useLanguage();
  const { t } = useTranslations();
  const [projects, setProjects] = useState<Array<{ id: string; title: string; description: string; src: string; color: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState({active: false, index: 0})
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProjects(locale, true);
        const mappedProjects = response.projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          src: project.imageUrl || DEFAULT_BACKGROUND,
          color: project.color || "#2a2b2c"
        }));
        setProjects(mappedProjects);
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

  useEffect( () => {
    // Wait for refs to be available
    if (!modalContainer.current || !cursor.current || !cursorLabel.current) {
      return;
    }
    
    //Move Container
    xMoveContainer.current = gsap.quickTo(modalContainer.current, "left", {duration: 0.8, ease: "power3"})
    yMoveContainer.current = gsap.quickTo(modalContainer.current, "top", {duration: 0.8, ease: "power3"})
    //Move cursor
    xMoveCursor.current = gsap.quickTo(cursor.current, "left", {duration: 0.5, ease: "power3"})
    yMoveCursor.current = gsap.quickTo(cursor.current, "top", {duration: 0.5, ease: "power3"})
    //Move cursor label
    xMoveCursorLabel.current = gsap.quickTo(cursorLabel.current, "left", {duration: 0.45, ease: "power3"})
    yMoveCursorLabel.current = gsap.quickTo(cursorLabel.current, "top", {duration: 0.45, ease: "power3"})
  }, [projects]) // Re-run when projects are loaded

  const moveItems = (x: number, y: number) => {
    if (xMoveContainer.current) xMoveContainer.current(x);
    if (yMoveContainer.current) yMoveContainer.current(y);
    if (xMoveCursor.current) xMoveCursor.current(x);
    if (yMoveCursor.current) yMoveCursor.current(y);
    if (xMoveCursorLabel.current) xMoveCursorLabel.current(x);
    if (yMoveCursorLabel.current) yMoveCursorLabel.current(y);
  }
  const manageModal = (active: boolean, index: number, x: number, y: number) => {
    moveItems(x, y)
    setModal({active, index})
  }

  if (loading) {
    return (
      <main className={styles.projects}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('projects.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.loading')}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.projects}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('projects.title')}</h2>
          <p className={styles.subtitle}>{t('dashboard.error')}</p>
        </div>
      </main>
    );
  }

  return (
  <main id="projects" onMouseMove={(e) => {moveItems(e.clientX, e.clientY)}} className={styles.projects}>
    <div className={styles.header}>
      <h2 className={styles.title}>{t('projects.title')}</h2>
      <p className={styles.subtitle}>{t('projects.subtitle')}</p>
    </div>
    <div className={styles.body}>
      {
        projects.length > 0 ? projects.slice(0, 4).map( (project, index) => {
          return <Project index={index} title={project.title} description={project.description} projectId={project.id} manageModal={manageModal} key={index}/>
        }) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
            {t('dashboard.noData')}
          </p>
        )
      }
    </div>
    <Link href="/projects" scroll={false} onClick={(e) => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scroll(0, 0);
      setTimeout(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scroll(0, 0);
      }, 10);
    }}>
      <Rounded backgroundColor="#2a2b2c">
        <p>{t('projects.moreWork')}</p>
      </Rounded>
    </Link>
    <>
        <motion.div ref={modalContainer} variants={scaleAnimation} initial="initial" animate={active ? "enter" : "closed"} className={styles.modalContainer}>
            <div style={{top: index * -100 + "%"}} className={styles.modalSlider}>
            {
                projects.map( (project, index) => {
                const { src, color } = project
                return <div className={styles.modal} style={{backgroundColor: color}} key={`modal_${index}`}>
                    <Image 
                    src={src}
                    width={300}
                    height={300}
                    alt={project.title || "project image"}
                    style={{ objectFit: 'cover' }}
                    unoptimized
                    />
                </div>
                })
            }
            </div>
        </motion.div>
        <motion.div ref={cursor} className={styles.cursor} variants={scaleAnimation} initial="initial" animate={active ? "enter" : "closed"}></motion.div>
        <motion.div ref={cursorLabel} className={styles.cursorLabel} variants={scaleAnimation} initial="initial" animate={active ? "enter" : "closed"}>View</motion.div>
    </>
  </main>
  )
}

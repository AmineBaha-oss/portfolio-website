'use client';
import styles from './style.module.scss'
import { useState, useEffect, useRef } from 'react';
import Project from './components/project';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/context';
import { getHobbies, type Hobby } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';

const scaleAnimation = {
    initial: {scale: 0, x:"-50%", y:"-50%"},
    enter: {scale: 1, x:"-50%", y:"-50%", transition: {duration: 0.4, ease: [0.76, 0, 0.24, 1] as any} as any},
    closed: {scale: 0, x:"-50%", y:"-50%", transition: {duration: 0.4, ease: [0.32, 0, 0.67, 0] as any} as any}
} as any

export default function Home() {
  const { locale } = useLanguage();
  const { t } = useTranslations();
  const [hobbies, setHobbies] = useState<Array<{ title: string; description: string; src: string; color: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState({active: false, index: 0})
  const { active, index } = modal;
  const modalContainer = useRef(null);
  const cursor = useRef(null);
  const cursorLabel = useRef(null);

  const xMoveContainer = useRef<any>(null);
  const yMoveContainer = useRef<any>(null);
  const xMoveCursor = useRef<any>(null);
  const yMoveCursor = useRef<any>(null);
  const xMoveCursorLabel = useRef<any>(null);
  const yMoveCursorLabel = useRef<any>(null);

  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getHobbies(locale);
        const mappedHobbies = response.hobbies.map(hobby => ({
          title: hobby.title,
          description: hobby.description || '',
          src: hobby.imageUrl || "background.jpg",
          color: hobby.color || "#2a2b2c"
        }));
        setHobbies(mappedHobbies);
      } catch (err: any) {
        console.error('Error fetching hobbies:', err);
        setError(err.message);
        setHobbies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHobbies();
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
  }, [hobbies]) // Re-run when hobbies are loaded

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
        <div className={styles.body}>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
            {t('dashboard.loading')}
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.projects}>
        <div className={styles.body}>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
            {t('dashboard.error')}
          </p>
        </div>
      </main>
    );
  }

  return (
  <main onMouseMove={(e) => {moveItems(e.clientX, e.clientY)}} className={styles.projects}>
    <div className={styles.body}>
      {
        hobbies.length > 0 ? hobbies.map( (hobby, index) => {
          return <Project index={index} title={hobby.title} description={hobby.description} manageModal={manageModal} key={index}/>
        }) : (
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', padding: '2rem' }}>
            No hobbies available.
          </p>
        )
      }
    </div>
    <>
        <motion.div ref={modalContainer} variants={scaleAnimation} initial="initial" animate={active ? "enter" : "closed"} className={styles.modalContainer}>
            <div style={{top: index * -100 + "%"}} className={styles.modalSlider}>
            {
                hobbies.map( (project, index) => {
                const { src, color } = project
                return <div className={styles.modal} style={{backgroundColor: color}} key={`modal_${index}`}>
                    <Image 
                    src={`/images/${src}`}
                    width={300}
                    height={0}
                    alt="image"
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

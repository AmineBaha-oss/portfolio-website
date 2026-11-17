'use client'
import Image from 'next/image'
import styles from './style.module.scss'
import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { slideUp } from './animation';
import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n/hooks';
import { DEFAULT_BACKGROUND } from '@/lib/utils/cdn-url';
import { usePortfolioVisit } from '@/components/providers';

let lastMarqueeXPercent = 0;
let lastMarqueeDirection = -1;

export default function Home() {
  const { t, locale } = useTranslations();
  const firstText = useRef(null);
  const secondText = useRef(null);
  const slider = useRef(null);
  const xPercent = useRef(lastMarqueeXPercent);
  const direction = useRef(lastMarqueeDirection);
  const animationFrame = useRef<number | null>(null);
  const { hasVisitedHome } = usePortfolioVisit();

  useLayoutEffect( () => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => gsap.to(slider.current, {
      scrollTrigger: {
        trigger: document.documentElement,
        scrub: 0.25,
        start: 0,
        end: window.innerHeight,
        onUpdate: e => direction.current = e.direction * -1
      },
      x: "-500px",
    }));

    const animate = () => {
      if (xPercent.current < -100) xPercent.current = 0;
      else if (xPercent.current > 0) xPercent.current = -100;
      gsap.set(firstText.current, { xPercent: xPercent.current });
      gsap.set(secondText.current, { xPercent: xPercent.current });
      xPercent.current += 0.1 * direction.current;
      lastMarqueeXPercent = xPercent.current;
      lastMarqueeDirection = direction.current;
      animationFrame.current = requestAnimationFrame(animate);
    };
    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
      context.revert();
    };
  }, [])

  return (
    <motion.main variants={slideUp} initial={hasVisitedHome ? 'enter' : 'initial'} animate="enter" className={styles.landing}>
      <Image 
        src={DEFAULT_BACKGROUND}
        fill={true}
        alt="background"
      />
      
      {/* Animated Name at Top */}
      <motion.div 
        className={styles.nameContainer}
        initial={hasVisitedHome ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <h1 className={styles.animatedName}>
          {'AMINE BAHA'.split('').map((char, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{
                duration: 0.5,
                delay: hasVisitedHome ? 0 : 3.5 + index * 0.08,
                ease: [0.6, -0.05, 0.01, 0.99]
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>
      </motion.div>

      <div className={styles.sliderContainer}>
        <div ref={slider} className={styles.slider}>
          <p ref={firstText}>{t('landing.role')} -</p>
          <p ref={secondText}>{t('landing.role')} -</p>
        </div>
      </div>
      <div data-scroll data-scroll-speed={0.1} className={styles.description}>
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 8.5C8.27614 8.5 8.5 8.27614 8.5 8L8.5 3.5C8.5 3.22386 8.27614 3 8 3C7.72386 3 7.5 3.22386 7.5 3.5V7.5H3.5C3.22386 7.5 3 7.72386 3 8C3 8.27614 3.22386 8.5 3.5 8.5L8 8.5ZM0.646447 1.35355L7.64645 8.35355L8.35355 7.64645L1.35355 0.646447L0.646447 1.35355Z" fill="white"/>
        </svg>
        <p>{locale === 'fr' ? 'Informatique' : 'Computer Science'}</p>
        <p>{locale === 'fr' ? 'Étudiant & Développeur' : 'Student & Developer'}</p>
      </div>
    </motion.main>
  )
}

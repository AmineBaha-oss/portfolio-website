'use client';

import styles from './page.module.scss';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from '../components/portfolio/Preloader';
import Navigation from '../components/portfolio/Navigation';
import Landing from '../components/portfolio/Landing';
import Skills from '../components/portfolio/Skills';
import Projects from '../components/portfolio/Projects';
import WorkExperience from '../components/portfolio/WorkExperience';
import Education from '../components/portfolio/Education';
import Resume from '../components/portfolio/Resume';
import Hobbies from '../components/portfolio/Hobbies';
import Testimonials from '../components/portfolio/Testimonials';
import Description from '../components/portfolio/Description';
import SlidingImages from '../components/portfolio/SlidingImages';
import Contact from '../components/portfolio/Contact';

export default function HomePage() {
  // Initialize isLoading based on whether there's a hash in the URL
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.location.hash;
    }
    return true;
  });
  
  // Track if we should show preloader at all
  const [showPreloader, setShowPreloader] = useState(() => {
    if (typeof window !== 'undefined') {
      return !window.location.hash;
    }
    return true;
  });

  useEffect(() => {
    // Check if navigating to a hash (like #projects)
    const hasHash = window.location.hash;
    
    // Skip preloader if coming from a hash link
    if (hasHash) {
      setIsLoading(false);
      setShowPreloader(false);
      document.body.style.cursor = 'default';
      
      // Smooth scroll to the hash
      setTimeout(() => {
        const element = document.querySelector(hasHash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    (async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      
      const locomotiveScroll = new LocomotiveScroll({
        lenisOptions: {
          wrapper: window,
          content: document.documentElement,
          lerp: 0.1,
          duration: 1.2,
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        },
      });

      setTimeout(() => {
        setIsLoading(false);
        document.body.style.cursor = 'default';
        window.scrollTo(0, 0);
      }, 2000);

      return () => {
        locomotiveScroll.destroy();
      };
    })();
  }, []);

  return (
    <main className={styles.main}>
      {showPreloader && (
        <AnimatePresence mode='wait'>
          {isLoading && <Preloader />}
        </AnimatePresence>
      )}
      
      {!isLoading && <Navigation />}
      
      <div id="home">
        <Landing />
      </div>
      <Description />
      <div id="skills">
        <Skills />
      </div>
      <div id="projects">
        <Projects />
      </div>
      <div id="experience">
        <WorkExperience />
      </div>
      <div id="education">
        <Education />
      </div>
      <div id="resume">
        <Resume />
      </div>
      <div id="hobbies">
        <Hobbies />
      </div>
      <div id="testimonials">
        <Testimonials />
      </div>
      <SlidingImages />
      <div id="contact">
        <Contact />
      </div>
    </main>
  );
}

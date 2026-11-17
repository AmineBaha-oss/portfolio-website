'use client';

import styles from './page.module.scss';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from '../components/portfolio/Preloader';
import Navigation from '../components/portfolio/Navigation';
import Landing from '../components/portfolio/Landing';
import Skills from '../components/portfolio/Skills';
import Projects from '../components/portfolio/Projects';
import Activities from '../components/portfolio/Activities';
import WorkExperience from '../components/portfolio/WorkExperience';
import Education from '../components/portfolio/Education';
import Resume from '../components/portfolio/Resume';
import Hobbies from '../components/portfolio/Hobbies';
import Testimonials from '../components/portfolio/Testimonials';
import Description from '../components/portfolio/Description';
import SlidingImages from '../components/portfolio/SlidingImages';
import Contact from '../components/portfolio/Contact';
import { useDataRefresh } from '@/lib/hooks/useDataRefresh';
import { usePortfolioVisit } from '@/components/providers';

export default function HomePage() {
  const { hasVisitedHome, markHomeVisited } = usePortfolioVisit();
  const shouldPlayIntro = useRef(!hasVisitedHome);
  // Enable automatic data refresh
  useDataRefresh();
  
  // Play the intro once per document; provider state survives route changes.
  const [isLoading, setIsLoading] = useState(() => !hasVisitedHome);
  const [showPreloader, setShowPreloader] = useState(() => !hasVisitedHome);

  useEffect(() => {
    // Keep the intro for a fresh page load, but skip it when the App Router
    // restores this page after visiting a project and pressing Back.
    const hasHash = window.location.hash;
    if (!shouldPlayIntro.current || hasHash) {
      markHomeVisited();
      setIsLoading(false);
      setShowPreloader(false);
      document.body.style.cursor = 'default';
      return;
    }

    markHomeVisited();
    const timeout = window.setTimeout(() => {
      setIsLoading(false);
      document.body.style.cursor = 'default';
      window.scrollTo(0, 0);
    }, 2000);

    return () => window.clearTimeout(timeout);
    // This runs once per document. Provider state survives client navigation,
    // so a return visit does not restart the introduction timer.
  }, [markHomeVisited]);

  return (
    <main className={styles.main}>
      {showPreloader && (
        <AnimatePresence mode='wait'>
          {isLoading && <Preloader />}
        </AnimatePresence>
      )}
      
      <div style={{ opacity: isLoading ? 0 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.3s ease' }}>
        <Navigation />
      </div>
      
      <div id="home">
        <Landing />
      </div>
      <Description />
      <div id="skills" style={{ overflow: 'hidden', minHeight: '100vh' }}>
        <Skills />
      </div>
      <div id="projects">
        <Projects />
      </div>
      <Activities />
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

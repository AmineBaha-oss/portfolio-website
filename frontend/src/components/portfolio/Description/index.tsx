import styles from './style.module.scss';
import { useInView, motion } from 'framer-motion';
import { useRef } from 'react';
import { slideUp, opacity } from './animation';
import Rounded from '@/common/RoundedButton';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Description() {
    const { t, locale } = useTranslations();
    const description = useRef(null);
    const isInView = useInView(description);

    const mainPhrase = locale === 'fr' 
        ? "Étudiant en informatique motivé avec une solide base en développement logiciel et en travail d'équipe. Reconnu pour une communication claire, une exécution fiable et un état d'esprit axé sur les résultats."
        : "Motivated Computer Science student with a strong foundation in software development and teamwork. Known for clear communication, dependable execution, and a results-first mindset.";

    const secondaryPhrase = locale === 'fr'
        ? "Rapide à apprendre et prêt à contribuer à des projets complexes dès le premier jour, avec une expérience en Spring Boot, React, Docker et des pratiques de développement modernes."
        : "Quick to learn and ready to contribute to complex projects from day one, with experience in Spring Boot, React, Docker, and modern development practices.";

    return (
        <div ref={description} className={styles.description}>
            <div className={styles.body}>
                <p>
                {
                    mainPhrase.split(" ").map( (word, index) => {
                        return <span key={index} className={styles.mask}><motion.span variants={slideUp} custom={index} animate={isInView ? "open" : "closed"} key={index}>{word}</motion.span></span>
                    })
                }
                </p>
                <motion.p variants={opacity} animate={isInView ? "open" : "closed"}>
                    {secondaryPhrase}
                </motion.p>
                <div data-scroll data-scroll-speed={0.1}>
                    <Rounded backgroundColor="#2a2b2c" className={styles.button}>
                        <p>{t('about.title')}</p>
                    </Rounded>
                </div>
            </div>
        </div>
    )
}

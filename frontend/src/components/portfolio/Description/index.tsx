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
        ? "Développeur full-stack et étudiant en informatique et science des données à Concordia. Je crée des applications web, des outils de bureau et des expériences interactives fondées sur les données."
        : "Full-stack developer studying computer science and data science at Concordia. I build web applications, desktop tools and interactive experiences grounded in data.";
    const secondaryPhrase = locale === 'fr'
        ? "De paiements Stripe et pipelines Gemini AI en production à la recherche locale en Rust et à une simulation lunaire 3D, mes projets relient logiciel, données et besoins concrets."
        : "From production Stripe payments and Gemini AI pipelines to local search in Rust and a 3D lunar simulation, my work connects software, data and practical needs.";

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

import styles from './style.module.scss';
import { useInView, motion } from 'framer-motion';
import { useRef } from 'react';
import { slideUp, opacity } from './animation';
import Rounded from '@/common/RoundedButton';
export default function Description() {

    const phrase = "Motivated Computer Science student with a strong foundation in software development and teamwork. Known for clear communication, dependable execution, and a results-first mindset.";
    const description = useRef(null);
    const isInView = useInView(description)
    return (
        <div ref={description} className={styles.description}>
            <div className={styles.body}>
                <p>
                {
                    phrase.split(" ").map( (word, index) => {
                        return <span key={index} className={styles.mask}><motion.span variants={slideUp} custom={index} animate={isInView ? "open" : "closed"} key={index}>{word}</motion.span></span>
                    })
                }
                </p>
                <motion.p variants={opacity} animate={isInView ? "open" : "closed"}>Quick to learn and ready to contribute to complex projects from day one, with experience in Spring Boot, React, Docker, and modern development practices.</motion.p>
                <div data-scroll data-scroll-speed={0.1}>
                    <Rounded backgroundColor="#2a2b2c" className={styles.button}>
                        <p>About me</p>
                    </Rounded>
                </div>
            </div>
        </div>
    )
}

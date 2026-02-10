'use client';

import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import styles from './style.module.scss';
import Image from 'next/image';
import { getProjects, getHobbies } from '@/lib/api/client';
import { useLanguage } from '@/lib/i18n/context';
import { DEFAULT_BACKGROUND } from '@/lib/utils/cdn-url';

const defaultColors = [
    "#e3e5e7", "#d6d7dc", "#e3e3e3", "#21242b",
    "#d4e3ec", "#e5e0e1", "#d7d4cf", "#e1dad6"
];

export default function SlidingImages() {
    const { locale } = useLanguage();
    const [slider1, setSlider1] = useState([
        { color: defaultColors[0], src: DEFAULT_BACKGROUND },
        { color: defaultColors[1], src: DEFAULT_BACKGROUND },
        { color: defaultColors[2], src: DEFAULT_BACKGROUND },
        { color: defaultColors[3], src: DEFAULT_BACKGROUND }
    ]);
    const [slider2, setSlider2] = useState([
        { color: defaultColors[4], src: DEFAULT_BACKGROUND },
        { color: defaultColors[5], src: DEFAULT_BACKGROUND },
        { color: defaultColors[6], src: DEFAULT_BACKGROUND },
        { color: defaultColors[7], src: DEFAULT_BACKGROUND }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                setLoading(true);
                const [projectsData, hobbiesData] = await Promise.all([
                    getProjects(locale, false),
                    getHobbies(locale)
                ]);

                const projects = projectsData.projects;
                const hobbies = hobbiesData.hobbies;

                // Build 8 slots alternating: P1, H1, P2, H2, P3, H3, P4, H4 (first 4 projects + first 4 hobbies)
                const buildSlot = (i) => {
                    if (i % 2 === 0) {
                        const p = projects[i / 2];
                        return p
                            ? { color: p.color || defaultColors[i], src: p.imageUrl || DEFAULT_BACKGROUND }
                            : { color: defaultColors[i], src: DEFAULT_BACKGROUND };
                    } else {
                        const h = hobbies[(i - 1) / 2];
                        return h
                            ? { color: h.color || defaultColors[i], src: h.imageUrl || DEFAULT_BACKGROUND }
                            : { color: defaultColors[i], src: DEFAULT_BACKGROUND };
                    }
                };
                const firstFour = [buildSlot(0), buildSlot(1), buildSlot(2), buildSlot(3)];
                const lastFour = [buildSlot(4), buildSlot(5), buildSlot(6), buildSlot(7)];

                setSlider1(firstFour);
                setSlider2(lastFour);
            } catch (error) {
                console.error('Error fetching images:', error);
                // Fallback to default images
                const fallback = defaultColors.map(color => ({ color, src: DEFAULT_BACKGROUND }));
                setSlider1(fallback.slice(0, 4));
                setSlider2(fallback.slice(4, 8));
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [locale]);

    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end start"]
    })

    const x1 = useTransform(scrollYProgress, [0, 1], [0, 150])
    const x2 = useTransform(scrollYProgress, [0, 1], [0, -150])
    const height = useTransform(scrollYProgress, [0, 0.9], [50, 0])

    return (
        <div ref={container} className={styles.slidingImages}>
            <motion.div style={{x: x1}} className={styles.slider}>
                    {
                        slider1.map( (project, index) => {
                            return <div key={index} className={styles.project} style={{backgroundColor: project.color}} >
                                <div className={styles.imageContainer}>
                                    <Image 
                                    fill={true}
                                    alt={"image"}
                                    src={project.src}/>
                                </div>
                            </div>
                        })
                    }
                </motion.div>
                <motion.div style={{x: x2}} className={styles.slider}>
                    {
                        slider2.map( (project, index) => {
                            return <div key={index} className={styles.project} style={{backgroundColor: project.color}} >
                                <div key={index} className={styles.imageContainer}>
                                    <Image 
                                    fill={true}
                                    alt={"image"}
                                    src={project.src}/>
                                </div>
                            </div>
                        })
                    }
                </motion.div>
                <motion.div style={{height}} className={styles.circleContainer}>
                    <div className={styles.circle}></div>
                </motion.div>
        </div>
    )
}

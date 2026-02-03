'use client';

import { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import styles from './style.module.scss';
import Image from 'next/image';
import { getProjects, getHobbies } from '@/lib/api/client';
import { useLanguage } from '@/lib/i18n/context';

const defaultImage = "https://portfolio-app.nyc3.digitaloceanspaces.com/images/background.jpg";

const defaultColors = [
    "#e3e5e7", "#d6d7dc", "#e3e3e3", "#21242b",
    "#d4e3ec", "#e5e0e1", "#d7d4cf", "#e1dad6"
];

export default function SlidingImages() {
    const { locale } = useLanguage();
    const [slider1, setSlider1] = useState([
        { color: defaultColors[0], src: defaultImage },
        { color: defaultColors[1], src: defaultImage },
        { color: defaultColors[2], src: defaultImage },
        { color: defaultColors[3], src: defaultImage }
    ]);
    const [slider2, setSlider2] = useState([
        { color: defaultColors[4], src: defaultImage },
        { color: defaultColors[5], src: defaultImage },
        { color: defaultColors[6], src: defaultImage },
        { color: defaultColors[7], src: defaultImage }
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

                // First 4 images: Projects 1-4
                const firstFour = projects.slice(0, 4).map((project, index) => ({
                    color: project.color || defaultColors[index],
                    src: project.imageUrl || defaultImage
                }));

                // Last 4 images: Alternate between projects and hobbies (Project 5, Hobby 1, Project 6, Hobby 2)
                const lastFour = [];
                const remainingProjects = projects.slice(4);
                
                for (let i = 0; i < 4; i++) {
                    if (i % 2 === 0) {
                        // Add project
                        const projectIndex = Math.floor(i / 2);
                        if (remainingProjects[projectIndex]) {
                            lastFour.push({
                                color: remainingProjects[projectIndex].color || defaultColors[4 + i],
                                src: remainingProjects[projectIndex].imageUrl || defaultImage
                            });
                        } else {
                            lastFour.push({ color: defaultColors[4 + i], src: defaultImage });
                        }
                    } else {
                        // Add hobby
                        const hobbyIndex = Math.floor(i / 2);
                        if (hobbies[hobbyIndex]) {
                            lastFour.push({
                                color: hobbies[hobbyIndex].color || defaultColors[4 + i],
                                src: hobbies[hobbyIndex].imageUrl || defaultImage
                            });
                        } else {
                            lastFour.push({ color: defaultColors[4 + i], src: defaultImage });
                        }
                    }
                }

                setSlider1(firstFour);
                setSlider2(lastFour);
            } catch (error) {
                console.error('Error fetching images:', error);
                // Fallback to default images
                const fallback = defaultColors.map(color => ({ color, src: defaultImage }));
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

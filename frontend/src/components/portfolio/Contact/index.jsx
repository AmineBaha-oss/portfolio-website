'use client';

import styles from './style.module.scss';
import Image from 'next/image';
import Rounded from '@/common/RoundedButton';
import { useRef, useState } from 'react';
import { useScroll, motion, useTransform } from 'framer-motion';
import Magnetic from '@/common/Magnetic';

export default function Contact() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end end"]
    })
    const x = useTransform(scrollYProgress, [0, 1], [0, 100])
    const y = useTransform(scrollYProgress, [0, 1], [-500, 0])
    const rotate = useTransform(scrollYProgress, [0, 1], [120, 90])

    // Message form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        
        try {
            const { submitMessage } = await import('@/lib/api/client');
            await submitMessage(formData);
            
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSubmitStatus(null), 5000);
        } catch (error) {
            console.error('Error submitting message:', error);
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div style={{y}} ref={container} className={styles.contact}>
            <div className={styles.body}>
                <div className={styles.title}>
                    <span>
                        <div className={styles.imageContainer}>
                            <Image 
                            fill={true}
                            alt={"image"}
                            src={`/images/background.jpg`}
                            />
                        </div>
                        <h2>Let's work</h2>
                    </span>
                    <h2>together</h2>
                    <motion.div style={{x}} className={styles.buttonContainer}>
                        <Rounded  backgroundColor={"#2a2b2c"} className={styles.button}>
                            <p>Get in touch</p>
                        </Rounded>
                    </motion.div>
                    <motion.svg style={{rotate, scale: 2}} width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8.5C8.27614 8.5 8.5 8.27614 8.5 8L8.5 3.5C8.5 3.22386 8.27614 3 8 3C7.72386 3 7.5 3.22386 7.5 3.5V7.5H3.5C3.22386 7.5 3 7.72386 3 8C3 8.27614 3.22386 8.5 3.5 8.5L8 8.5ZM0.646447 1.35355L7.64645 8.35355L8.35355 7.64645L1.35355 0.646447L0.646447 1.35355Z" fill="white"/>
                    </motion.svg>
                </div>
                <div className={styles.nav}>
                        <Rounded backgroundColor="#2a2b2c">
                            <p>aminebaha115@gmail.com</p>
                        </Rounded>
                </div>

                {/* Message Form Section */}
                <div className={styles.messageForm}>
                    <h3>Send me a message</h3>
                    <form onSubmit={handleSubmit}>
                        {submitStatus === 'success' && (
                            <div className={styles.successMessage}>Message sent successfully!</div>
                        )}
                        {submitStatus === 'error' && (
                            <div className={styles.errorMessage}>Failed to send. Please try again.</div>
                        )}
                        <div className={styles.formRow}>
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Your Message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                            rows="5"
                        />
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>

                <div className={styles.info}>
                    <div>
                        <span>
                            <h3>Version</h3>
                            <p>2026 © Edition</p>
                        </span>
                        <span>
                            <h3>Local Time</h3>
                            <p>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</p>
                        </span>
                    </div>
                    <div>
                        <span>
                            <h3>socials</h3>
                            <Magnetic>
                                <a href="https://github.com/AmineBaha-oss" target="_blank" rel="noopener noreferrer">
                                    <p>GitHub</p>
                                </a>
                            </Magnetic>
                        </span>
                        <Magnetic>
                            <a href="https://www.linkedin.com/in/amine-baha-oss" target="_blank" rel="noopener noreferrer">
                                <p>Linkedin</p>
                            </a>
                        </Magnetic>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

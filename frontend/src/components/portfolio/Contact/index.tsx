'use client';

import styles from './style.module.scss';
import Image from 'next/image';
import Rounded from '@/common/RoundedButton';
import { useRef, useState, useEffect } from 'react';
import { useScroll, motion, useTransform } from 'framer-motion';
import Magnetic from '@/common/Magnetic';
import { useTranslations } from '@/lib/i18n/hooks';

interface ContactInfo {
    id: string;
    type: string;
    value: string;
    order: number;
}

export default function Contact() {
    const { t, locale } = useTranslations();
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end end"]
    })
    const x = useTransform(scrollYProgress, [0, 1], [0, 100])
    const y = useTransform(scrollYProgress, [0, 1], [-500, 0])
    const rotate = useTransform(scrollYProgress, [0, 1], [120, 90])

    // Contact info state
    const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
    const [email, setEmail] = useState('');
    const [socialLinks, setSocialLinks] = useState<{ github?: string; linkedin?: string }>({});

    // Fetch contact info
    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                console.log('Fetching contact info from:', `${apiUrl}/api/public/contact-info`);
                const response = await fetch(`${apiUrl}/api/public/contact-info`);
                console.log('Contact info response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Contact info data:', data);
                    setContactInfo(data.contactInfo || []);
                    
                    // Update email and social links from API
                    const links: { github?: string; linkedin?: string } = {};
                    
                    data.contactInfo?.forEach((info: ContactInfo) => {
                        console.log('Processing contact info:', info);
                        if (info.type === 'email') {
                            console.log('Setting email:', info.value);
                            setEmail(info.value);
                        } else if (info.type === 'social_links') {
                            // Parse social links by URL
                            const url = info.value.toLowerCase();
                            if (url.includes('github.com')) {
                                links.github = info.value;
                            } else if (url.includes('linkedin.com')) {
                                links.linkedin = info.value;
                            }
                        }
                    });
                    
                    console.log('Setting social links:', links);
                    setSocialLinks(links);
                    console.log('Email state:', email);
                } else {
                    console.error('Failed to fetch contact info:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error fetching contact info:', error);
            }
        };

        fetchContactInfo();
    }, []);

    // Message form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
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
                        <h2>{t('contact.title').split(' ')[0]} {t('contact.title').split(' ')[1]}</h2>
                    </span>
                    <h2>{t('contact.subtitle').split(' ')[0]}</h2>
                    <motion.div style={{x}} className={styles.buttonContainer}>
                        <Rounded backgroundColor={"#2a2b2c"} className={styles.button}>
                            <p>{t('contact.title')}</p>
                        </Rounded>
                    </motion.div>
                    <motion.svg style={{rotate, scale: 2}} width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8.5C8.27614 8.5 8.5 8.27614 8.5 8L8.5 3.5C8.5 3.22386 8.27614 3 8 3C7.72386 3 7.5 3.22386 7.5 3.5V7.5H3.5C3.22386 7.5 3 7.72386 3 8C3 8.27614 3.22386 8.5 3.5 8.5L8 8.5ZM0.646447 1.35355L7.64645 8.35355L8.35355 7.64645L1.35355 0.646447L0.646447 1.35355Z" fill="white"/>
                    </motion.svg>
                </div>
                <div className={styles.nav}>
                    {email && (
                        <Rounded backgroundColor="#2a2b2c">
                            <p>{email}</p>
                        </Rounded>
                    )}
                </div>

                {/* Message Form Section */}
                <div className={styles.messageForm}>
                    <h3>{t('contact.send')}</h3>
                    <form onSubmit={handleSubmit}>
                        {submitStatus === 'success' && (
                            <div className={styles.successMessage}>{t('contact.success')}</div>
                        )}
                        {submitStatus === 'error' && (
                            <div className={styles.errorMessage}>{t('contact.error')}</div>
                        )}
                        <div className={styles.formRow}>
                            <input
                                type="text"
                                placeholder={t('contact.namePlaceholder')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder={t('contact.emailPlaceholder')}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <input
                            type="text"
                            placeholder={t('contact.subjectPlaceholder')}
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder={t('contact.messagePlaceholder')}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                            rows={5}
                        />
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('contact.sending') : t('contact.send')}
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
                            <h3>{locale === 'fr' ? 'Heure locale' : 'Local Time'}</h3>
                            <p>{new Date().toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</p>
                        </span>
                    </div>
                    <div>
                        <span>
                            <h3>{locale === 'fr' ? 'Réseaux sociaux' : 'Socials'}</h3>
                            {socialLinks.github && (
                                <Magnetic>
                                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">
                                        <p>GitHub</p>
                                    </a>
                                </Magnetic>
                            )}
                        </span>
                        {socialLinks.linkedin && (
                            <Magnetic>
                                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                                    <p>Linkedin</p>
                                </a>
                            </Magnetic>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

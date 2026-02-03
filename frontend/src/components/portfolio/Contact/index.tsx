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
    const [isMobile, setIsMobile] = useState(false);

    // Check for mobile on mount
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", "end end"]
    })
    const x = useTransform(scrollYProgress, [0, 1], [0, 100])
    const y = useTransform(scrollYProgress, [0, 1], isMobile ? [0, 0] : [-500, 0])
    const rotate = useTransform(scrollYProgress, [0, 1], [120, 90])

    // Contact info state
    const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
    const [email, setEmail] = useState('');
    const [socialLinks, setSocialLinks] = useState<{ github?: string; linkedin?: string }>({});
    const [profilePicture, setProfilePicture] = useState('https://portfolio-app.nyc3.digitaloceanspaces.com/images/pfp.png');

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
                        } else if (info.type === 'profile_picture') {
                            setProfilePicture(`https://portfolio-app.nyc3.digitaloceanspaces.com/${info.value}`);
                        } else if (info.type === 'github') {
                            links.github = info.value;
                        } else if (info.type === 'linkedin') {
                            links.linkedin = info.value;
                        } else if (info.type === 'social_links') {
                            // Parse social links by URL (legacy support)
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
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validateContactForm = () => {
        const errors: Record<string, string> = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.length > 50) {
            errors.name = 'Name must be less than 50 characters';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.subject.trim()) {
            errors.subject = 'Subject is required';
        } else if (formData.subject.length > 100) {
            errors.subject = 'Subject must be less than 100 characters';
        }
        
        if (!formData.message.trim()) {
            errors.message = 'Message is required';
        } else if (formData.message.length > 300) {
            errors.message = 'Message must be less than 300 characters';
        }
        
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({});
        
        const errors = validateContactForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }
        
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
                            alt={"profile picture"}
                            src={profilePicture}
                            />
                        </div>
                        <h2>{t('contact.title')}</h2>
                    </span>
                    <h2>{t('contact.subtitle')}</h2>
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
                    {socialLinks.github && (
                        <Rounded backgroundColor="#2a2b2c">
                            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">
                                <p>GitHub</p>
                            </a>
                        </Rounded>
                    )}
                    {socialLinks.linkedin && (
                        <Rounded backgroundColor="#2a2b2c">
                            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                                <p>LinkedIn</p>
                            </a>
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
                            <div className={styles.formGroup}>
                                <input
                                    type="text"
                                    placeholder={t('contact.namePlaceholder')}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    maxLength={50}
                                    className={validationErrors.name ? styles.errorInput : ''}
                                />
                                {validationErrors.name && (
                                    <span className={styles.errorText}>{validationErrors.name}</span>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <input
                                    type="email"
                                    placeholder={t('contact.emailPlaceholder')}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className={validationErrors.email ? styles.errorInput : ''}
                                />
                                {validationErrors.email && (
                                    <span className={styles.errorText}>{validationErrors.email}</span>
                                )}
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <input
                                type="text"
                                placeholder={t('contact.subjectPlaceholder')}
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                                maxLength={100}
                                className={validationErrors.subject ? styles.errorInput : ''}
                            />
                            {validationErrors.subject && (
                                <span className={styles.errorText}>{validationErrors.subject}</span>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <div className={styles.labelRow}>
                                <label>{t('contact.message')}</label>
                                <span className={styles.charCount}>{formData.message.length}/300</span>
                            </div>
                            <textarea
                                placeholder={t('contact.messagePlaceholder')}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                                rows={5}
                                maxLength={300}
                                className={validationErrors.message ? styles.errorInput : ''}
                            />
                            {validationErrors.message && (
                                <span className={styles.errorText}>{validationErrors.message}</span>
                            )}
                        </div>
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

'use client';

import styles from './style.module.scss';
import { motion } from 'framer-motion';
import RoundedButton from '@/common/RoundedButton';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Resume() {
  const { t } = useTranslations();
  
  const handleDownload = () => {
    // Placeholder - will be dynamic from backend later
    alert(t('dashboardResume.download'));
  };

  return (
    <section id="resume" className={styles.resume}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={styles.content}
        >
          <h2 className={styles.title}>{t('dashboardResume.title')}</h2>
          <p className={styles.subtitle}>
            {t('dashboardResume.download')}
          </p>
          
          <div className={styles.resumePreview}>
            <div className={styles.previewBox}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Resume.pdf</p>
            </div>
          </div>

          <div className={styles.buttonWrapper} onClick={handleDownload}>
            <RoundedButton backgroundColor="#2a2b2c">
              <p>{t('dashboardResume.download')}</p>
            </RoundedButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

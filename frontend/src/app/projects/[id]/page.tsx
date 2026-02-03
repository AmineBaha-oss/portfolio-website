'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import styles from './page.module.scss';
import { useLanguage } from '@/lib/i18n/context';
import { getProjectById, type Project } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n/hooks';

export default function ProjectDetailPage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLanguage();
  const { t } = useTranslations();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<string>('/projects');

  useEffect(() => {
    // Check if user came from the homepage with hash
    if (typeof window !== 'undefined' && document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.pathname === '/' && ref.hash === '#projects') {
        setReferrer('/#projects');
      }
    }
  }, []);

  // Force scroll to top on pathname change
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scroll(0, 0);
    
    const timeout1 = setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scroll(0, 0);
    }, 10);

    const timeout2 = setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scroll(0, 0);
    }, 50);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [pathname]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const id = params.id as string;
        const response = await getProjectById(id, locale);
        console.log('Fetched project detail:', response.project);
        console.log('Project imageUrl:', response.project.imageUrl);
        setProject(response.project);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id, locale]);

  if (loading) {
    return (
      <main className={styles.projectDetail}>
        <div className={styles.container}>
          <p style={{ color: '#666', textAlign: 'center' }}>{t('dashboard.loading')}</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className={styles.projectDetail}>
        <div className={styles.container}>
          <Link href={referrer} scroll={false} className={styles.backLink}>← {t('projects.allProjects')}</Link>
          <p style={{ color: '#666', textAlign: 'center' }}>{error || t('dashboard.error')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.projectDetail}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href={referrer} scroll={false} className={styles.backLink}>← {t('projects.allProjects')}</Link>

          <div className={styles.hero} style={{ backgroundColor: project.color || '#2a2b2c' }}>
            <motion.div
              className={styles.imageContainer}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Image
                src={project.imageUrl || "https://portfolio-app.nyc3.digitaloceanspaces.com/images/background.jpg"}
                alt={project.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
                unoptimized
              />
            </motion.div>
          </div>

          <div className={styles.content}>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {project.title}
            </motion.h1>

            <motion.p
              className={styles.description}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {project.description}
            </motion.p>

            {project.fullDescription && (
              <motion.div
                className={styles.fullDescription}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                dangerouslySetInnerHTML={{ __html: project.fullDescription }}
              />
            )}

            <div className={styles.details}>
              {project.client && (
                <motion.div
                  className={styles.detailItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h3>{t('projects.client')}</h3>
                  <p>{project.client}</p>
                </motion.div>
              )}

              {(project.startDate || project.endDate) && (
                <motion.div
                  className={styles.detailItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <h3>{t('projects.timeline')}</h3>
                  <p>
                    {project.startDate && new Date(project.startDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long' })}
                    {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long' })}`}
                    {!project.endDate && project.inProgress && ` - ${t('dashboardProjects.inProgress')}`}
                    {!project.endDate && !project.inProgress && ` - ${t('experience.present')}`}
                  </p>
                </motion.div>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <motion.div
                  className={styles.detailItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <h3>{t('projects.technologies')}</h3>
                  <div className={styles.technologies}>
                    {project.technologies.map((tech, index) => (
                      <span key={index} className={styles.techTag}>{tech}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              className={styles.links}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {project.projectUrl && (
                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                  {t('projects.visitWebsite')}
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                  {t('projects.viewCode')}
                </a>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

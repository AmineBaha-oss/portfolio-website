'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getActivities } from '@/lib/api/client';
import type { Activity } from '@/lib/api/activity-types';
import { useTranslations } from '@/lib/i18n/hooks';
import styles from './style.module.scss';

export default function Activities() {
  const { locale, t } = useTranslations();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setState('loading');
    getActivities(locale).then(response => {
      if (!cancelled) { setActivities(response.activities); setState('ready'); }
    }).catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [locale, attempt]);

  if (state === 'ready' && activities.length === 0) return null;
  return (
    <section id="activities" className={styles.activities} aria-labelledby="activities-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t('activities.eyebrow')}</p>
          <h2 id="activities-heading">{t('activities.title')}</h2>
          <p>{t('activities.subtitle')}</p>
        </div>
        {state === 'loading' && <p role="status">{t('dashboard.loading')}</p>}
        {state === 'error' && <div role="alert"><p>{t('activities.loadError')}</p><button onClick={() => setAttempt(a => a + 1)}>{t('activities.retry')}</button></div>}
        {state === 'ready' && <div className={styles.list}>
          {activities.map((activity, index) => (
            <motion.article className={styles.card} key={activity.id}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.3) }}>
              <div className={styles.meta}>
                <span className={styles.category}>{t(`activities.categories.${activity.category}`)}</span>
                <span>{activity.period}</span>
                {activity.location && <span>{activity.location}</span>}
              </div>
              <div className={styles.content}>
                <h3>{activity.title}</h3>
                {activity.organization && <p className={styles.organization}>{activity.organization}</p>}
                <p className={styles.description}>{activity.description}</p>
                {activity.technologies.length > 0 && <ul className={styles.tags} aria-label={t('projects.technologies')}>
                  {activity.technologies.map(tech => <li key={tech}>{tech}</li>)}
                </ul>}
                {(activity.projectId || activity.eventUrl) && <div className={styles.links}>
                  {activity.projectId && <Link href={`/projects/${activity.projectId}`}>{t('activities.viewProject')} <span aria-hidden="true">↗</span></Link>}
                  {activity.eventUrl && <a href={activity.eventUrl} target="_blank" rel="noopener noreferrer">{t('activities.eventLink')} <span aria-hidden="true">↗</span></a>}
                </div>}
              </div>
            </motion.article>
          ))}
        </div>}
      </div>
    </section>
  );
}

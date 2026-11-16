'use client';
import { useLanguage } from '@/lib/i18n/context';
import { activities, profileText } from '@/lib/content/profile';
import styles from './style.module.scss';

export default function Activities() {
  const { locale } = useLanguage();
  return (
    <section id="activities" className={styles.experience}>
      <div className={styles.container}>
        <h2 className={styles.title}>{locale === 'fr' ? 'Hackathons & communauté' : 'Hackathons & Community'}</h2>
        <div className={styles.timeline}>
          {activities.map(activity => (
            <article key={activity.title[0]} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.content}>
                <span className={styles.period}>{typeof activity.year === 'string' ? activity.year : profileText(activity.year, locale)}</span>
                <h3>{profileText(activity.title, locale)}</h3>
                <p>{profileText(activity.description, locale)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

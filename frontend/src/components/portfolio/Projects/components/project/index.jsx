'use client';
import React from 'react'
import Link from 'next/link'
import styles from './style.module.scss';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Project({index, title, description, projectId, manageModal}) {
    const { t } = useTranslations();

    const handleClick = (e) => {
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            e.preventDefault();
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            manageModal(true, index, centerX, centerY);
        } else {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            window.scroll(0, 0);
        }
    };

    return (
        <Link href={`/projects/${projectId}`} scroll={false} style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleClick}>
            <div
                onMouseEnter={(e) => { if (typeof window !== 'undefined' && window.innerWidth > 768) manageModal(true, index, e.clientX, e.clientY); }}
                onMouseLeave={(e) => { if (typeof window !== 'undefined' && window.innerWidth > 768) manageModal(false, index, e.clientX, e.clientY); }}
                className={styles.project}
            >
                <h2>{title}</h2>
                <p>{description || t('projects.designDevelopment')}</p>
            </div>
        </Link>
    )
}

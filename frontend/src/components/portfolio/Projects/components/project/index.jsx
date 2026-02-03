'use client';
import React from 'react'
import Link from 'next/link'
import styles from './style.module.scss';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Project({index, title, description, projectId, manageModal}) {
    const { t } = useTranslations();

    return (
        <Link href={`/projects/${projectId}`} scroll={false} style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            window.scroll(0, 0);
        }}>
            <div onMouseEnter={(e) => {manageModal(true, index, e.clientX, e.clientY)}} onMouseLeave={(e) => {manageModal(false, index, e.clientX, e.clientY)}} className={styles.project}>
                <h2>{title}</h2>
                <p>{description || t('projects.designDevelopment')}</p>
            </div>
        </Link>
    )
}

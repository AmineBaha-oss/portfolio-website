'use client';
import React from 'react'
import styles from './style.module.scss';
import { useTranslations } from '@/lib/i18n/hooks';

export default function index({index, title, manageModal}) {
    const { t } = useTranslations();

    return (
        <div onMouseEnter={(e) => {manageModal(true, index, e.clientX, e.clientY)}} onMouseLeave={(e) => {manageModal(false, index, e.clientX, e.clientY)}} className={styles.project}>
            <h2>{title}</h2>
            <p>{t('projects.designDevelopment')}</p>
        </div>
    )
}

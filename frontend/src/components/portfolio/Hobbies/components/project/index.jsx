'use client';
import React from 'react'
import styles from './style.module.scss';

export default function index({index, title, description, manageModal}) {
    const handleClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            manageModal(true, index, centerX, centerY);
        }
    };

    return (
        <div
            onMouseEnter={(e) => { if (typeof window !== 'undefined' && window.innerWidth > 768) manageModal(true, index, e.clientX, e.clientY); }}
            onMouseLeave={(e) => { if (typeof window !== 'undefined' && window.innerWidth > 768) manageModal(false, index, e.clientX, e.clientY); }}
            onClick={handleClick}
            className={styles.project}
        >
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    )
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { getMessages, markMessageRead, deleteMessage } from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";
import { useDialog } from "@/components/ui/ConfirmDialog";

export default function MessagesManagementPage() {
  const { t } = useTranslations();
  const { showConfirm, showAlert } = useDialog();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getMessages();
      setMessages(response.messages);
    } catch (err: any) {
      showAlert(err.message || t('dashboard.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markMessageRead(id);
      await fetchMessages();
    } catch (err: any) {
      await showAlert(err.message || t('dashboard.error'), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({ message: t('dashboard.deleteConfirm'), title: t('dashboard.delete') });
    if (!confirmed) return;
    try {
      await deleteMessage(id);
      await fetchMessages();
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err: any) {
      await showAlert(err.message || t('dashboard.error'), 'error');
    }
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(m => filter === 'unread' ? m.status === 'unread' : m.status === 'read');

  const unreadCount = messages.filter(m => m.status === "unread").length;

  if (loading) return <div className={styles.pageContainer}><div className={styles.container}><p>{t('dashboard.loading')}</p></div></div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.topBar}>
            <div className={styles.breadcrumb}><a href="/dashboard">{t('dashboard.title')}</a><span>/</span><span>{t('dashboardMessages.title')}</span></div>
            {unreadCount > 0 && <span className={`${styles.badge} ${styles.info}`}>{unreadCount} {t('dashboardMessages.unread')}</span>}
          </div>
          <div className={styles.pageTitle}><h1>{t('dashboardMessages.title')}</h1><p>{t('dashboardMessages.subtitle')}</p></div>
        </motion.div>

        <div className={styles.filterButtons}>
          <button className={`${styles.button} ${filter === 'all' ? styles.primary : styles.secondary}`} onClick={() => setFilter('all')}>{t('dashboardMessages.all')} ({messages.length})</button>
          <button className={`${styles.button} ${filter === 'unread' ? styles.primary : styles.secondary}`} onClick={() => setFilter('unread')}>{t('dashboardMessages.unread')} ({unreadCount})</button>
          <button className={`${styles.button} ${filter === 'read' ? styles.primary : styles.secondary}`} onClick={() => setFilter('read')}>{t('dashboardMessages.read')} ({messages.length - unreadCount})</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              className={styles.card}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              style={{
                cursor: "pointer",
                background: message.status === "unread" ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.02)",
              }}
              onClick={() => setSelectedMessage(message)}
            >
              <div className={styles.cardHeader}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1rem", color: "white", margin: 0, fontWeight: message.status === "unread" ? 600 : 500 }}>{message.name}</h3>
                    {message.status === "unread" && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white", flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: "0 0 0.5rem 0" }}>{message.email}</p>
                  <p style={{ fontSize: "0.875rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{message.subject}</p>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{message.message}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
                  <span className={styles.cardMeta}>{new Date(message.createdAt).toLocaleDateString()}</span>
                  <div className={styles.cardActions}>
                    <button 
                      className={`${styles.button} ${styles.secondary}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(message.id);
                      }}
                    >
                      {message.status === "unread" ? t('dashboardMessages.markRead') : t('dashboardMessages.markUnread')}
                    </button>
                    <button 
                      className={`${styles.button} ${styles.danger}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message.id);
                      }}
                    >
                      {t('dashboard.delete')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedMessage && (
          <MessageModal 
            message={selectedMessage}
            onClose={() => setSelectedMessage(null)}
            onDelete={() => {
              handleDelete(selectedMessage.id);
              setSelectedMessage(null);
            }}
            onMarkRead={() => {
              handleMarkRead(selectedMessage.id);
              setSelectedMessage(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function MessageModal({ message, onClose, onDelete, onMarkRead }: { message: any; onClose: () => void; onDelete: () => void; onMarkRead: () => void }) {
  const { t } = useTranslations();
  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div className={styles.modalCard} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "white", margin: "0 0 0.5rem 0" }}>{message.subject}</h2>
            <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>{t('dashboardMessages.from')}: {message.name} ({message.email})</p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)", marginTop: "0.25rem" }}>{new Date(message.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer", padding: "0.5rem" }}>×</button>
        </div>
        <div style={{ padding: "1.5rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", marginBottom: "1.5rem" }}>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.875rem", lineHeight: "1.6", margin: 0 }}>{message.message}</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <a href={`mailto:${message.email}`} className={`${styles.button} ${styles.primary}`} style={{ flex: 1, textDecoration: "none", textAlign: "center" }}>{t('dashboardMessages.reply')}</a>
          {message.status === "unread" && (
            <button className={`${styles.button} ${styles.secondary}`} onClick={onMarkRead}>{t('dashboardMessages.markRead')}</button>
          )}
          <button className={`${styles.button} ${styles.danger}`} onClick={onDelete}>{t('dashboard.delete')}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

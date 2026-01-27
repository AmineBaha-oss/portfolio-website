"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { getContactInfo, createContactInfo, updateContactInfo, deleteContactInfo } from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";

interface ContactInfo {
  id: string;
  type: string;
  value: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function ContactInfoPage() {
  const { t } = useTranslations();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContactInfo | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    value: "",
    order: 0,
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContactInfo();
      setContactInfo(data.contactInfo || []);
    } catch (err: any) {
      console.error('Error fetching contact info:', err);
      setError(err.message || 'Failed to load contact info');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return;

    try {
      await deleteContactInfo(id);
      await fetchContactInfo();
    } catch (err: any) {
      alert(err.message || t('dashboard.error'));
    }
  };

  const handleEdit = (item: ContactInfo) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      value: item.value,
      order: item.order,
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await updateContactInfo(editingItem.id, formData);
      } else {
        await createContactInfo(formData);
      }

      await fetchContactInfo();
      setShowAddModal(false);
      setEditingItem(null);
      setFormData({ type: "", value: "", order: 0 });
    } catch (err: any) {
      alert(err.message || t('dashboard.error'));
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>{t('dashboardContactInfo.title')}</h1>
            <p>{t('dashboard.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.topBar}>
            <div className={styles.breadcrumb}>
              <a href="/dashboard">{t('dashboard.title')}</a>
              <span>/</span>
              <span>{t('dashboardContactInfo.title')}</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => {
                  setEditingItem(null);
                  setFormData({ type: "", value: "", order: contactInfo.length });
                  setShowAddModal(true);
                }}
              >
                + {t('dashboardContactInfo.addNew')}
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>{t('dashboardContactInfo.title')}</h1>
            <p>{t('dashboardContactInfo.subtitle')}</p>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.error}
          >
            {error}
          </motion.div>
        )}

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {contactInfo.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('dashboard.noItems')}</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('dashboardContactInfo.type')}</th>
                  <th>{t('dashboardContactInfo.value')}</th>
                  <th>{t('common.order')}</th>
                  <th>{t('dashboard.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {contactInfo.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  >
                    <td style={{ fontWeight: 500, textTransform: 'capitalize' }}>{item.type}</td>
                    <td>{item.value}</td>
                    <td>{item.order}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className={`${styles.button} ${styles.secondary}`}
                          onClick={() => handleEdit(item)}
                        >
                          {t('dashboard.edit')}
                        </button>
                        <button
                          className={`${styles.button} ${styles.danger}`}
                          onClick={() => handleDelete(item.id)}
                        >
                          {t('dashboard.delete')}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className={styles.modalCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem" }}>
                {editingItem ? t('dashboardContactInfo.edit') : t('dashboardContactInfo.addNew')}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>{t('dashboardContactInfo.type')} *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="">{t('dashboardContactInfo.selectType')}</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="social_links">Social Links (GitHub, LinkedIn, etc.)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>{t('dashboardContactInfo.value')} *</label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Enter value (e.g., email@example.com)"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('common.order')}</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min={0}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                  <button
                    type="submit"
                    className={`${styles.button} ${styles.primary}`}
                    style={{ flex: 1 }}
                  >
                    {editingItem ? t('dashboard.save') : t('dashboard.add')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`${styles.button} ${styles.secondary}`}
                    style={{ flex: 1 }}
                  >
                    {t('dashboard.cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

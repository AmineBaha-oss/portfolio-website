"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import {
  getContactInfo,
  createContactInfo,
  updateContactInfo,
  deleteContactInfo,
} from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Toast } from "@/components/ui/Toast";
import { useDialog } from "@/components/ui/ConfirmDialog";
import { triggerDataRefresh } from "@/lib/hooks/useDataRefresh";

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
  const { showConfirm, showAlert } = useDialog();
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
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [profilePicKey, setProfilePicKey] = useState<string>("");
  const [pendingProfilePicKey, setPendingProfilePicKey] = useState<string>("");
  const profilePicRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContactInfo();
      setContactInfo(data.contactInfo || []);

      // Find profile picture
      const profilePic = data.contactInfo?.find(
        (item: ContactInfo) => item.type === "profile_picture",
      );
      if (profilePic) {
        setProfilePicKey(profilePic.value);
      }
    } catch (err: any) {
      console.error("Error fetching contact info:", err);
      setError(err.message || "Failed to load contact info");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      message: t("common.confirmDelete"),
      title: t("dashboard.delete"),
    });
    if (!confirmed) return;

    try {
      await deleteContactInfo(id);
      await fetchContactInfo();
    } catch (err: any) {
      await showAlert(err.message || t("dashboard.error"), "error");
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
      await showAlert(err.message || t("dashboard.error"), "error");
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>{t("dashboardContactInfo.title")}</h1>
            <p>{t("dashboard.loading")}</p>
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
              <a href="/dashboard">{t("dashboard.title")}</a>
              <span>/</span>
              <span>{t("dashboardContactInfo.title")}</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => {
                  setEditingItem(null);
                  const maxOrder =
                    contactInfo.length > 0
                      ? Math.max(...contactInfo.map((c) => c.order ?? 0))
                      : 0;
                  setFormData({ type: "", value: "", order: maxOrder + 1 });
                  setShowAddModal(true);
                }}
              >
                + {t("dashboardContactInfo.addNew")}
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>{t("dashboardContactInfo.title")}</h1>
            <p>{t("dashboardContactInfo.subtitle")}</p>
          </div>
        </motion.div>

        {/* Profile Picture Section */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          style={{ marginBottom: "2rem" }}
        >
          <div className={styles.cardHeader} style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                margin: 0,
                color: "white",
              }}
            >
              {t("dashboardContactInfo.profilePicture")}
            </h3>
            <div className={styles.cardActions}>
              {pendingProfilePicKey && (
                <>
                  <button
                    onClick={async () => {
                      try {
                        const existing = contactInfo.find(
                          (item) => item.type === "profile_picture",
                        );
                        if (existing) {
                          await updateContactInfo(existing.id, {
                            type: "profile_picture",
                            value: pendingProfilePicKey,
                            order: existing.order,
                          });
                        } else {
                          await createContactInfo({
                            type: "profile_picture",
                            value: pendingProfilePicKey,
                            order: 999,
                          });
                        }
                        setProfilePicKey(pendingProfilePicKey);
                        setPendingProfilePicKey("");
                        await fetchContactInfo();
                        triggerDataRefresh();
                        setToast({
                          message: "Profile picture saved!",
                          type: "success",
                        });
                      } catch (error) {
                        console.error("Error saving profile picture:", error);
                        setToast({
                          message: "Failed to save profile picture",
                          type: "error",
                        });
                      }
                    }}
                    className={`${styles.button} ${styles.primary}`}
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    {t("dashboard.save")}
                  </button>
                  <button
                    onClick={() => {
                      setPendingProfilePicKey("");
                      setToast({ message: "Changes cancelled", type: "info" });
                    }}
                    className={`${styles.button} ${styles.secondary}`}
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    {t("dashboard.cancel")}
                  </button>
                </>
              )}
              {profilePicKey && (
                <button
                  onClick={async () => {
                    const confirmed = await showConfirm({
                      message:
                        t("dashboardContactInfo.remove") + " profile picture?",
                      title: t("dashboardContactInfo.remove"),
                    });
                    if (!confirmed) return;
                    try {
                      const existing = contactInfo.find(
                        (item) => item.type === "profile_picture",
                      );
                      if (existing) {
                        await deleteContactInfo(existing.id);
                        setProfilePicKey("");
                        setPendingProfilePicKey("");
                        await fetchContactInfo();
                        setToast({
                          message: "Profile picture removed!",
                          type: "success",
                        });
                      }
                    } catch (error) {
                      console.error("Error removing profile picture:", error);
                      setToast({
                        message: "Failed to remove profile picture",
                        type: "error",
                      });
                    }
                  }}
                  className={`${styles.button} ${styles.danger}`}
                  style={{ padding: "0.5rem 1rem" }}
                >
                  {t("dashboardContactInfo.remove")}
                </button>
              )}
            </div>
          </div>

          {/* Preview how it will look */}
          {(pendingProfilePicKey || profilePicKey) && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.5,
                  marginBottom: "0.75rem",
                  color: "white",
                }}
              >
                {t("dashboardContactInfo.preview")}
              </p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={`https://portfolio-app.nyc3.digitaloceanspaces.com/${pendingProfilePicKey || profilePicKey}`}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div style={{ overflow: "hidden" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      margin: 0,
                      fontWeight: 400,
                      color: "white",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t("contact.title")}
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      margin: "0.25rem 0 0 0",
                      opacity: 0.7,
                      color: "white",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t("contact.subtitle")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => profilePicRef.current?.click()}
            className={`${styles.button} ${styles.primary}`}
            style={{
              padding: "0.75rem 1.5rem",
              marginBottom: "1rem",
              width: "100%",
            }}
          >
            {pendingProfilePicKey || profilePicKey
              ? t("dashboardContactInfo.changePicture")
              : t("dashboardContactInfo.uploadPicture")}
          </button>

          <div style={{ display: "none" }}>
            <ImageUpload
              onUploadSuccess={(key) => {
                setPendingProfilePicKey(key);
                setToast({
                  message: "Image uploaded! Click Save to apply.",
                  type: "success",
                });
              }}
              onUploadError={(error) => {
                setToast({ message: error, type: "error" });
              }}
              onRemove={async () => {
                try {
                  const existing = contactInfo.find(
                    (item) => item.type === "profile_picture",
                  );
                  if (existing) {
                    await deleteContactInfo(existing.id);
                    setProfilePicKey("");
                    setPendingProfilePicKey("");
                    await fetchContactInfo();
                    setToast({
                      message: "Profile picture removed!",
                      type: "success",
                    });
                  }
                } catch (error) {
                  console.error("Error removing profile picture:", error);
                  setToast({
                    message: "Failed to remove profile picture",
                    type: "error",
                  });
                }
              }}
              currentImageUrl={
                pendingProfilePicKey ||
                (profilePicKey
                  ? `https://portfolio-app.nyc3.digitaloceanspaces.com/${profilePicKey}`
                  : undefined)
              }
              fileInputRef={profilePicRef}
            />
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
              <p>{t("dashboard.noItems")}</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("dashboardContactInfo.type")}</th>
                  <th>{t("dashboardContactInfo.value")}</th>
                  <th>{t("common.order")}</th>
                  <th>{t("dashboard.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {contactInfo
                  .filter((item) => item.type !== "profile_picture")
                  .map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                    >
                      <td
                        style={{ fontWeight: 500, textTransform: "capitalize" }}
                      >
                        {item.type}
                      </td>
                      <td>{item.value}</td>
                      <td>{item.order}</td>
                      <td>
                        <div className={styles.cardActions}>
                          <button
                            className={`${styles.button} ${styles.secondary}`}
                            onClick={() => handleEdit(item)}
                          >
                            {t("dashboard.edit")}
                          </button>
                          <button
                            className={`${styles.button} ${styles.danger}`}
                            onClick={() => handleDelete(item.id)}
                          >
                            {t("dashboard.delete")}
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
              <h2
                style={{
                  fontSize: "1.5rem",
                  color: "white",
                  marginBottom: "1.5rem",
                }}
              >
                {editingItem
                  ? t("dashboardContactInfo.edit")
                  : t("dashboardContactInfo.addNew")}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>{t("dashboardContactInfo.type")} *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                  >
                    <option value="">
                      {t("dashboardContactInfo.selectType")}
                    </option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="social_links">
                      Social Links (GitHub, LinkedIn, etc.)
                    </option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>{t("dashboardContactInfo.value")} *</label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder="Enter value (e.g., email@example.com)"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t("common.order")}</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    min={0}
                  />
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}
                >
                  <button
                    type="submit"
                    className={`${styles.button} ${styles.primary}`}
                    style={{ flex: 1 }}
                  >
                    {editingItem ? t("dashboard.save") : t("dashboard.add")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`${styles.button} ${styles.secondary}`}
                    style={{ flex: 1 }}
                  >
                    {t("dashboard.cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

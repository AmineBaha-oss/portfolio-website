"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import {
  getHobbies,
  createHobby,
  updateHobby,
  deleteHobby,
} from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Toast } from "@/components/ui/Toast";
import { triggerDataRefresh } from "@/lib/hooks/useDataRefresh";
import { useDialog } from "@/components/ui/ConfirmDialog";
import { getCdnUrl } from "@/lib/utils/cdn-url";
import { ColorPicker } from "@/components/ui/ColorPicker";

export default function HobbiesManagementPage() {
  const { t, locale } = useTranslations();
  const { showConfirm, showAlert } = useDialog();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHobby, setEditingHobby] = useState<any>(null);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHobbies();
  }, []);

  const fetchHobbies = async () => {
    try {
      setLoading(true);
      const response = await getHobbies();
      setHobbies(response.hobbies);
    } catch (err: any) {
      showAlert(err.message || t("dashboard.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      message: t("dashboard.deleteConfirm"),
      title: t("dashboard.delete"),
    });
    if (!confirmed) return;
    try {
      await deleteHobby(id);
      await fetchHobbies();
      triggerDataRefresh();
    } catch (err: any) {
      await showAlert(err.message || t("dashboard.error"), "error");
    }
  };

  if (loading)
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <p>{t("dashboard.loading")}</p>
        </div>
      </div>
    );

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
              <span>{t("hobbies.title")}</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => {
                  setEditingHobby(null);
                  setShowAddModal(true);
                }}
              >
                + {t("dashboardHobbies.addNew")}
              </button>
            </div>
          </div>
          <div className={styles.pageTitle}>
            <h1>{t("hobbies.title")}</h1>
            <p>{t("hobbies.subtitle")}</p>
          </div>
        </motion.div>

        <div className={`${styles.grid} ${styles.cols3}`}>
          {hobbies.map((hobby, index) => {
            const title =
              typeof hobby.title === "object" &&
              hobby.title &&
              locale in hobby.title
                ? hobby.title[locale]
                : String(hobby.title ?? "");
            const desc =
              typeof hobby.description === "object" &&
              hobby.description &&
              locale in hobby.description
                ? hobby.description[locale]
                : String(hobby.description ?? "");
            return (
              <motion.div
                key={hobby.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              >
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      color: "white",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255, 255, 255, 0.6)",
                      margin: 0,
                    }}
                  >
                    {desc}
                  </p>
                </div>
                <div className={styles.cardFooter}>
                  <button
                    className={`${styles.button} ${styles.secondary}`}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setEditingHobby(hobby);
                      setShowAddModal(true);
                    }}
                  >
                    {t("dashboard.edit")}
                  </button>
                  <button
                    className={`${styles.button} ${styles.danger}`}
                    onClick={() => handleDelete(hobby.id)}
                  >
                    {t("dashboard.delete")}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {showAddModal && (
          <HobbyModal
            hobby={editingHobby}
            hobbies={hobbies}
            onClose={() => {
              setShowAddModal(false);
              setEditingHobby(null);
            }}
            onSuccess={fetchHobbies}
          />
        )}
      </div>
    </div>
  );
}

function toBilingual(v: unknown): { en: string; fr: string } {
  if (v && typeof v === "object" && "en" in v && "fr" in v)
    return {
      en: String((v as { en: unknown }).en ?? ""),
      fr: String((v as { fr: unknown }).fr ?? ""),
    };
  const s = typeof v === "string" ? v : String(v ?? "");
  return { en: s, fr: s };
}

function HobbyModal({
  hobby,
  hobbies,
  onClose,
  onSuccess,
}: {
  hobby: any;
  hobbies: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslations();
  const { showAlert } = useDialog();

  // Calculate the default order as max order + 1
  const getDefaultOrder = () => {
    if (hobbies.length === 0) return 1;
    const maxOrder = Math.max(...hobbies.map((h) => h.order ?? 0));
    return maxOrder + 1;
  };

  const [formData, setFormData] = useState<{
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    color: string;
    order: number;
  }>({
    title: { en: "", fr: "" },
    description: { en: "", fr: "" },
    color: "",
    order: 1,
  });
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [orderInput, setOrderInput] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hobby) {
      setFormData({
        title: toBilingual(hobby.title),
        description: toBilingual(hobby.description),
        color: hobby.color || "",
        order: hobby.order ?? 1,
      });
      setImageKey(hobby.imageKey || null);
      setOrderInput(String(hobby.order ?? 1));
    } else {
      const defaultOrder = getDefaultOrder();
      setFormData({
        title: { en: "", fr: "" },
        description: { en: "", fr: "" },
        color: "",
        order: defaultOrder,
      });
      setImageKey(null);
      setOrderInput(String(defaultOrder));
    }
  }, [hobby, hobbies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const order = parseInt(orderInput, 10) || 1;
    const payload = {
      title: formData.title,
      description: formData.description,
      color: formData.color || undefined,
      order,
      imageKey,
    };
    try {
      if (hobby) await updateHobby(hobby.id, payload);
      else await createHobby(payload);
      triggerDataRefresh();
      onSuccess();
      onClose();
    } catch (err: any) {
      await showAlert(err.message || t("dashboard.error"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <motion.div
        className={styles.modalCard}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem" }}
        >
          {hobby
            ? t("dashboardHobbies.editTitle")
            : t("dashboardHobbies.addNew")}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Hobby Image</label>
            <ImageUpload
              fileInputRef={fileInputRef}
              onUploadSuccess={(key) => {
                setImageKey(key);
                setToast({
                  message: "Image uploaded successfully!",
                  type: "success",
                });
              }}
              onUploadError={(error) =>
                setToast({ message: error, type: "error" })
              }
              onRemove={() => {
                setImageKey(null);
                setToast({ message: "Image removed!", type: "success" });
              }}
              currentImageUrl={
                imageKey
                  ? getCdnUrl(imageKey)
                  : undefined
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t("dashboardHobbies.title")} (English)</label>
            <input
              type="text"
              placeholder="e.g. Photography"
              value={formData.title.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: { ...formData.title, en: e.target.value },
                })
              }
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t("dashboardHobbies.title")} (French)</label>
            <input
              type="text"
              placeholder="e.g. Photographie"
              value={formData.title.fr}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: { ...formData.title, fr: e.target.value },
                })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t("dashboardHobbies.description")} (English)</label>
            <textarea
              placeholder="Brief description of your hobby..."
              rows={2}
              value={formData.description.en}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, en: e.target.value },
                })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t("dashboardHobbies.description")} (French)</label>
            <textarea
              placeholder="Brève description de votre loisir..."
              rows={2}
              value={formData.description.fr}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: { ...formData.description, fr: e.target.value },
                })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t("dashboardHobbies.color")}</label>
            <ColorPicker
              value={formData.color}
              onChange={(color) => setFormData({ ...formData, color })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t("dashboardHobbies.order")}</label>
            <input
              type="number"
              min={1}
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button
              type="submit"
              className={`${styles.button} ${styles.primary}`}
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("common.submitting")
                : hobby
                  ? t("dashboard.save")
                  : t("dashboard.add")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.button} ${styles.secondary}`}
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {t("dashboard.cancel")}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

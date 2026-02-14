"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";
import { triggerDataRefresh } from "@/lib/hooks/useDataRefresh";
import { useDialog } from "@/components/ui/ConfirmDialog";
import { getSkillIcon, getAvailableIcons, getIconForSkillName } from "@/lib/utils/skill-icons";

export default function SkillsManagementPage() {
  const { t, locale } = useTranslations();
  const { showConfirm, showAlert } = useDialog();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map category keys to translation keys
  const getCategoryTranslation = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      Languages: "skills.categories.languages",
      "Back-End": "skills.categories.backend",
      "Front-End & Mobile": "skills.categories.frontend",
      Databases: "skills.categories.databases",
      "DevOps & Tools": "skills.categories.devops",
      "AI & Data": "skills.categories.ai",
    };
    return t(categoryMap[category] || category);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSkills();
      setSkills(response.skills);
    } catch (err: any) {
      console.error("Error fetching skills:", err);
      setError(err.message || "Failed to load skills");
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
      await deleteSkill(id);
      await fetchSkills();
      triggerDataRefresh();
    } catch (err: any) {
      await showAlert(err.message || t("dashboard.error"), "error");
    }
  };

  const handleEdit = (skill: any) => {
    setEditingSkill(skill);
    setShowAddModal(true);
  };

  const handleClearAllIcons = async () => {
    const confirmed = await showConfirm({
      message: "Remove icons from all skills?",
      title: "Clear all icons",
    });
    if (!confirmed) return;
    try {
      for (const skill of skills) {
        const name = typeof skill.name === "object" && skill.name && locale in skill.name
          ? skill.name[locale]
          : String(skill.name ?? "");
        await updateSkill(skill.id, {
          name: skill.name,
          category: skill.category,
          order: skill.order ?? 0,
          icon: null,
        });
      }
      await fetchSkills();
      triggerDataRefresh();
      await showAlert("All icons cleared", "info");
    } catch (err: unknown) {
      await showAlert((err as Error).message || "Failed to clear icons", "error");
    }
  };

  const handleApplyIconsFromText = async () => {
    const confirmed = await showConfirm({
      message: "Auto-assign icons based on skill names? Existing icons will be overwritten.",
      title: "Apply icons from text",
    });
    if (!confirmed) return;
    try {
      let updated = 0;
      for (const skill of skills) {
        const nameEn = typeof skill.name === "object" && skill.name?.en ? skill.name.en : String(skill.name ?? "");
        const nameFr = typeof skill.name === "object" && skill.name?.fr ? skill.name.fr : "";
        const iconKey = getIconForSkillName(nameEn) ?? getIconForSkillName(nameFr);
        if (iconKey) {
          await updateSkill(skill.id, {
            name: skill.name,
            category: skill.category,
            order: skill.order ?? 0,
            icon: iconKey,
          });
          updated++;
        }
      }
      await fetchSkills();
      triggerDataRefresh();
      await showAlert(`${updated} skill(s) updated with icons`, "info");
    } catch (err: unknown) {
      await showAlert((err as Error).message || "Failed to apply icons", "error");
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>{t("skills.title")}</h1>
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
              <span>{t("skills.title")}</span>
            </div>
            <div className={styles.actions} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={handleApplyIconsFromText}
                disabled={skills.length === 0}
                title="Auto-assign icons based on skill names"
              >
                Apply icons from text
              </button>
              <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={handleClearAllIcons}
                disabled={skills.length === 0}
                title="Remove icons from all skills"
              >
                Clear all icons
              </button>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => {
                  setEditingSkill(null);
                  setShowAddModal(true);
                }}
              >
                + {t("dashboardSkills.addNew")}
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>{t("dashboardSkills.title")}</h1>
            <p>{t("skills.subtitle")}</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Icon</th>
                <th>{t("dashboardSkills.name")}</th>
                <th>{t("dashboardSkills.category")}</th>
                <th>{t("dashboardSkills.order")}</th>
                <th>{t("dashboard.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, index) => {
                const name =
                  typeof skill.name === "object" &&
                  skill.name &&
                  locale in skill.name
                    ? skill.name[locale]
                    : String(skill.name ?? "");
                const IconComponent = getSkillIcon(skill.icon);
                return (
                  <motion.tr
                    key={skill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  >
                    <td>
                      {IconComponent ? (
                        <IconComponent size={20} />
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{name}</td>
                    <td>{getCategoryTranslation(skill.category)}</td>
                    <td>{skill.order}</td>
                    <td>
                      <div className={styles.cardActions}>
                        <button
                          className={`${styles.button} ${styles.secondary}`}
                          onClick={() => handleEdit(skill)}
                        >
                          {t("dashboard.edit")}
                        </button>
                        <button
                          className={`${styles.button} ${styles.danger}`}
                          onClick={() => handleDelete(skill.id)}
                        >
                          {t("dashboard.delete")}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        {showAddModal && (
          <SkillModal
            skill={editingSkill}
            skills={skills}
            onClose={() => {
              setShowAddModal(false);
              setEditingSkill(null);
            }}
            onSuccess={fetchSkills}
          />
        )}
      </div>
    </div>
  );
}

function SkillModal({
  skill,
  skills,
  onClose,
  onSuccess,
}: {
  skill: any;
  skills: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslations();
  const { showAlert } = useDialog();
  const isEditing = !!skill;

  // Calculate the default order as max order + 1
  const getDefaultOrder = () => {
    if (skills.length === 0) return 0;
    const maxOrder = Math.max(...skills.map((s) => s.order ?? 0));
    return maxOrder + 1;
  };

  const [formData, setFormData] = useState({
    name: { en: "", fr: "" },
    category: "",
    icon: "" as string,
    order: 0,
  });
  const [orderInput, setOrderInput] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const allIcons = useMemo(() => getAvailableIcons(), []);
  const filteredIcons = useMemo(
    () =>
      iconSearch.trim()
        ? allIcons.filter((i) =>
            i.searchTerms.includes(iconSearch.toLowerCase())
          )
        : allIcons,
    [allIcons, iconSearch]
  );

  useEffect(() => {
    if (skill) {
      const name =
        typeof skill.name === "object"
          ? skill.name
          : { en: skill.name, fr: "" };
      setFormData({
        name,
        category: skill.category || "",
        icon: skill.icon || "",
        order: skill.order ?? 0,
      });
      setOrderInput(String(skill.order ?? 0));
    } else {
      const defaultOrder = getDefaultOrder();
      setFormData((prev) => ({ ...prev, order: defaultOrder }));
      setOrderInput(String(defaultOrder));
    }
  }, [skill, skills]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const order = parseInt(orderInput, 10) || 0;
    const payload = { ...formData, order, icon: formData.icon || null };

    try {
      if (isEditing) {
        await updateSkill(skill.id, payload);
      } else {
        await createSkill(payload);
      }

      triggerDataRefresh();
      onSuccess();
      onClose();
    } catch (err: any) {
      await showAlert(err.message || "Failed to save skill", "error");
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
      <motion.div
        className={styles.modalCard}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem" }}
        >
          {isEditing
            ? t("dashboardSkills.editTitle")
            : t("dashboardSkills.addNew")}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>{t("dashboardSkills.name")} (English) *</label>
            <input
              type="text"
              placeholder="e.g. React"
              value={formData.name.en}
              onChange={(e) => {
                const en = e.target.value;
                const matchedIcon = getIconForSkillName(en);
                setFormData({
                  ...formData,
                  name: { ...formData.name, en },
                  icon: matchedIcon ?? formData.icon,
                });
              }}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("dashboardSkills.name")} (French) *</label>
            <input
              type="text"
              placeholder="e.g. React"
              value={formData.name.fr}
              onChange={(e) => {
                const fr = e.target.value;
                const matchedIcon = getIconForSkillName(fr) ?? getIconForSkillName(formData.name.en);
                setFormData({
                  ...formData,
                  name: { ...formData.name, fr },
                  icon: matchedIcon ?? formData.icon,
                });
              }}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t("dashboardSkills.category")} *</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="">{t("common.select")}</option>
              <option value="Languages">
                {t("skills.categories.languages")}
              </option>
              <option value="Back-End">{t("skills.categories.backend")}</option>
              <option value="Front-End & Mobile">
                {t("skills.categories.frontend")}
              </option>
              <option value="Databases">
                {t("skills.categories.databases")}
              </option>
              <option value="DevOps & Tools">
                {t("skills.categories.devops")}
              </option>
              <option value="AI & Data">{t("skills.categories.ai")}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Icon</label>
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setShowIconPicker(!showIconPicker)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "white",
                  minHeight: "44px",
                }}
              >
                {formData.icon ? (
                  (() => {
                    const Icon = getSkillIcon(formData.icon);
                    const label = allIcons.find((i) => i.key === formData.icon)?.label || formData.icon;
                    return (
                      <>
                        {Icon && <Icon size={20} />}
                        <span>{label}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, icon: "" });
                          }}
                          style={{
                            marginLeft: "auto",
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "white",
                            fontSize: "12px",
                          }}
                        >
                          ✕
                        </button>
                      </>
                    );
                  })()
                ) : (
                  <span style={{ opacity: 0.5 }}>Select an icon...</span>
                )}
              </div>

              {showIconPicker && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "#1e1f22",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    zIndex: 100,
                    maxHeight: "280px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "0.5rem" }}>
                    <input
                      type="text"
                      placeholder="Search icons..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "0.5rem 0.75rem",
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        color: "white",
                        fontSize: "0.875rem",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      overflowY: "auto",
                      padding: "0.25rem 0.5rem 0.5rem",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: "4px",
                    }}
                  >
                    {filteredIcons.map(({ key, label }) => {
                      const Icon = getSkillIcon(key);
                      const isSelected = formData.icon === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, icon: key });
                            setShowIconPicker(false);
                            setIconSearch("");
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.4rem 0.6rem",
                            background: isSelected
                              ? "rgba(255,255,255,0.15)"
                              : "transparent",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: "white",
                            fontSize: "0.8rem",
                            textAlign: "left",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = isSelected
                              ? "rgba(255,255,255,0.15)"
                              : "transparent")
                          }
                        >
                          {Icon && <Icon size={16} />}
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {label}
                          </span>
                        </button>
                      );
                    })}
                    {filteredIcons.length === 0 && (
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          padding: "1rem",
                          textAlign: "center",
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.875rem",
                        }}
                      >
                        No icons found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{t("dashboardSkills.order")}</label>
            <input
              type="number"
              placeholder="0"
              min={0}
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
                : isEditing
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

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/api/admin-client";
import { useTranslations } from "@/lib/i18n/hooks";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Toast } from "@/components/ui/Toast";
import { triggerDataRefresh } from "@/lib/hooks/useDataRefresh";
import { useDialog } from "@/components/ui/ConfirmDialog";

export default function ProjectsManagementPage() {
  const { t, locale } = useTranslations();
  const { showConfirm, showAlert } = useDialog();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProjects();
      setProjects(response.projects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({ message: t('dashboard.deleteConfirm'), title: t('dashboard.delete') });
    if (!confirmed) return;
    
    try {
      await deleteProject(id);
      await fetchProjects();
      triggerDataRefresh(); // Notify landing page
    } catch (err: any) {
      await showAlert(err.message || t('dashboard.error'), 'error');
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>{t('projects.title')}</h1>
            <p>{t('dashboard.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>{t('projects.title')}</h1>
            <p style={{ color: 'red' }}>{t('dashboard.error')}: {error}</p>
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
              <span>{t('projects.title')}</span>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={() => {
                  setEditingProject(null);
                  setShowAddModal(true);
                }}
              >
                + {t('dashboardProjects.addNew')}
              </button>
            </div>
          </div>

          <div className={styles.pageTitle}>
            <h1>{t('dashboardProjects.title')}</h1>
            <p>{t('projects.subtitle')}</p>
          </div>
        </motion.div>

        <div className={`${styles.grid} ${styles.cols2}`}>
          {projects.map((project, index) => {
            const title = typeof project.title === 'object' && project.title && locale in project.title ? project.title[locale] : String(project.title ?? '');
            const description = typeof project.description === 'object' && project.description && locale in project.description ? project.description[locale] : String(project.description ?? '');
            
            return (
              <motion.div
                key={project.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              >
                <div className={styles.cardHeader} style={{ marginBottom: "1rem" }}>
                  <div className={styles.badgeGroup}>
                    <h3 style={{ fontSize: "1.25rem", color: "white", margin: "0 0 0.5rem 0" }}>
                      {title}
                    </h3>
                    {project.featured && (
                      <span className={styles.badge}>{t('dashboardProjects.featured')}</span>
                    )}
                  </div>
                  <span className={styles.badge}>
                    {project.status === 'published' ? t('dashboardProjects.published') : t('dashboardProjects.draft')}
                  </span>
                </div>

                <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  {description}
                </p>

                <div className={styles.badgeGroup} style={{ marginBottom: "1.5rem" }}>
                  {(project.technologies || []).map((tech: string) => (
                    <span
                      key={tech}
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        color: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <button 
                    className={`${styles.button} ${styles.secondary}`} 
                    style={{ flex: 1 }}
                    onClick={() => handleEdit(project)}
                  >
                    {t('dashboard.edit')}
                  </button>
                  <button 
                    className={`${styles.button} ${styles.danger}`}
                    onClick={() => handleDelete(project.id)}
                  >
                    {t('dashboard.delete')}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {showAddModal && (
          <ProjectModal 
            project={editingProject}
            onClose={() => {
              setShowAddModal(false);
              setEditingProject(null);
            }}
            onSuccess={fetchProjects}
          />
        )}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose, onSuccess }: { project: any; onClose: () => void; onSuccess: () => void }) {
  const { t } = useTranslations();
  const { showAlert } = useDialog();
  const isEditing = !!project;
  const [formData, setFormData] = useState({
    title: { en: '', fr: '' },
    description: { en: '', fr: '' },
    fullDescription: { en: '', fr: '' },
    client: '',
    projectUrl: '',
    githubUrl: '',
    technologies: '',
    color: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    featured: false,
  });
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project) {
      const title = typeof project.title === 'object' ? project.title : { en: project.title, fr: '' };
      const description = typeof project.description === 'object' ? project.description : { en: project.description, fr: '' };
      const fullDescription = project.fullDescription && typeof project.fullDescription === 'object' 
        ? project.fullDescription 
        : { en: project.fullDescription || '', fr: '' };
      
      setFormData({
        title,
        description,
        fullDescription,
        client: project.client || '',
        projectUrl: project.projectUrl || '',
        githubUrl: project.githubUrl || '',
        technologies: (project.technologies || []).join(', '),
        color: project.color || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        status: project.status || 'draft',
        featured: project.featured || false,
      });
      setImageKey(project.imageKey || null);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        ...formData,
        technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
        imageKey,
      };

      if (isEditing) {
        await updateProject(project.id, data);
      } else {
        await createProject(data);
      }
      
      triggerDataRefresh(); // Notify landing page
      onSuccess();
      onClose();
    } catch (err: any) {
      await showAlert(err.message || t('dashboard.error'), 'error');
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
        <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1.5rem" }}>
          {isEditing ? t('dashboardProjects.editTitle') : t('dashboardProjects.addNew')}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Project Image</label>
            <ImageUpload
              fileInputRef={fileInputRef}
              onUploadSuccess={(key) => {
                setImageKey(key);
                setToast({ message: "Image uploaded successfully!", type: "success" });
              }}
              onUploadError={(error) => setToast({ message: error, type: "error" })}
              onRemove={() => {
                setImageKey(null);
                setToast({ message: "Image removed!", type: "success" });
              }}
              currentImageUrl={imageKey ? `https://portfolio-app.nyc3.digitaloceanspaces.com/${imageKey}` : undefined}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardProjects.title')} (English) *</label>
            <input 
              type="text" 
              placeholder={t('dashboardProjects.titlePlaceholder')}
              value={formData.title.en}
              onChange={(e) => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardProjects.title')} (French) *</label>
            <input 
              type="text" 
              placeholder={t('dashboardProjects.titlePlaceholderFr')}
              value={formData.title.fr}
              onChange={(e) => setFormData({ ...formData, title: { ...formData.title, fr: e.target.value } })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardProjects.description')} (English) *</label>
            <textarea 
              placeholder={t('dashboardProjects.descriptionPlaceholder')} 
              rows={3}
              value={formData.description.en}
              onChange={(e) => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardProjects.description')} (French) *</label>
            <textarea 
              placeholder={t('dashboardProjects.descriptionPlaceholderFr')} 
              rows={3}
              value={formData.description.fr}
              onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })}
              required
            />
          </div>

          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}>
              <label>{t('dashboardProjects.client')}</label>
              <input 
                type="text" 
                placeholder={t('dashboardProjects.clientPlaceholder')}
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>{t('dashboardProjects.color')}</label>
              <input 
                type="text" 
                placeholder="#EFE8D3"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardProjects.technologies')}</label>
            <input 
              type="text" 
              placeholder={t('dashboardProjects.technologiesPlaceholder')}
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            />
          </div>

          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}>
              <label>{t('dashboardProjects.startDate')}</label>
              <input 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>{t('dashboardProjects.endDate')}</label>
              <input 
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardProjects.projectUrl')}</label>
            <input 
              type="url" 
              placeholder="https://example.com"
              value={formData.projectUrl}
              onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardProjects.githubUrl')}</label>
            <input 
              type="url" 
              placeholder="https://github.com/username/repo"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardProjects.fullDescription')} (English)</label>
            <textarea 
              placeholder={t('dashboardProjects.fullDescriptionPlaceholder')} 
              rows={4}
              value={formData.fullDescription.en}
              onChange={(e) => setFormData({ ...formData, fullDescription: { ...formData.fullDescription, en: e.target.value } })}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('dashboardProjects.fullDescription')} (French)</label>
            <textarea 
              placeholder={t('dashboardProjects.fullDescriptionPlaceholderFr')} 
              rows={4}
              value={formData.fullDescription.fr}
              onChange={(e) => setFormData({ ...formData, fullDescription: { ...formData.fullDescription, fr: e.target.value } })}
            />
          </div>

          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.formGroup}>
              <label>{t('dashboardProjects.status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="draft">{t('dashboardProjects.draft')}</option>
                <option value="published">{t('dashboardProjects.published')}</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input 
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <span>{t('dashboardProjects.featured')}</span>
              </label>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button 
              type="submit" 
              className={`${styles.button} ${styles.primary}`} 
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.submitting') : (isEditing ? t('dashboard.save') : t('dashboard.add'))}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.button} ${styles.secondary}`}
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {t('dashboard.cancel')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

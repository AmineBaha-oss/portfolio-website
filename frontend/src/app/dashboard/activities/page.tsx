'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createActivity, deleteActivity, getActivities, getProjects, updateActivity } from '@/lib/api/admin-client';
import { activityCategories, type ActivityInput, type AdminActivity, type BilingualText } from '@/lib/api/activity-types';
import { useTranslations } from '@/lib/i18n/hooks';
import { triggerDataRefresh } from '@/lib/hooks/useDataRefresh';
import { useDialog } from '@/components/ui/ConfirmDialog';
import styles from '../shared.module.scss';
import local from './page.module.scss';

const blankText = (): BilingualText => ({ en: '', fr: '' });
function emptyActivity(order: number): ActivityInput {
  return { title: blankText(), description: blankText(), organization: blankText(), period: blankText(), location: blankText(), category: 'hackathon', technologies: [], projectId: null, eventUrl: null, order, published: false };
}
type ProjectOption = { id: string; title: BilingualText; status: string };
type TextField = 'title' | 'description' | 'organization' | 'period' | 'location';

export default function ActivitiesManagementPage() {
  const { t, locale } = useTranslations();
  const { showConfirm } = useDialog();
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ActivityInput | null>(null);
  const [technologies, setTechnologies] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const firstInput = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    const [a, p] = await Promise.all([getActivities(), getProjects()]);
    setActivities(a.activities);
    setProjects(p.projects);
  }, []);
  useEffect(() => {
    load().catch(error => setError(error.message)).finally(() => setLoading(false));
  }, [load]);
  const editorOpen = form !== null;
  useEffect(() => { if (editorOpen) firstInput.current?.focus(); }, [editing, editorOpen]);

  function start(activity?: AdminActivity) {
    setEditing(activity?.id ?? null);
    setForm(activity ? {
      title: { ...activity.title }, description: { ...activity.description }, organization: activity.organization ? { ...activity.organization } : blankText(),
      period: { ...activity.period }, location: activity.location ? { ...activity.location } : blankText(),
      category: activity.category, technologies: activity.technologies, projectId: activity.projectId, eventUrl: activity.eventUrl, order: activity.order, published: activity.published,
    } : emptyActivity(Math.max(0, ...activities.map(a => a.order)) + 1));
    setTechnologies(activity?.technologies.join(', ') ?? '');
    setError(''); setNotice('');
  }
  function setText(field: TextField, lang: 'en' | 'fr', value: string) {
    setForm(current => current && ({ ...current, [field]: { ...(current[field] || blankText()), [lang]: value } }));
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || busy) return;
    setBusy(true); setError(''); setNotice('');
    const payload = { ...form, technologies: technologies.split(',').map(s => s.trim()).filter(Boolean) };
    try {
      if (editing) await updateActivity(editing, payload);
      else await createActivity(payload);
      triggerDataRefresh();
      setForm(null); setEditing(null); setNotice(t('activities.admin.saved'));
      await load();
    } catch (error) { setError(error instanceof Error ? error.message : t('activities.admin.saveError')); }
    finally { setBusy(false); }
  }
  async function remove(activity: AdminActivity) {
    if (busy) return;
    if (!await showConfirm({ title: t('dashboard.delete'), message: t('activities.admin.deleteConfirm'), confirmText: t('dashboard.delete'), cancelText: t('dashboard.cancel') })) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await deleteActivity(activity.id);
      triggerDataRefresh();
      if (editing === activity.id) { setForm(null); setEditing(null); }
      setNotice(t('activities.admin.deleted')); await load();
    } catch (error) { setError(error instanceof Error ? error.message : t('activities.admin.deleteError')); }
    finally { setBusy(false); }
  }
  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <header className={local.header}>
          <div><h1>{t('activities.title')}</h1><p>{t('activities.admin.subtitle')}</p></div>
          {!form && <button className={`${styles.button} ${styles.primary}`} onClick={() => start()} disabled={loading || busy}>{t('activities.admin.add')}</button>}
        </header>
        {error && <p role="alert" className={local.error}>{error}</p>}
        {notice && <p role="status" className={local.notice}>{notice}</p>}
        {loading && <p role="status">{t('activities.admin.loading')}</p>}
        {!loading && error && activities.length === 0 && <button className={`${styles.button} ${styles.secondary}`} onClick={() => { setError(''); setLoading(true); load().catch(e => setError(e.message)).finally(() => setLoading(false)); }}>{t('activities.retry')}</button>}
        {form && <form onSubmit={save} className={`${styles.card} ${local.editor}`} aria-labelledby="activity-editor-title">
          <h2 id="activity-editor-title">{t(editing ? 'activities.admin.edit' : 'activities.admin.add')}</h2>
          <p className={local.hint}>{t('activities.admin.required')}</p>
          <fieldset disabled={busy} className={local.fields}>
            {(['title', 'organization', 'period', 'location', 'description'] as TextField[]).map(field => (
              <div className={local.bilingual} key={field}>
                {(['en', 'fr'] as const).map(lang => {
                  const required = ['title', 'period', 'description'].includes(field);
                  const id = `activity-${field}-${lang}`;
                  return <div className={styles.formGroup} key={lang}>
                    <label htmlFor={id}>{t(`activities.admin.${field}`)} · {t(lang === 'en' ? 'activities.admin.english' : 'activities.admin.french')}{required ? ' *' : ` (${t('activities.admin.optional')})`}</label>
                    {field === 'description' ? <textarea id={id} lang={lang} required={required} maxLength={10000} rows={5} value={form[field]?.[lang] || ''} onChange={e => setText(field, lang, e.target.value)} />
                      : <input ref={field === 'title' && lang === 'en' ? firstInput : undefined} id={id} lang={lang} required={required} maxLength={field === 'period' ? 200 : 500} value={form[field]?.[lang] || ''} onChange={e => setText(field, lang, e.target.value)} />}
                  </div>;
                })}
              </div>
            ))}
            <div className={local.bilingual}>
              <div className={styles.formGroup}><label htmlFor="activity-category">{t('activities.admin.category')}</label><select id="activity-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ActivityInput['category'] })}>{activityCategories.map(category => <option key={category} value={category}>{t(`activities.categories.${category}`)}</option>)}</select></div>
              <div className={styles.formGroup}><label htmlFor="activity-order">{t('activities.admin.order')}</label><input id="activity-order" type="number" required min={0} max={2147483647} step={1} value={Number.isNaN(form.order) ? '' : form.order} onChange={e => setForm({ ...form, order: e.target.valueAsNumber })} /></div>
            </div>
            <div className={styles.formGroup}><label htmlFor="activity-technologies">{t('activities.admin.technologies')}</label><input id="activity-technologies" value={technologies} onChange={e => setTechnologies(e.target.value)} placeholder="TypeScript, Next.js" /></div>
            <div className={local.bilingual}>
              <div className={styles.formGroup}><label htmlFor="activity-project">{t('activities.admin.project')}</label><select id="activity-project" value={form.projectId || ''} onChange={e => setForm({ ...form, projectId: e.target.value || null })}><option value="">{t('activities.admin.noProject')}</option>{projects.map(project => <option key={project.id} value={project.id}>{project.title[locale] || project.title.en}{project.status !== 'published' ? ` (${t('activities.admin.draft')})` : ''}</option>)}</select></div>
              <div className={styles.formGroup}><label htmlFor="activity-event-url">{t('activities.admin.eventUrl')}</label><input id="activity-event-url" type="url" maxLength={2000} value={form.eventUrl || ''} onChange={e => setForm({ ...form, eventUrl: e.target.value || null })} placeholder="https://" /></div>
            </div>
            <label className={local.checkbox}><input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />{t('activities.admin.published')}</label>
            <div className={local.actions}><button type="submit" className={`${styles.button} ${styles.primary}`}>{busy ? t('common.submitting') : t('activities.admin.save')}</button><button type="button" className={`${styles.button} ${styles.secondary}`} onClick={() => { setForm(null); setEditing(null); }}>{t('activities.admin.cancel')}</button></div>
          </fieldset>
        </form>}
        {!loading && activities.length === 0 && !error && <p>{t('activities.admin.empty')}</p>}
        <div className={local.list}>
          {activities.map(activity => <article key={activity.id} className={styles.card}>
            <div className={local.itemHeader}><span className={local.badge}>{activity.published ? t('activities.admin.live') : t('activities.admin.draft')}</span><span className={local.hint}>#{activity.order} · {t(`activities.categories.${activity.category}`)}</span></div>
            <h2>{activity.title[locale] || activity.title.en}</h2>
            <p className={local.hint}>{activity.period[locale] || activity.period.en}{activity.organization && ` · ${activity.organization[locale] || activity.organization.en}`}</p>
            <p className={local.description}>{activity.description[locale] || activity.description.en}</p>
            <div className={local.actions}><button disabled={busy} className={`${styles.button} ${styles.secondary}`} onClick={() => start(activity)}>{t('dashboard.edit')}</button><button disabled={busy} className={`${styles.button} ${styles.danger}`} onClick={() => remove(activity)}>{t('dashboard.delete')}</button></div>
          </article>)}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { motion } from "framer-motion";
import styles from "./shared.module.scss";
import { useTranslations } from "@/lib/i18n/hooks";
import { getProjects, getSkills, getExperience, getTestimonials, getMessages, getHobbies, getEducation, getResume } from "@/lib/api/admin-client";

function DashboardContent() {
  const { t } = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experience: 0,
    testimonials: 0
  });
  const [recentActivities, setRecentActivities] = useState<Array<{
    type: string;
    message: string;
    params?: Record<string, string>;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionResult = await authClient.getSession();
        
        if (!sessionResult?.data?.session) {
          router.push("/login?redirect=/dashboard");
          return;
        }
        
        // Fetch stats
        try {
          const [projectsRes, skillsRes, experienceRes, testimonialsRes, messagesRes, hobbiesRes, educationRes, resumeEnRes, resumeFrRes] = await Promise.all([
            getProjects().catch(() => ({ projects: [] })),
            getSkills().catch(() => ({ skills: [] })),
            getExperience().catch(() => ({ experiences: [] })),
            getTestimonials().catch(() => ({ testimonials: [] })),
            getMessages().catch(() => ({ messages: [] })),
            getHobbies().catch(() => ({ hobbies: [] })),
            getEducation().catch(() => ({ education: [] })),
            getResume("en").catch(() => ({ resume: null })),
            getResume("fr").catch(() => ({ resume: null }))
          ]);

          const counts = {
            projects: projectsRes.projects?.length || 0,
            skills: skillsRes.skills?.length || 0,
            experience: experienceRes.experiences?.length || 0,
            testimonials: testimonialsRes.testimonials?.length || 0
          };

          setStats(counts);

          // Build recent activities from the data
          const activities: Array<{ type: string; message: string; params?: Record<string, string>; timestamp: string }> = [];

          // Add recent projects
          if (projectsRes.projects?.length > 0) {
            const sortedProjects = [...projectsRes.projects].sort((a, b) => 
              new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );
            const recentProject = sortedProjects[0];
            if (recentProject) {
              const title = typeof recentProject.title === 'object' ? recentProject.title.en : recentProject.title;
              const key = recentProject.updatedAt ? 'dashboard.projectUpdated' : 'dashboard.projectCreated';
              activities.push({
                type: 'project',
                message: key,
                params: { title },
                timestamp: recentProject.updatedAt || recentProject.createdAt
              });
            }
          }

          // Add recent skills
          if (skillsRes.skills?.length > 0) {
            const sortedSkills = [...skillsRes.skills].sort((a, b) => 
              new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );
            const recentSkill = sortedSkills[0];
            if (recentSkill) {
              const name = typeof recentSkill.name === 'object' ? recentSkill.name.en : recentSkill.name;
              const key = recentSkill.updatedAt ? 'dashboard.skillUpdated' : 'dashboard.skillAdded';
              activities.push({
                type: 'skill',
                message: key,
                params: { name },
                timestamp: recentSkill.updatedAt || recentSkill.createdAt
              });
            }
          }

          // Add recent experience
          if (experienceRes.experiences?.length > 0) {
            const sortedExperiences = [...experienceRes.experiences].sort((a, b) => 
              new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );
            const recentExperience = sortedExperiences[0];
            if (recentExperience) {
              const position = typeof recentExperience.position === 'object' ? recentExperience.position.en : recentExperience.position;
              const key = recentExperience.updatedAt ? 'dashboard.experienceUpdated' : 'dashboard.experienceAdded';
              activities.push({
                type: 'experience',
                message: key,
                params: { position },
                timestamp: recentExperience.updatedAt || recentExperience.createdAt
              });
            }
          }

          // Add recent education
          if (educationRes.education?.length > 0) {
            const sortedEducation = [...educationRes.education].sort((a, b) => 
              new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );
            const recentEducation = sortedEducation[0];
            if (recentEducation) {
              const degree = typeof recentEducation.degree === 'object' ? recentEducation.degree.en : recentEducation.degree;
              const key = recentEducation.updatedAt ? 'dashboard.educationUpdated' : 'dashboard.educationAdded';
              activities.push({
                type: 'education',
                message: key,
                params: { degree },
                timestamp: recentEducation.updatedAt || recentEducation.createdAt
              });
            }
          }

          // Add recent testimonials
          if (testimonialsRes.testimonials?.length > 0) {
            const sortedTestimonials = [...testimonialsRes.testimonials].sort((a, b) => 
              new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()
            );
            const recentTestimonial = sortedTestimonials[0];
            if (recentTestimonial) {
              activities.push({
                type: 'testimonial',
                message: 'dashboard.newTestimonial',
                params: { name: recentTestimonial.name || 'a client' },
                timestamp: recentTestimonial.submittedAt || recentTestimonial.createdAt
              });
            }
          }

          // Add recent messages
          if (messagesRes.messages?.length > 0) {
            const sortedMessages = [...messagesRes.messages].sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const recentMessage = sortedMessages[0];
            if (recentMessage) {
              activities.push({
                type: 'message',
                message: 'dashboard.newMessage',
                params: { name: recentMessage.name || 'a visitor' },
                timestamp: recentMessage.createdAt
              });
            }
          }

          // Add recent hobbies
          if (hobbiesRes.hobbies?.length > 0) {
            const sortedHobbies = [...hobbiesRes.hobbies].sort((a, b) => 
              new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );
            const recentHobby = sortedHobbies[0];
            if (recentHobby) {
              const title = typeof recentHobby.title === 'object' ? recentHobby.title.en : recentHobby.title;
              const key = recentHobby.updatedAt ? 'dashboard.hobbyUpdated' : 'dashboard.hobbyAdded';
              activities.push({
                type: 'hobby',
                message: key,
                params: { title },
                timestamp: recentHobby.updatedAt || recentHobby.createdAt
              });
            }
          }

          // Add recent resume uploads
          const resumes = [resumeEnRes.resume, resumeFrRes.resume].filter(Boolean);
          if (resumes.length > 0) {
            const sortedResumes = [...resumes].sort((a, b) => 
              new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );
            const recentResume = sortedResumes[0];
            if (recentResume) {
              const languageName = recentResume.language === 'fr' ? 'French' : 'English';
              const key = recentResume.updatedAt ? 'dashboard.resumeUpdated' : 'dashboard.resumeUploaded';
              activities.push({
                type: 'resume',
                message: key,
                params: { language: languageName },
                timestamp: recentResume.updatedAt || recentResume.createdAt
              });
            }
          }

          // Sort all activities by timestamp
          activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          setRecentActivities(activities.slice(0, 4)); // Keep only the 4 most recent
        } catch (err) {
          console.error('Error fetching stats:', err);
        }
        setLoading(false);
      } catch (error) {
        console.error("Session error:", error);
        router.push("/login?redirect=/dashboard");
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "60vh",
          color: "white" 
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center" }}
          >
            <p>{t('dashboard.loading')}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: 600, 
            color: "white", 
            marginBottom: "0.5rem" 
          }}>
            {t('dashboard.title')}
          </h1>
          <p style={{ 
            fontSize: "1rem", 
            color: "rgba(255, 255, 255, 0.6)", 
            margin: 0 
          }}>
            {t('dashboard.overview')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem" 
          }}
        >
          <motion.div
            className={styles.card}
            whileHover={{ scale: 1.02 }}
            style={{ textAlign: "center", padding: "2.5rem 2rem" }}
          >
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              {stats.projects}
            </div>
            <h3 style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 500 }}>
              {t('projects.title')}
            </h3>
          </motion.div>

          <motion.div
            className={styles.card}
            whileHover={{ scale: 1.02 }}
            style={{ textAlign: "center", padding: "2.5rem 2rem" }}
          >
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              {stats.skills}
            </div>
            <h3 style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 500 }}>
              {t('skills.title')}
            </h3>
          </motion.div>

          <motion.div
            className={styles.card}
            whileHover={{ scale: 1.02 }}
            style={{ textAlign: "center", padding: "2.5rem 2rem" }}
          >
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              {stats.experience}
            </div>
            <h3 style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 500 }}>
              {t('experience.title')}
            </h3>
          </motion.div>

          <motion.div
            className={styles.card}
            whileHover={{ scale: 1.02 }}
            style={{ textAlign: "center", padding: "2.5rem 2rem" }}
          >
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              {stats.testimonials}
            </div>
            <h3 style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 500 }}>
              {t('testimonials.title')}
            </h3>
          </motion.div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginBottom: "3rem" }}
        >
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: 600, 
            color: "white", 
            marginBottom: "1.5rem" 
          }}>
            {t('dashboard.recentActivity')}
          </h2>
          
          <div className={styles.card}>
            {recentActivities.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {recentActivities.map((activity, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "1rem",
                    padding: "1rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px"
                  }}>
                    <div style={{ 
                      width: "8px", 
                      height: "8px", 
                      borderRadius: "50%", 
                      background: "white",
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "white", margin: 0, fontSize: "0.938rem" }}>
                        {activity.params 
                          ? t(activity.message).replace(/\{(\w+)\}/g, (_, key) => activity.params![key] || '')
                          : t(activity.message)
                        }
                      </p>
                      <p style={{ color: "rgba(255, 255, 255, 0.5)", margin: "0.25rem 0 0 0", fontSize: "0.813rem" }}>
                        {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "rgba(255, 255, 255, 0.6)", textAlign: "center", padding: "2rem" }}>
                {t('dashboard.noRecentActivity')}
              </p>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 style={{ 
            fontSize: "1.5rem", 
            fontWeight: 600, 
            color: "white", 
            marginBottom: "1.5rem" 
          }}>
            {t('dashboard.quickActions')}
          </h2>

          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem"
          }}>
            <motion.div
              className={styles.card}
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/dashboard/projects")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 style={{ fontSize: "1.125rem", color: "white", marginBottom: "0.5rem" }}>
                {t('dashboardProjects.addNew')}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {t('projects.subtitle')}
              </p>
            </motion.div>

            <motion.div
              className={styles.card}
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/dashboard/skills")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 style={{ fontSize: "1.125rem", color: "white", marginBottom: "0.5rem" }}>
                {t('dashboardSkills.title')}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {t('skills.subtitle')}
              </p>
            </motion.div>

            <motion.div
              className={styles.card}
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/dashboard/testimonials")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 style={{ fontSize: "1.125rem", color: "white", marginBottom: "0.5rem" }}>
                {t('dashboardTestimonials.title')}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {t('testimonials.subtitle')}
              </p>
            </motion.div>

            <motion.div
              className={styles.card}
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/dashboard/messages")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 style={{ fontSize: "1.125rem", color: "white", marginBottom: "0.5rem" }}>
                {t('dashboardMessages.title')}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                {t('contact.subtitle')}
              </p>
            </motion.div>
          </div>
        </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth";
import styles from "./shared.module.scss";
import { useTranslations } from "@/lib/i18n/hooks";
import LanguageToggle from "@/components/portfolio/LanguageToggle";
// Icons used in getIcon function
import { 
  MdDashboard, 
  MdWork, 
  MdStars, 
  MdBusinessCenter, 
  MdSchool, 
  MdDescription, 
  MdFavorite, 
  MdRateReview, 
  MdMail,
  MdLogout,
  MdHome,
  MdContactMail,
  MdMenu,
  MdClose
} from "react-icons/md";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigationItems = [
    { path: "/dashboard", label: t('dashboard.overview') },
    { path: "/dashboard/projects", label: t('projects.title') },
    { path: "/dashboard/skills", label: t('skills.title') },
    { path: "/dashboard/experience", label: t('experience.title') },
    { path: "/dashboard/education", label: t('education.title') },
    { path: "/dashboard/resume", label: 'Resume' },
    { path: "/dashboard/hobbies", label: t('hobbies.title') },
    { path: "/dashboard/testimonials", label: t('testimonials.title') },
    { path: "/dashboard/messages", label: t('dashboardMessages.title') },
    { path: "/dashboard/contact-info", label: t('dashboardContactInfo.title') },
  ];

  useEffect(() => {
    // Prevent horizontal scrolling
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";

    // Check for mobile
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionResult = await authClient.getSession();
        if (!sessionResult?.data?.session) {
          router.push("/login");
          return;
        }
        setUser(sessionResult.data.user);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center" }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚡</div>
          <p>{t('dashboard.loading')}</p>
        </motion.div>
      </div>
    );
  }

  const getIcon = (label: string) => {
    const iconSize = sidebarCollapsed ? 24 : 20;
    const icons: { [key: string]: JSX.Element } = {
      "Overview": <MdDashboard size={iconSize} />,
      "Projects": <MdWork size={iconSize} />,
      "Skills": <MdStars size={iconSize} />,
      "Experience": <MdBusinessCenter size={iconSize} />,
      "Education": <MdSchool size={iconSize} />,
      "Resume": <MdDescription size={iconSize} />,
      "Hobbies": <MdFavorite size={iconSize} />,
      "Testimonials": <MdRateReview size={iconSize} />,
      "Messages": <MdMail size={iconSize} />,
      "Contact Information": <MdContactMail size={iconSize} />,
      "Informations de contact": <MdContactMail size={iconSize} />
    };
    return icons[label] || <MdDashboard size={iconSize} />;
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Mobile Menu Toggle */}
      <button 
        className={styles.mobileMenuToggle}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.visible : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <motion.aside
        className={`${styles.sidebar} ${mobileMenuOpen ? styles.mobileOpen : ''}`}
        initial={false}
        animate={{ width: isMobile ? 280 : (sidebarCollapsed ? 70 : 280) }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ width: isMobile ? 280 : (sidebarCollapsed ? 70 : 280) }}
      >
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div style={{ 
            display: "flex", 
            justifyContent: sidebarCollapsed ? "center" : "space-between", 
            alignItems: "center",
            width: "100%"
          }}>
            {(!sidebarCollapsed || isMobile) && <h1 className={styles.logo}>{t('dashboard.title')}</h1>}
            {!isMobile && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  transition: "all 0.2s",
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
              >
                {sidebarCollapsed ? "→" : "←"}
              </button>
            )}
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <>
              {user && (
                <div className={styles.userInfo}>
                  {user.email}
                </div>
              )}
              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
                <LanguageToggle />
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className={styles.navSection}>
          {/* View Site Link */}
          <motion.a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navItem}
            whileHover={{ x: sidebarCollapsed && !isMobile ? 0 : 5 }}
            whileTap={{ scale: 0.98 }}
            title={sidebarCollapsed && !isMobile ? t('nav.home') : undefined}
            style={{
              justifyContent: sidebarCollapsed && !isMobile ? "center" : "flex-start",
              padding: sidebarCollapsed && !isMobile ? "0.875rem 0" : "0.875rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: sidebarCollapsed && !isMobile ? 0 : "0.75rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "0.5rem"
            }}
          >
            <MdHome size={sidebarCollapsed && !isMobile ? 24 : 20} />
            {(!sidebarCollapsed || isMobile) && <span>{t('nav.home')}</span>}
          </motion.a>

          {navigationItems.map((item) => (
            <motion.button
              key={item.path}
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ""}`}
              onClick={() => {
                router.push(item.path);
                if (isMobile) setMobileMenuOpen(false);
              }}
              whileHover={{ x: sidebarCollapsed && !isMobile ? 0 : 5 }}
              whileTap={{ scale: 0.98 }}
              title={sidebarCollapsed && !isMobile ? item.label : undefined}
              style={{
                justifyContent: sidebarCollapsed && !isMobile ? "center" : "flex-start",
                padding: sidebarCollapsed && !isMobile ? "0.875rem 0" : "0.875rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: sidebarCollapsed && !isMobile ? 0 : "0.75rem"
              }}
            >
              {getIcon(item.label)}
              {(!sidebarCollapsed || isMobile) && <span>{item.label}</span>}
            </motion.button>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <motion.button
            className={`${styles.button} ${styles.danger}`}
            onClick={handleSignOut}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              width: "100%",
              padding: sidebarCollapsed && !isMobile ? "0.75rem" : "0.75rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <MdLogout size={20} />
            {(!sidebarCollapsed || isMobile) && <span>{t('nav.logout')}</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        className={styles.mainContent}
        animate={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 70 : 280) }}
        transition={{ duration: 0.3 }}
        style={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 70 : 280) }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

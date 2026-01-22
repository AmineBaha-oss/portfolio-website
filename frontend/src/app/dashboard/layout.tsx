"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth";
import styles from "./shared.module.scss";
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
  MdHome
} from "react-icons/md";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { path: "/dashboard", label: "Overview" },
  { path: "/dashboard/projects", label: "Projects" },
  { path: "/dashboard/skills", label: "Skills" },
  { path: "/dashboard/experience", label: "Experience" },
  { path: "/dashboard/education", label: "Education" },
  { path: "/dashboard/resume", label: "Resume" },
  { path: "/dashboard/hobbies", label: "Hobbies" },
  { path: "/dashboard/testimonials", label: "Testimonials" },
  { path: "/dashboard/messages", label: "Messages" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Prevent horizontal scrolling
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";

    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
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
          <p>Loading...</p>
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
      "Messages": <MdMail size={iconSize} />
    };
    return icons[label] || <MdDashboard size={iconSize} />;
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar */}
      <motion.aside
        className={styles.sidebar}
        initial={false}
        animate={{ width: sidebarCollapsed ? 70 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ width: sidebarCollapsed ? 70 : 280 }}
      >
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div style={{ 
            display: "flex", 
            justifyContent: sidebarCollapsed ? "center" : "space-between", 
            alignItems: "center",
            width: "100%"
          }}>
            {!sidebarCollapsed && <h1 className={styles.logo}>Admin Panel</h1>}
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
          </div>
          {!sidebarCollapsed && user && (
            <div className={styles.userInfo}>
              {user.email}
            </div>
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
            whileHover={{ x: sidebarCollapsed ? 0 : 5 }}
            whileTap={{ scale: 0.98 }}
            title={sidebarCollapsed ? "View Site" : undefined}
            style={{
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              padding: sidebarCollapsed ? "0.875rem 0" : "0.875rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: sidebarCollapsed ? 0 : "0.75rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "0.5rem"
            }}
          >
            <MdHome size={sidebarCollapsed ? 24 : 20} />
            {!sidebarCollapsed && <span>View Site</span>}
          </motion.a>

          {navigationItems.map((item) => (
            <motion.button
              key={item.path}
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ""}`}
              onClick={() => router.push(item.path)}
              whileHover={{ x: sidebarCollapsed ? 0 : 5 }}
              whileTap={{ scale: 0.98 }}
              title={sidebarCollapsed ? item.label : undefined}
              style={{
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                padding: sidebarCollapsed ? "0.875rem 0" : "0.875rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: sidebarCollapsed ? 0 : "0.75rem"
              }}
            >
              {getIcon(item.label)}
              {!sidebarCollapsed && <span>{item.label}</span>}
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
              padding: sidebarCollapsed ? "0.75rem" : "0.75rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <MdLogout size={20} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        className={styles.mainContent}
        animate={{ marginLeft: sidebarCollapsed ? 70 : 280 }}
        transition={{ duration: 0.3 }}
        style={{ marginLeft: sidebarCollapsed ? 70 : 280 }}
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

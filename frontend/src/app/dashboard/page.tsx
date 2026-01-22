"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth";
import { motion } from "framer-motion";
import styles from "./shared.module.scss";

function DashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionResult = await authClient.getSession();
        
        if (!sessionResult?.data?.session) {
          router.push("/login?redirect=/dashboard");
          return;
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
      <div className={styles.pageContainer}>
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
              <p>Loading...</p>
            </motion.div>
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
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ 
            fontSize: "2.5rem", 
            fontWeight: 600, 
            color: "white", 
            marginBottom: "0.5rem" 
          }}>
            Dashboard Overview
          </h1>
          <p style={{ 
            fontSize: "1rem", 
            color: "rgba(255, 255, 255, 0.6)", 
            margin: 0 
          }}>
            Quick stats and recent activity
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
              12
            </div>
            <h3 style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 500 }}>
              Total Projects
            </h3>
          </motion.div>

          <motion.div
            className={styles.card}
            whileHover={{ scale: 1.02 }}
            style={{ textAlign: "center", padding: "2.5rem 2rem" }}
          >
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              24
            </div>
            <h3 style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 500 }}>
              Skills Listed
            </h3>
          </motion.div>

          <motion.div
            className={styles.card}
            whileHover={{ scale: 1.02 }}
            style={{ textAlign: "center", padding: "2.5rem 2rem" }}
          >
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              8
            </div>
            <h3 style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 500 }}>
              Work Experiences
            </h3>
          </motion.div>

          <motion.div
            className={styles.card}
            whileHover={{ scale: 1.02 }}
            style={{ textAlign: "center", padding: "2.5rem 2rem" }}
          >
            <div style={{ fontSize: "3rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
              15
            </div>
            <h3 style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.6)", margin: 0, fontWeight: 500 }}>
              Testimonials
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
            Recent Activity
          </h2>
          
          <div className={styles.card}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ 
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
                    New testimonial received
                  </p>
                  <p style={{ color: "rgba(255, 255, 255, 0.5)", margin: "0.25rem 0 0 0", fontSize: "0.813rem" }}>
                    2 hours ago
                  </p>
                </div>
              </div>

              <div style={{ 
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
                    Project &quot;Portfolio Redesign&quot; updated
                  </p>
                  <p style={{ color: "rgba(255, 255, 255, 0.5)", margin: "0.25rem 0 0 0", fontSize: "0.813rem" }}>
                    5 hours ago
                  </p>
                </div>
              </div>

              <div style={{ 
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
                    New contact message from client
                  </p>
                  <p style={{ color: "rgba(255, 255, 255, 0.5)", margin: "0.25rem 0 0 0", fontSize: "0.813rem" }}>
                    1 day ago
                  </p>
                </div>
              </div>

              <div style={{ 
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
                    Resume updated and published
                  </p>
                  <p style={{ color: "rgba(255, 255, 255, 0.5)", margin: "0.25rem 0 0 0", fontSize: "0.813rem" }}>
                    2 days ago
                  </p>
                </div>
              </div>
            </div>
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
            Quick Actions
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
                Add New Project
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                Showcase your latest work
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
                Update Skills
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                Add new expertise
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
                Review Testimonials
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                Approve pending reviews
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
                Check Messages
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                Respond to contacts
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
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

"use client";

import { motion } from "framer-motion";
import styles from "../shared.module.scss";

export default function TestimonialsManagementPage() {
  // Mock data
  const testimonials = [
    {
      id: 1,
      name: "John Smith",
      position: "CEO at Tech Corp",
      email: "john@techcorp.com",
      message: "Exceptional work! The project exceeded our expectations.",
      rating: 5,
      status: "pending",
      submittedAt: "2024-01-20",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      position: "Product Manager",
      email: "sarah@example.com",
      message: "Professional, timely, and high-quality work. Highly recommended!",
      rating: 5,
      status: "approved",
      submittedAt: "2024-01-18",
    },
    {
      id: 3,
      name: "Mike Brown",
      position: "Startup Founder",
      email: "mike@startup.com",
      message: "Great collaboration and excellent results.",
      rating: 4,
      status: "approved",
      submittedAt: "2024-01-15",
    },
    {
      id: 4,
      name: "Emily Davis",
      position: "Marketing Director",
      email: "emily@company.com",
      message: "Not satisfied with the timeline.",
      rating: 2,
      status: "rejected",
      submittedAt: "2024-01-10",
    },
  ];

  const pendingCount = testimonials.filter(t => t.status === "pending").length;

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
              <a href="/dashboard">Dashboard</a>
              <span>/</span>
              <span>Testimonials</span>
            </div>
            {pendingCount > 0 && (
              <span className={`${styles.badge} ${styles.warning}`}>
                {pendingCount} Pending Review
              </span>
            )}
          </div>

          <div className={styles.pageTitle}>
            <h1>Testimonials</h1>
            <p>Review and manage client testimonials</p>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <button className={`${styles.button} ${styles.primary}`}>
            All ({testimonials.length})
          </button>
          <button className={`${styles.button} ${styles.secondary}`}>
            Pending ({testimonials.filter(t => t.status === "pending").length})
          </button>
          <button className={`${styles.button} ${styles.secondary}`}>
            Approved ({testimonials.filter(t => t.status === "approved").length})
          </button>
          <button className={`${styles.button} ${styles.secondary}`}>
            Rejected ({testimonials.filter(t => t.status === "rejected").length})
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.125rem", color: "white", margin: "0 0 0.25rem 0" }}>
                    {testimonial.name}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                    {testimonial.position}
                  </p>
                </div>
                <span className={styles.badge}>
                  {testimonial.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      color: i < testimonial.rating ? "#fbbf24" : "rgba(255, 255, 255, 0.2)",
                      fontSize: "1.25rem",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.875rem", lineHeight: "1.6", marginBottom: "1rem" }}>
                "{testimonial.message}"
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)" }}>
                  <div>Email: {testimonial.email}</div>
                  <div>Submitted: {new Date(testimonial.submittedAt).toLocaleDateString()}</div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {testimonial.status === "pending" && (
                    <>
                      <button className={`${styles.button} ${styles.primary}`}>
                        Approve
                      </button>
                      <button className={`${styles.button} ${styles.danger}`}>
                        Reject
                      </button>
                    </>
                  )}
                  {testimonial.status !== "pending" && (
                    <button className={`${styles.button} ${styles.danger}`}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../shared.module.scss";

export default function MessagesManagementPage() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);

  // Mock data
  const messages = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      subject: "Website Development Inquiry",
      message: "Hi, I'm interested in having a website built for my business. Could we discuss the details?",
      status: "unread",
      createdAt: "2024-01-22T10:30:00",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@company.com",
      subject: "Project Collaboration",
      message: "I saw your portfolio and would love to collaborate on an upcoming project. Are you available?",
      status: "read",
      createdAt: "2024-01-21T14:15:00",
    },
    {
      id: 3,
      name: "Carol White",
      email: "carol@startup.io",
      subject: "Freelance Opportunity",
      message: "We're looking for a developer for a 3-month contract. Interested in discussing?",
      status: "read",
      createdAt: "2024-01-20T09:00:00",
    },
  ];

  const unreadCount = messages.filter(m => m.status === "unread").length;

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
              <span>Messages</span>
            </div>
            {unreadCount > 0 && (
              <span className={`${styles.badge} ${styles.info}`}>
                {unreadCount} Unread
              </span>
            )}
          </div>

          <div className={styles.pageTitle}>
            <h1>Messages</h1>
            <p>Manage contact form submissions and inquiries</p>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <button className={`${styles.button} ${styles.primary}`}>
            All ({messages.length})
          </button>
          <button className={`${styles.button} ${styles.secondary}`}>
            Unread ({unreadCount})
          </button>
          <button className={`${styles.button} ${styles.secondary}`}>
            Read ({messages.length - unreadCount})
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={styles.card}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              style={{
                cursor: "pointer",
                background: message.status === "unread" 
                  ? "rgba(255, 255, 255, 0.04)" 
                  : "rgba(255, 255, 255, 0.02)",
              }}
              onClick={() => setSelectedMessage(message.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1rem", color: "white", margin: 0, fontWeight: message.status === "unread" ? 600 : 500 }}>
                      {message.name}
                    </h3>
                    {message.status === "unread" && (
                      <span style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "white",
                      }} />
                    )}
                  </div>
                  
                  <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: "0 0 0.5rem 0" }}>
                    {message.email}
                  </p>
                  
                  <p style={{ fontSize: "0.875rem", color: "white", margin: "0 0 0.5rem 0", fontWeight: 500 }}>
                    {message.subject}
                  </p>
                  
                  <p style={{ 
                    fontSize: "0.875rem", 
                    color: "rgba(255, 255, 255, 0.5)", 
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {message.message}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem", marginLeft: "2rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)" }}>
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button 
                      className={`${styles.button} ${styles.secondary}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mark as read logic
                      }}
                    >
                      {message.status === "unread" ? "Mark Read" : "Mark Unread"}
                    </button>
                    <button 
                      className={`${styles.button} ${styles.danger}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Delete logic
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedMessage && (
          <MessageModal 
            message={messages.find(m => m.id === selectedMessage)!}
            onClose={() => setSelectedMessage(null)}
          />
        )}
      </div>
    </div>
  );
}

function MessageModal({ message, onClose }: { message: any; onClose: () => void }) {
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "white", margin: "0 0 0.5rem 0" }}>
              {message.subject}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
              From: {message.name} ({message.email})
            </p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)", marginTop: "0.25rem" }}>
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ 
          padding: "1.5rem", 
          background: "rgba(255, 255, 255, 0.02)", 
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.875rem", lineHeight: "1.6", margin: 0 }}>
            {message.message}
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <a 
            href={`mailto:${message.email}`}
            className={`${styles.button} ${styles.primary}`}
            style={{ flex: 1, textDecoration: "none", textAlign: "center" }}
          >
            Reply via Email
          </a>
          <button
            className={`${styles.button} ${styles.danger}`}
            onClick={() => {
              // Delete logic
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

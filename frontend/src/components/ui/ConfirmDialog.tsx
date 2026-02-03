"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import styles from "./ConfirmDialog.module.scss";

interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "confirm" | "alert" | "error";
}

interface DialogContextType {
  showConfirm: (options: DialogOptions) => Promise<boolean>;
  showAlert: (message: string, type?: "info" | "error") => Promise<void>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

interface DialogState {
  isOpen: boolean;
  options: DialogOptions;
  resolve: ((value: boolean) => void) | null;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    options: { message: "" },
    resolve: null,
  });

  const showConfirm = useCallback((options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        options: { ...options, type: options.type || "confirm" },
        resolve,
      });
    });
  }, []);

  const showAlert = useCallback((message: string, type: "info" | "error" = "info"): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        options: { 
          message, 
          type: type === "error" ? "error" : "alert",
          confirmText: "OK"
        },
        resolve: () => resolve(),
      });
    });
  }, []);

  const handleConfirm = () => {
    dialog.resolve?.(true);
    setDialog({ isOpen: false, options: { message: "" }, resolve: null });
  };

  const handleCancel = () => {
    dialog.resolve?.(false);
    setDialog({ isOpen: false, options: { message: "" }, resolve: null });
  };

  return (
    <DialogContext.Provider value={{ showConfirm, showAlert }}>
      {children}
      <AnimatePresence>
        {dialog.isOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
          >
            <motion.div
              className={styles.dialog}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {dialog.options.type === "error" && (
                <div className={styles.iconError}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              )}
              {dialog.options.type === "confirm" && (
                <div className={styles.iconWarning}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
              )}
              {dialog.options.type === "alert" && (
                <div className={styles.iconInfo}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
              )}
              
              {dialog.options.title && (
                <h2 className={styles.title}>{dialog.options.title}</h2>
              )}
              
              <p className={styles.message}>{dialog.options.message}</p>
              
              <div className={styles.buttons}>
                {dialog.options.type === "confirm" && (
                  <button
                    className={styles.cancelButton}
                    onClick={handleCancel}
                  >
                    {dialog.options.cancelText || "Cancel"}
                  </button>
                )}
                <button
                  className={`${styles.confirmButton} ${dialog.options.type === "error" ? styles.error : ""}`}
                  onClick={handleConfirm}
                >
                  {dialog.options.confirmText || "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DialogContext.Provider>
  );
}

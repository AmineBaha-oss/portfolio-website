'use client';

import { useEffect } from 'react';

export function useDataRefresh() {
  useEffect(() => {
    console.log('[DataRefresh] Hook initialized on landing page');
    let lastCheckedTime = Date.now();
    
    // Check for updates every 2 seconds
    const intervalId = setInterval(() => {
      const lastUpdate = localStorage.getItem('admin_data_updated');
      if (lastUpdate) {
        const updateTime = parseInt(lastUpdate);
        console.log('[DataRefresh] Last update time:', new Date(updateTime).toLocaleTimeString(), 'Last checked:', new Date(lastCheckedTime).toLocaleTimeString());
        // If there was an update since we last checked
        if (updateTime > lastCheckedTime) {
          console.log('[DataRefresh] 🔄 New admin update detected! Performing hard refresh...');
          // Force hard refresh by clearing cache and reloading
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => caches.delete(name));
            });
          }
          // Hard reload with cache bypass
          window.location.href = window.location.href;
        }
        lastCheckedTime = Date.now();
      } else {
        console.log('[DataRefresh] No updates in localStorage yet');
      }
    }, 2000);

    // Also check when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const lastUpdate = localStorage.getItem('admin_data_updated');
        if (lastUpdate) {
          const updateTime = parseInt(lastUpdate);
          const now = Date.now();
          // If update was within last 2 minutes
          if (now - updateTime < 2 * 60 * 1000) {
            console.log('[DataRefresh] Returning to page, performing hard refresh...');
            // Force hard refresh
            if ('caches' in window) {
              caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
              });
            }
            window.location.href = window.location.href;
          }
        }
        lastCheckedTime = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

// Trigger function for admin dashboard to call after updates
export function triggerDataRefresh() {
  if (typeof window !== 'undefined') {
    const timestamp = Date.now().toString();
    localStorage.setItem('admin_data_updated', timestamp);
    console.log('[DataRefresh] ✅ Admin data updated at', new Date().toLocaleTimeString(), '- timestamp:', timestamp);
  }
}

// Wrapper for admin actions that automatically triggers refresh
export async function withDataRefresh<T>(action: () => Promise<T>): Promise<T> {
  const result = await action();
  triggerDataRefresh();
  return result;
}

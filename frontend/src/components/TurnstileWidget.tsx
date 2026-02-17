'use client';

import { useRef, useEffect, useState } from 'react';

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onTokenChange: (token: string) => void;
  className?: string;
}

export default function TurnstileWidget({ onTokenChange, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [widgetRendered, setWidgetRendered] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;

    const existing = document.querySelector(`script[src="${TURNSTILE_SCRIPT_URL}"]`);
    if (existing) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onTokenChange]);

  useEffect(() => {
    if (!siteKey || !scriptLoaded || !containerRef.current || !window.turnstile) return;

    const el = containerRef.current;
    const id = window.turnstile.render(el, {
      sitekey: siteKey,
      callback: (token) => onTokenChange(token),
      'expired-callback': () => onTokenChange(''),
    });
    widgetIdRef.current = id;
    setWidgetRendered(true);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, scriptLoaded, onTokenChange]);

  if (!siteKey) return null;

  return (
    <div
      className={className}
      ref={containerRef}
      aria-label="CAPTCHA verification"
      style={{ minHeight: 65, display: 'flex', alignItems: 'center' }}
    >
      {scriptLoaded && !widgetRendered && (
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
          Loading verification…
        </span>
      )}
    </div>
  );
}

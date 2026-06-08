// Utility for Dual-Tracking (Browser + Server-Side)

// Generate a random ID for event deduplication
export const generateEventId = () => {
  return 'evt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const setCookie = (name: string, value: string, maxAgeDays = 90) => {
  if (typeof document === 'undefined' || !value) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeDays * 24 * 60 * 60}; SameSite=Lax`;
};

// Helper to get a cookie value by name
const getCookie = (name: string) => {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return '';
};

import { getApiUrl } from '@/lib/api';
const API_URL = getApiUrl();

const tikTokEventNames: Record<string, string> = {
  Purchase: 'CompletePayment',
};

function getTikTokEventName(eventName: string) {
  return tikTokEventNames[eventName] || eventName;
}

function persistClickIds() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  const ttclid = params.get('ttclid');

  if (fbclid && !getCookie('_fbc')) {
    setCookie('_fbc', `fb.1.${Date.now()}.${fbclid}`);
  }

  if (ttclid) {
    setCookie('_ttclid', ttclid);
  }
}

export function getTrackingIdentifiers() {
  persistClickIds();

  return {
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc'),
    ttp: getCookie('_ttp'),
    ttclid: getCookie('_ttclid'),
  };
}

// Simple SHA-256 hash function for Advanced Matching
export async function hashData(data: string): Promise<string> {
  if (!data) return '';
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const trackEvent = async (eventName: string, customData: any = {}, userDataRaw: any = {}, eventId = generateEventId(), sendServerEvent = true) => {
  try {
    const eventTime = Math.floor(Date.now() / 1000);
    const eventUrl = window.location.href;
    const identifiers = getTrackingIdentifiers();

    // Hash user data if present (for Advanced Matching)
    const userData = {
      client_user_agent: navigator.userAgent,
      fbp: identifiers.fbp || undefined,
      fbc: identifiers.fbc || undefined,
      ttp: identifiers.ttp || undefined,
      ttclid: identifiers.ttclid || undefined,
      ...userDataRaw
    };

    if (userData.em) userData.em = await hashData(userData.em);
    if (userData.ph) userData.ph = await hashData(userData.ph.replace(/[^0-9]/g, ''));
    if (userData.fn) userData.fn = await hashData(userData.fn);

    // 1. Browser-Side Tracking (Meta)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', eventName, customData, { eventID: eventId });
    }

    // 2. Browser-Side Tracking (TikTok)
    if (typeof window !== 'undefined' && (window as any).ttq) {
      if (eventName === 'PageView') {
        (window as any).ttq.track('PageView', {}, { event_id: eventId });
      } else {
        (window as any).ttq.track(getTikTokEventName(eventName), customData, { event_id: eventId });
      }
    }

    // 3. Server-Side Tracking (Go Backend CAPI)
    const payload = {
      event_name: eventName,
      event_id: eventId,
      event_time: eventTime,
      event_url: eventUrl,
      event_referrer: document.referrer,
      custom_data: customData,
      user_data: userData
    };

    if (sendServerEvent) {
      fetch(`${API_URL}/api/v1/events/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true, 
      }).catch(err => console.error('Failed to trigger CAPI:', err));
    }

  } catch (error) {
    console.error('Tracking Error:', error);
  }
};

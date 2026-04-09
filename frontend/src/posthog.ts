import posthog, { type PostHogConfig } from 'posthog-js';
const ANALYTICS_CONSENT_KEY = 'hl7-analytics-consent';


export function isConsentGranted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'granted';
}

export function setConsentGranted(granted: boolean) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, granted ? 'granted' : 'denied');
  }
}

export function initPosthog(apiKey: string | undefined, options?: Partial<PostHogConfig>) {
  if (!apiKey || !isConsentGranted()) {
    return posthog;
  }

  // Check if already initialized to avoid redundant calls
  // @ts-ignore - accessing internal state to prevent double init
  if (posthog.__loaded) {
    return posthog;
  }

  posthog.init(apiKey, {
    api_host: options?.api_host ?? 'https://app.posthog.com',
    autocapture: false,
    capture_pageview: false,
    ...options,
  });

  return posthog;
}

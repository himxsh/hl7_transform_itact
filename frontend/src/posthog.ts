import posthog, { type PostHogConfig } from 'posthog-js';

export function initPosthog(apiKey: string | undefined, options?: Partial<PostHogConfig>) {
  if (!apiKey) {
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

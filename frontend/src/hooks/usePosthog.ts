import {useMemo} from 'react';
import {initPosthog} from '../posthog.ts';

export function usePosthog() {
  return useMemo(() => {
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    const host = import.meta.env.VITE_POSTHOG_HOST;
    return initPosthog(apiKey, host ? {api_host: host} : undefined);
  }, []);
}

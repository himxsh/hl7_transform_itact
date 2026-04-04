const token = import.meta.env.VITE_OPERATOR_TOKEN;

export function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const headers = {
    ...(init?.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const opts = { ...init, headers };
  return fetch(input, opts);
}

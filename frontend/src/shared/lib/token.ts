const TOKEN_KEY = "f1kz_token";

// The auth cookie is third-party in production (frontend and backend sit on
// different *.vercel.app sites, which browsers treat as cross-site), so it gets
// dropped and the session dies on reload. The token is mirrored here and sent
// as an Authorization header instead, which no browser policy blocks.
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage disabled (private mode / blocked) — the cookie is the only path left
  }
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // nothing to do
  }
}

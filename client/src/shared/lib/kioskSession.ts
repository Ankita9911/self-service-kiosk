const KIOSK_TOKEN_COOKIE = "kiosk_token";
const KIOSK_LANDING_KEY = "kiosk_landing";

interface LandingConfig {
  landingImage: string | null;
  landingTitle: string | null;
  landingSubtitle: string | null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  const prefix = `${name}=`;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function setKioskToken(token: string) {
  // JWT is issued for 6h in backend device auth service
  setCookie(KIOSK_TOKEN_COOKIE, token, 6 * 60 * 60);
}

export function getKioskToken(): string | null {
  const token = getCookie(KIOSK_TOKEN_COOKIE);
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "KIOSK_DEVICE") return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return token;
  } catch {
    return null;
  }
}

export function clearKioskToken() {
  deleteCookie(KIOSK_TOKEN_COOKIE);
}

export function setKioskLandingConfig(data: LandingConfig) {
  localStorage.setItem(KIOSK_LANDING_KEY, JSON.stringify(data));
}

export function getKioskLandingConfig(): LandingConfig {
  try {
    const raw = localStorage.getItem(KIOSK_LANDING_KEY);
    if (!raw) return { landingImage: null, landingTitle: null, landingSubtitle: null };
    return JSON.parse(raw) as LandingConfig;
  } catch {
    return { landingImage: null, landingTitle: null, landingSubtitle: null };
  }
}

export function clearKioskSession() {
  clearKioskToken();
  localStorage.removeItem(KIOSK_LANDING_KEY);
}

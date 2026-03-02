const COOKIE_NAME = "geofast_scans";
const DAILY_LIMIT = 3;

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseCookie(): { date: string; count: number } {
  if (typeof document === "undefined") return { date: "", count: 0 };

  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (!match) return { date: getTodayKey(), count: 0 };

  try {
    const [date, countStr] = match.split("=")[1].split(":");
    const count = parseInt(countStr, 10);
    if (date !== getTodayKey()) return { date: getTodayKey(), count: 0 };
    return { date, count: isNaN(count) ? 0 : count };
  } catch {
    return { date: getTodayKey(), count: 0 };
  }
}

function setCookie(date: string, count: number): void {
  if (typeof document === "undefined") return;

  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);
  const expires = midnight.toUTCString();

  document.cookie = `${COOKIE_NAME}=${date}:${count}; expires=${expires}; path=/; SameSite=Lax`;
}

export function canScan(): boolean {
  const { count } = parseCookie();
  return count < DAILY_LIMIT;
}

export function getRemainingScans(): number {
  const { count } = parseCookie();
  return Math.max(0, DAILY_LIMIT - count);
}

export function incrementScanCount(): void {
  const { date, count } = parseCookie();
  setCookie(date, count + 1);
}

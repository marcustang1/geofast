const COOKIE_NAME = "geofast_trial";
const LIFETIME_LIMIT = 3;

function parseCookie(): number {
  if (typeof document === "undefined") return 0;

  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (!match) return 0;

  try {
    const count = parseInt(match.split("=")[1], 10);
    return isNaN(count) ? 0 : count;
  } catch {
    return 0;
  }
}

function setCookie(count: number): void {
  if (typeof document === "undefined") return;
  const farFuture = new Date(2099, 11, 31).toUTCString();
  document.cookie = `${COOKIE_NAME}=${count}; expires=${farFuture}; path=/; SameSite=Lax`;
}

export function canScanTrial(): boolean {
  return parseCookie() < LIFETIME_LIMIT;
}

export function getRemainingTrials(): number {
  return Math.max(0, LIFETIME_LIMIT - parseCookie());
}

export function incrementTrialCount(): void {
  setCookie(parseCookie() + 1);
}

export function playAlarm(times = 3) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const ROUND = 1.1; 
    for (let r = 0; r < times; r++) {
      const base = r * ROUND;
      for (const t of [0, 0.32, 0.64]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime + base + t);
        osc.frequency.linearRampToValueAtTime(1100, ctx.currentTime + base + t + 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime + base + t);
        gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + base + t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + base + t + 0.28);
        osc.start(ctx.currentTime + base + t);
        osc.stop(ctx.currentTime + base + t + 0.3);
      }
    }
    setTimeout(() => ctx.close().catch(() => {}), (times * ROUND + 1) * 1000);
  } catch (e) {
    console.error('Audio check failed', e);
  }
}

const NOTIF_STORAGE_KEY = 'incubapp-notifications';

export function loadNotifications(): any[] {
  try {
    const v = localStorage.getItem(NOTIF_STORAGE_KEY);
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(list: any[]) {
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list));
}

export async function getActiveSW(): Promise<ServiceWorker | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return reg.active;
  } catch {
    return null;
  }
}

export async function scheduleViaSW(notif: any) {
  const sw = await getActiveSW();
  sw?.postMessage({ type: 'SCHEDULE_NOTIFICATION', notification: notif });
}

export async function cancelViaSW(notifId: string) {
  const sw = await getActiveSW();
  sw?.postMessage({ type: 'CANCEL_NOTIFICATION', notifId });
}

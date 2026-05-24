let ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gain = 0.12, delay = 0) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);
    gainNode.gain.setValueAtTime(0.001, ac.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(gain, ac.currentTime + delay + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.05);
  } catch {}
}
export function soundTap() {
  playTone(880, 0.1, 'sine', 0.08);
  playTone(1100, 0.08, 'sine', 0.05, 0.06);
}
export function soundCheck() {
  playTone(600, 0.08, 'sine', 0.1);
  playTone(900, 0.12, 'sine', 0.09, 0.05);
  playTone(1200, 0.15, 'sine', 0.06, 0.1);
}
export function soundUncheck() {
  playTone(600, 0.12, 'sine', 0.07);
  playTone(400, 0.1, 'sine', 0.05, 0.07);
}
export function soundTransition() {
  [523, 659, 784, 1047].forEach((f, i) => playTone(f, 0.35, 'sine', 0.07, i * 0.09));
}
export function soundSuccess() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => playTone(f, 0.45, 'sine', 0.09, i * 0.1));
}
export function soundError() {
  playTone(330, 0.18, 'sine', 0.09);
  playTone(311, 0.25, 'sine', 0.07, 0.1);
}
export function soundIntro() {
  playTone(130, 1.5, 'sine', 0.1, 0.3);
  playTone(261, 1.2, 'sine', 0.08, 0.6);
  playTone(329, 1.0, 'sine', 0.06, 0.9);
  playTone(523, 0.8, 'sine', 0.05, 1.2);
  playTone(784, 0.6, 'sine', 0.04, 1.5);
  playTone(1047, 0.5, 'sine', 0.03, 1.8);
}
export function soundIdeaAdded() {
  playTone(784, 0.08, 'sine', 0.09);
  playTone(1047, 0.18, 'sine', 0.07, 0.08);
}

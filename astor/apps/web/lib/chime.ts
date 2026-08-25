/**
 * Sonidos del Pomodoro sintetizados con Web Audio API — libres, sin assets ni
 * red, funcionan offline. Una "campana" al terminar el foco y un chime suave al
 * terminar el descanso.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  return ctx;
}

/** Debe llamarse dentro de un gesto del usuario (click) para desbloquear audio. */
export function primeAudio(): void {
  const ac = getCtx();
  if (ac && ac.state === 'suspended') void ac.resume();
}

function tone(ac: AudioContext, freq: number, start: number, dur: number, gain: number): void {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/** Campana de fin de foco: parciales inarmónicos con decay largo + segundo golpe. */
export function playBell(): void {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();
  const t = ac.currentTime;
  tone(ac, 880, t, 1.7, 0.22);
  tone(ac, 1320, t, 1.2, 0.11);
  tone(ac, 1760, t, 0.9, 0.06);
  tone(ac, 880, t + 0.18, 1.4, 0.13);
}

/** Chime suave de fin de descanso. */
export function playSoftChime(): void {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === 'suspended') void ac.resume();
  const t = ac.currentTime;
  tone(ac, 660, t, 0.9, 0.16);
  tone(ac, 990, t + 0.12, 0.8, 0.09);
}

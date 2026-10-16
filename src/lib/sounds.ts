/**
 * Audio synthesis utility using Web Audio API and SpeechSynthesis.
 * 100% self-contained without needing external audio file downloads.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Daub stamp sound: soft, satisfying pop
 */
export function playDaubSound(isMarking = true) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    if (isMarking) {
      // Bubbly pop up
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } else {
      // Soft downward un-daub
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    }
  } catch (err) {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Ball Draw Sound: Tumbler clatter followed by a chime
 */
export function playBallDrawSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First: tumbler rolling click/rattle
    for (let i = 0; i < 3; i++) {
      const oscRattle = ctx.createOscillator();
      const gainRattle = ctx.createGain();
      oscRattle.type = 'triangle';
      const t = now + i * 0.07;
      oscRattle.frequency.setValueAtTime(400 + Math.random() * 200, t);
      gainRattle.gain.setValueAtTime(0.15, t);
      gainRattle.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      oscRattle.connect(gainRattle);
      gainRattle.connect(ctx.destination);
      oscRattle.start(t);
      oscRattle.stop(t + 0.06);
    }

    // Second: Harmonic chime when ball drops
    const dropTime = now + 0.25;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, dropTime + idx * 0.04);
      gain.gain.setValueAtTime(0.2, dropTime + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, dropTime + idx * 0.04 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(dropTime + idx * 0.04);
      osc.stop(dropTime + idx * 0.04 + 0.5);
    });
  } catch (err) {
    // Audio autoplay restrictions
  }
}

/**
 * Bingo Alert Sound: High energy double alert chime when someone shouts BINGO
 */
export function playBingoAlertSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 880, 1046.5, 1318.5]; // E5, A5, C6, E6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startT = now + idx * 0.09;
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0.35, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startT);
      osc.stop(startT + 0.4);
    });
  } catch (err) {
    // Audio restriction
  }
}

/**
 * Victory fanfare for verified Bingo win!
 */
export function playVictoryFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Triumphant fanfare notes: C5, E5, G5, C6 (extended)
    const melody = [
      { freq: 523.25, duration: 0.15, delay: 0.0 },
      { freq: 659.25, duration: 0.15, delay: 0.15 },
      { freq: 783.99, duration: 0.2, delay: 0.3 },
      { freq: 1046.5, duration: 0.6, delay: 0.5 },
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const startT = now + note.delay;
      osc.frequency.setValueAtTime(note.freq, startT);
      gain.gain.setValueAtTime(0.2, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + note.duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startT);
      osc.stop(startT + note.duration + 0.05);
    });
  } catch (err) {
    // Audio restriction
  }
}

/**
 * Speaks the ball call out loud, e.g. "B 12", using browser speech synthesis
 */
export function speakBall(letter: string, number: number) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(`${letter}... ${number}`);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    // speech synthesis unavailable or disabled
  }
}

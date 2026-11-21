// All sound is synthesised with WebAudio: no audio files, no network.
// A small synth so every find, miss, hint and win has its own voice.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // One oscillator note with an exponential decay envelope.
  tone(freq, at, dur, type, vol) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // A soft filtered noise burst (paper rustle / sparkle tail).
  sparkle(at, dur) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + at;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 5200;
    filter.Q.value = 1.2;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  click() { this.ensure(); this.tone(660, 0, 0.07, 'triangle', 0.25); }

  // Found a difference: bright two-note chime + sparkle.
  found(combo) {
    this.ensure();
    const lift = Math.min(combo, 8) * 18;
    this.tone(523 + lift, 0, 0.16, 'sine', 0.5);
    this.tone(784 + lift, 0.07, 0.22, 'sine', 0.45);
    this.tone(1046 + lift, 0.14, 0.3, 'sine', 0.3);
    this.sparkle(0.05, 0.25);
  }

  // Wrong click: low dull thud.
  miss() {
    this.ensure();
    this.tone(140, 0, 0.18, 'sawtooth', 0.28);
    this.tone(98, 0.02, 0.22, 'square', 0.18);
  }

  // Hint spent: a soft rising whistle.
  hint() {
    this.ensure();
    this.tone(392, 0, 0.12, 'sine', 0.3);
    this.tone(587, 0.1, 0.16, 'sine', 0.3);
    this.tone(880, 0.2, 0.2, 'sine', 0.25);
  }

  // Level complete: little ascending fanfare.
  win() {
    this.ensure();
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((n, i) => this.tone(n, i * 0.11, 0.3, 'triangle', 0.4));
    this.sparkle(0.3, 0.5);
  }

  // Clock running low: two warning ticks.
  tick() { this.ensure(); this.tone(880, 0, 0.06, 'square', 0.15); }
}

import { STEPS } from '../scene/timeline.js';

export class LuxurySoundtrack {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.streamDest = null;
    this.muted = false;
    this.voiceEnabled = false;
    this.isPlaying = false;
    this.nextNoteTime = 0;
    this.stepIndex = 0;
    this.lastSpokenStepId = -1;
    this.timerId = null;

    // Cmaj9 -> Am9 -> Fmaj9 -> G6 gentle luxury progression
    this.chords = [
      [261.63, 329.63, 392.0, 493.88, 587.33],
      [220.0, 261.63, 329.63, 392.0, 493.88],
      [174.61, 220.0, 261.63, 329.63, 392.0],
      [196.0, 246.94, 293.66, 329.63, 440.0],
    ];
  }

  ensureContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : 0.42;

    this.streamDest = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.connect(this.streamDest);
  }

  getAudioTrack() {
    this.ensureContext();
    return this.streamDest.stream.getAudioTracks()[0] || null;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.42, this.ctx.currentTime, 0.08);
    }
    if (muted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled;
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.lastSpokenStepId = -1;
  }

  playPianoNote(freq, when, duration = 2.6, volume = 0.14) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, when);
    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq * 2, when);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1450, when);
    filter.frequency.exponentialRampToValueAtTime(420, when + duration);

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(volume, when + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0008, when + duration);

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0.18;

    osc.connect(filter);
    sub.connect(subGain);
    subGain.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(when);
    sub.start(when);
    osc.stop(when + duration + 0.05);
    sub.stop(when + duration + 0.05);
  }

  playPadChord(chord, when) {
    if (!this.ctx || !this.masterGain) return;
    for (const f of chord.slice(0, 3)) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * 0.5, when);

      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.linearRampToValueAtTime(0.032, when + 0.9);
      gain.gain.linearRampToValueAtTime(0.0008, when + 3.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(when);
      osc.stop(when + 3.7);
    }
  }

  playChime(when) {
    if (!this.ctx || !this.masterGain) return;
    const notes = [1174.66, 1567.98, 2093.0];
    notes.forEach((f, idx) => {
      const t = when + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.025, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 1.8);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.9);
    });
  }

  scheduler() {
    if (!this.isPlaying || !this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + 0.35) {
      const chordIdx = Math.floor(this.stepIndex / 4) % this.chords.length;
      const noteIdx = this.stepIndex % 5;
      const chord = this.chords[chordIdx];

      if (this.stepIndex % 4 === 0) {
        this.playPadChord(chord, this.nextNoteTime);
      }
      if (this.stepIndex % 8 === 0) {
        this.playChime(this.nextNoteTime);
      }
      this.playPianoNote(chord[noteIdx], this.nextNoteTime, 2.4, 0.11);

      this.nextNoteTime += 0.85;
      this.stepIndex += 1;
    }
  }

  start() {
    this.ensureContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.timerId = window.setInterval(() => this.scheduler(), 120);
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.lastSpokenStepId = -1;
  }

  syncVoiceover(time) {
    if (!this.voiceEnabled || this.muted || !('speechSynthesis' in window)) return;
    const step = STEPS.find((s) => time >= s.start && time < s.end);
    if (!step || step.id === this.lastSpokenStepId) return;
    this.lastSpokenStepId = step.id;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(step.voiceover);
    utter.rate = 0.92;
    utter.pitch = 1.04;
    utter.volume = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const female =
      voices.find((v) => /en/i.test(v.lang) && /(zira|aria|jenny|samantha|victoria|female|natural)/i.test(v.name)) ||
      voices.find((v) => /en/i.test(v.lang));
    if (female) utter.voice = female;
    window.speechSynthesis.speak(utter);
  }
}

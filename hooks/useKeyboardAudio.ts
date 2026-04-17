'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useKeyboardAudio
 *
 * Synthesized mechanical-keyboard keystrokes via Web Audio. Mirrors the
 * lifecycle/mute/rate-limit pattern of useGameAudio but targets a tactile,
 * "thocky" keyboard feel:
 *   - layer 1: a very short band-passed noise burst (the switch "click"),
 *   - layer 2: a damped low-mid triangle (the keycap "thock"),
 *   - small per-keystroke pitch + velocity jitter to avoid "machine gun".
 *
 * Browsers require a user gesture before an AudioContext can play audio.
 * Call `ensureAudio()` inside the user's first gesture handler, then
 * `playKey(kind)` per character. No assets; no network; no new deps.
 */

export type KeyKind = 'char' | 'space' | 'punct' | 'enter' | 'backspace';

export function useKeyboardAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const isMutedRef = useRef(false);
  const userStartedRef = useRef(false);
  const lastPlayedAtRef = useRef<number>(-Infinity);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const ensureGraph = useCallback((ctx: AudioContext) => {
    if (masterGainRef.current && compressorRef.current && noiseBufferRef.current) return;

    // (sources) -> master -> compressor -> destination
    const master = ctx.createGain();
    master.gain.value = 0.55;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 10;
    comp.ratio.value = 5;
    comp.attack.value = 0.002;
    comp.release.value = 0.1;

    master.connect(comp);
    comp.connect(ctx.destination);

    // Small reusable white-noise buffer for the click transient.
    const noiseDur = 0.12;
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * noiseDur)), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    masterGainRef.current = master;
    compressorRef.current = comp;
    noiseBufferRef.current = buf;
  }, []);

  const ensureAudio = useCallback(async () => {
    try {
      if (userStartedRef.current && audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        ensureGraph(audioContextRef.current);
        return audioContextRef.current;
      }
      const Ctx =
        typeof window !== 'undefined'
          ? window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
          : null;
      if (!Ctx) return null;
      if (!audioContextRef.current) {
        audioContextRef.current = new Ctx();
      }
      userStartedRef.current = true;
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      ensureGraph(audioContextRef.current);
      return audioContextRef.current;
    } catch {
      // resume() rejected (usually: called outside a live user-activation
      // task on Safari/Chromium). Reset so the next real gesture retries
      // creation/resume cleanly instead of staying in a half-initialised
      // state that silently drops every keystroke.
      userStartedRef.current = false;
      return null;
    }
  }, [ensureGraph]);

  // ── First-gesture unlock (document-level, one-shot) ───────────────
  // The per-handler unlock in Hero only catches gestures that land on the
  // hero scroller. If the user's very first interaction is on the nav, a
  // CTA, or elsewhere, the AudioContext would otherwise get constructed
  // later from a setTimeout in TypedLine — outside any user-activation
  // window — and Safari/Chromium silently refuse to resume it. Listening
  // at the document in capture phase guarantees we catch the first real
  // gesture regardless of where it lands, then self-removes.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const unlock = () => {
      void ensureAudio();
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };
    document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
    document.addEventListener('touchstart', unlock, { capture: true, passive: true });
    document.addEventListener('keydown', unlock, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };
  }, [ensureAudio]);

  const toggleMute = useCallback(() => {
    void ensureAudio();
    setIsMuted((m) => !m);
  }, [ensureAudio]);

  const playKey = useCallback(
    async (kind: KeyKind = 'char') => {
      if (isMutedRef.current) return;
      const ctx = await ensureAudio();
      if (!ctx) return;

      // Min gap between keystrokes so fast typing cannot pile up.
      const now = performance.now();
      if (now - lastPlayedAtRef.current < 20) return;
      lastPlayedAtRef.current = now;

      const master = masterGainRef.current;
      const noiseBuf = noiseBufferRef.current;
      if (!master || !noiseBuf) return;

      // Per-keystroke profile — tuned by kind, with small random jitter.
      const jitter = (amt: number) => (Math.random() * 2 - 1) * amt;

      // thock body params
      let bodyFreq = 190;
      let bodyEnd = 120;
      let bodyDur = 0.045;
      let bodyVol = 0.09;

      // click transient params
      let clickDur = 0.006;
      let clickVol = 0.07;
      let clickBand = 2600; // band-pass center (Hz)
      let clickQ = 1.4;

      switch (kind) {
        case 'space':
          bodyFreq = 130;
          bodyEnd = 85;
          bodyDur = 0.06;
          bodyVol = 0.11;
          clickBand = 1800;
          clickVol = 0.05;
          break;
        case 'punct':
          bodyFreq = 210;
          bodyEnd = 150;
          bodyDur = 0.04;
          bodyVol = 0.085;
          clickBand = 3200;
          clickVol = 0.08;
          break;
        case 'enter':
          bodyFreq = 160;
          bodyEnd = 95;
          bodyDur = 0.07;
          bodyVol = 0.105;
          clickBand = 2200;
          clickVol = 0.075;
          clickQ = 1.6;
          break;
        case 'backspace':
          bodyFreq = 175;
          bodyEnd = 110;
          bodyDur = 0.05;
          bodyVol = 0.085;
          clickBand = 2400;
          clickVol = 0.06;
          break;
        case 'char':
        default:
          break;
      }

      // Apply pitch + velocity jitter.
      const pJ = 1 + jitter(0.08);
      bodyFreq *= pJ;
      bodyEnd *= pJ;
      const vJ = 1 + jitter(0.12);
      bodyVol = Math.max(0.02, bodyVol * vJ);
      clickVol = Math.max(0.015, clickVol * vJ);
      clickDur = Math.max(0.003, clickDur + jitter(0.002));

      const t0 = ctx.currentTime;

      // ── Layer 1: click transient (band-passed noise burst) ─────────
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = clickBand + jitter(180);
      bp.Q.value = clickQ;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, t0);
      noiseGain.gain.linearRampToValueAtTime(clickVol, t0 + 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + clickDur);

      noise.connect(bp);
      bp.connect(noiseGain);
      noiseGain.connect(master);
      noise.start(t0);
      noise.stop(t0 + clickDur + 0.01);

      // ── Layer 2: thock body (damped triangle) ──────────────────────
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(bodyFreq, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, bodyEnd), t0 + bodyDur * 0.9);

      // Low-pass shapes the thock so it's felt more than heard.
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1400 + jitter(200);
      lp.Q.value = 0.7;

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(0.0001, t0);
      bodyGain.gain.linearRampToValueAtTime(bodyVol, t0 + 0.004);
      bodyGain.gain.exponentialRampToValueAtTime(0.0005, t0 + bodyDur);

      osc.connect(lp);
      lp.connect(bodyGain);
      bodyGain.connect(master);
      osc.start(t0);
      osc.stop(t0 + bodyDur + 0.02);
    },
    [ensureAudio],
  );

  return { playKey, ensureAudio, isMuted, toggleMute };
}

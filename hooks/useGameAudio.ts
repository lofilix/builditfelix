'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type SoundType = 'chomp' | 'cardOpen' | 'cardClose' | 'complete' | 'navigate' | 'select' | 'back';

export function useGameAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const isMutedRef = useRef(false);
  const userStartedRef = useRef(false);
  const lastPlayedAtRef = useRef<Partial<Record<SoundType, number>>>({});
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const ensureGraph = useCallback((ctx: AudioContext) => {
    if (masterGainRef.current && compressorRef.current) return;

    // Master chain: (sources) -> masterGain -> compressor -> destination
    // - masterGain: consistent overall loudness + mute scaling
    // - compressor: prevents loudness spikes from overlapping sounds
    const master = ctx.createGain();
    master.gain.value = 0.75;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 12;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.12;

    master.connect(comp);
    comp.connect(ctx.destination);

    masterGainRef.current = master;
    compressorRef.current = comp;
  }, []);

  const ensureAudio = useCallback(async () => {
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
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
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
  }, [ensureGraph]);

  const toggleMute = useCallback(() => {
    void ensureAudio();
    setIsMuted((m) => !m);
  }, [ensureAudio]);

  const playSound = useCallback(
    async (type: SoundType) => {
      if (isMutedRef.current) return;
      const ctx = await ensureAudio();
      if (!ctx) return;

      // Rate-limit repeated triggers (prevents perceived loudness jumps on rapid step changes).
      const now = performance.now();
      const minIntervalMs: Partial<Record<SoundType, number>> = {
        chomp: 90,
        navigate: 80,
        select: 120,
        back: 120,
        cardOpen: 140,
        cardClose: 140,
        complete: 250,
      };
      const last = lastPlayedAtRef.current[type] ?? -Infinity;
      const min = minIntervalMs[type] ?? 0;
      if (now - last < min) return;
      lastPlayedAtRef.current[type] = now;

      const master = masterGainRef.current;
      if (!master) return;

      const tone = (
        freq: number,
        endFreq: number,
        dur: number,
        wave: OscillatorType = 'square',
        vol = 0.12,
        delay = 0,
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(master);
        osc.type = wave;
        const t0 = ctx.currentTime + delay;
        osc.frequency.setValueAtTime(freq, t0);
        osc.frequency.exponentialRampToValueAtTime(
          endFreq,
          t0 + dur * 0.8,
        );
        // Small attack to avoid clicks, controlled decay to keep loudness consistent.
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          t0 + dur,
        );
        osc.start(t0);
        osc.stop(t0 + dur);
      };

      // Normalize levels: keep everything within a tight loudness band.
      // (final output is still governed by the master gain + compressor)
      const V = {
        chomp: 0.11,
        navigate: 0.075,
        ui: 0.08, // cardOpen/select
        uiLow: 0.07, // cardClose/back
        complete: 0.085,
      } as const;

      switch (type) {
        case 'chomp':
          tone(560, 170, 0.095, 'square', V.chomp);
          break;
        case 'cardOpen':
        case 'select':
          tone(320, 620, 0.18, 'sine', V.ui);
          break;
        case 'cardClose':
        case 'back':
          tone(520, 240, 0.14, 'sine', V.uiLow);
          break;
        case 'navigate':
          tone(420, 540, 0.08, 'square', V.navigate);
          break;
        case 'complete':
          [400, 500, 700].forEach((freq, i) => {
            tone(freq, freq * 1.08, 0.18, 'square', V.complete, i * 0.14);
          });
          break;
      }
    },
    [ensureAudio],
  );

  return { playSound, ensureAudio, isMuted, toggleMute };
}

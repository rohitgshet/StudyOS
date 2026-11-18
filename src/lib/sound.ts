// Web Audio API Sound Synthesizer for Focus Mode & Timers
class SoundService {
  private ctx: AudioContext | null = null;
  private ambientNode: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Soft chime for timer completion
  playTimerComplete() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Two-tone harmonic bell (880Hz -> 1320Hz)
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.2, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(587.33, now, 0.8);        // D5
      playTone(880.00, now + 0.15, 1.2);  // A5
      playTone(1174.66, now + 0.35, 1.6); // D6
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Soft click for buttons/toggles
  playTick() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore audio failure
    }
  }

  // Ambient sound synthesizer
  startAmbient(type: 'rain' | 'whitenoise' | 'binaural' | 'waves', volume = 0.2) {
    this.stopAmbient();
    try {
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      this.ambientGain = gain;

      if (type === 'binaural') {
        // Alpha wave (10 Hz binaural beat)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(216, ctx.currentTime); // 216 Hz soothing focus tone
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        this.ambientNode = osc;
      } else {
        // Noise-based: rain, white noise
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain') {
            // Brown/Pink filtered noise
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
          } else {
            // Soft white noise
            data[i] = white * 0.15;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        // Filter for warmth
        const filter = ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(type === 'rain' ? 800 : 1200, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        this.ambientNode = noise;
      }

      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Ambient audio error', e);
    }
  }

  setAmbientVolume(volume: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientNode) {
      try {
        (this.ambientNode as AudioScheduledSourceNode).stop?.();
        this.ambientNode.disconnect();
      } catch {
        // ignore
      }
      this.ambientNode = null;
    }
    this.isAmbientPlaying = false;
  }

  getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying;
  }
}

export const sound = new SoundService();

// Simple audio manager using Web Audio API and system sounds
class AudioManager {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.isEnabled = false;
    }
  }

  // Create a simple beep sound
  private createBeep(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.audioContext || !this.isEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play countdown beep (higher pitch)
  playCountdownBeep() {
    this.createBeep(800, 0.2, 0.4);
  }

  // Play start signal (lower, longer beep)
  playStartBeep() {
    this.createBeep(400, 0.5, 0.5);
  }

  // Play rest signal (mid-range beep)
  playRestBeep() {
    this.createBeep(600, 0.3, 0.4);
  }

  // Play completion signal (ascending tones)
  playCompletionSound() {
    setTimeout(() => this.createBeep(400, 0.2, 0.4), 0);
    setTimeout(() => this.createBeep(500, 0.2, 0.4), 150);
    setTimeout(() => this.createBeep(600, 0.4, 0.4), 300);
  }

  // Enable/disable audio
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Resume audio context if suspended (required for some browsers)
  async resumeAudio() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

export const audioManager = new AudioManager();
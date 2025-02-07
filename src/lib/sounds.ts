class SoundPlayer {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled = true;
  private isClient = false;

  constructor() {
    // Check if we're in the browser environment
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.init();
    }
  }

  private init() {
    if (!this.isClient) return;

    this.sounds = {
      message: new Audio('/sounds/message.mp3'),
      send: new Audio('/sounds/send.mp3'),
      error: new Audio('/sounds/error.mp3'),
      command: new Audio('/sounds/command.mp3'),
    };

    // Preload sounds
    Object.values(this.sounds).forEach(audio => {
      audio.load();
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  play(sound: keyof typeof this.sounds) {
    if (!this.isClient || !this.enabled) return;
    
    const audio = this.sounds[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }
}

// Export a singleton instance
export const soundPlayer = new SoundPlayer(); 
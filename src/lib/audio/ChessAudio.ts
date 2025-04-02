/**
 * Chess sound effects service
 */

// Define sound types
export enum ChessSoundType {
  CAPTURE = 'capture',
  CASTLE = 'castle',
  GAME_START = 'game-start',
  ILLEGAL = 'illegal',
  MOVE_CHECK = 'move-check',
  MOVE = 'move',
  NOTIFY = 'notify',
  PROMOTE = 'promote'
}

// Singleton audio service
class ChessAudioService {
  private static instance: ChessAudioService;
  private readonly soundCache: Map<ChessSoundType, HTMLAudioElement>;
  private muted: boolean = false;

  private constructor() {
    this.soundCache = new Map();
    this.preloadSounds();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ChessAudioService {
    if (!ChessAudioService.instance) {
      ChessAudioService.instance = new ChessAudioService();
    }
    return ChessAudioService.instance;
  }

  /**
   * Preload all audio files
   */
  private preloadSounds(): void {
    Object.values(ChessSoundType).forEach(soundType => {
      const audio = new Audio(`/assets/sounds/${soundType}.webm`);
      audio.preload = 'auto';
      this.soundCache.set(soundType as ChessSoundType, audio);
    });
  }

  /**
   * Play a chess sound
   */
  public playSound(soundType: ChessSoundType): void {
    if (this.muted) return;

    const sound = this.soundCache.get(soundType);
    if (sound) {
      // Reset and play from beginning
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error(`Error playing sound: ${soundType}`, error);
      });
    }
  }

  /**
   * Mute/unmute all sounds
   */
  public toggleMute(mute?: boolean): boolean {
    if (mute !== undefined) {
      this.muted = mute;
    } else {
      this.muted = !this.muted;
    }
    return this.muted;
  }

  /**
   * Check if audio is muted
   */
  public isMuted(): boolean {
    return this.muted;
  }
}

// Export singleton instance
export const chessAudio = ChessAudioService.getInstance(); 
const BLACKLIST_STORAGE_KEY = 'hiit-app-blacklisted-exercises';

export class BlacklistStorage {
  static getBlacklistedExercises(): string[] {
    try {
      const stored = localStorage.getItem(BLACKLIST_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load blacklisted exercises:', error);
    }
    return [];
  }

  static addToBlacklist(exerciseId: string): void {
    const blacklisted = this.getBlacklistedExercises();
    if (!blacklisted.includes(exerciseId)) {
      blacklisted.push(exerciseId);
      this.saveBlacklist(blacklisted);
    }
  }

  static removeFromBlacklist(exerciseId: string): void {
    const blacklisted = this.getBlacklistedExercises();
    const filtered = blacklisted.filter(id => id !== exerciseId);
    this.saveBlacklist(filtered);
  }

  static isBlacklisted(exerciseId: string): boolean {
    return this.getBlacklistedExercises().includes(exerciseId);
  }

  static clearBlacklist(): void {
    this.saveBlacklist([]);
  }

  private static saveBlacklist(blacklisted: string[]): void {
    try {
      localStorage.setItem(BLACKLIST_STORAGE_KEY, JSON.stringify(blacklisted));
    } catch (error) {
      console.warn('Failed to save blacklisted exercises:', error);
    }
  }
}
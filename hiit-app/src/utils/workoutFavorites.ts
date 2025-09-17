const DURATION_FAVORITE_KEY = 'hiit-app-favorite-duration';
const DIFFICULTY_FAVORITE_KEY = 'hiit-app-favorite-difficulty';
const EXERCISE_COUNT_FAVORITE_KEY = 'hiit-app-favorite-exercise-count';

export interface WorkoutFavorites {
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  exerciseCount?: number;
}

export class WorkoutFavoritesManager {
  static getFavoriteDuration(): number | null {
    try {
      const saved = localStorage.getItem(DURATION_FAVORITE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error reading favorite duration:', error);
      return null;
    }
  }

  static setFavoriteDuration(duration: number): void {
    try {
      localStorage.setItem(DURATION_FAVORITE_KEY, JSON.stringify(duration));
    } catch (error) {
      console.error('Error saving favorite duration:', error);
    }
  }

  static clearFavoriteDuration(): void {
    try {
      localStorage.removeItem(DURATION_FAVORITE_KEY);
    } catch (error) {
      console.error('Error clearing favorite duration:', error);
    }
  }

  static getFavoriteDifficulty(): 'easy' | 'medium' | 'hard' | null {
    try {
      const saved = localStorage.getItem(DIFFICULTY_FAVORITE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error reading favorite difficulty:', error);
      return null;
    }
  }

  static setFavoriteDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    try {
      localStorage.setItem(DIFFICULTY_FAVORITE_KEY, JSON.stringify(difficulty));
    } catch (error) {
      console.error('Error saving favorite difficulty:', error);
    }
  }

  static clearFavoriteDifficulty(): void {
    try {
      localStorage.removeItem(DIFFICULTY_FAVORITE_KEY);
    } catch (error) {
      console.error('Error clearing favorite difficulty:', error);
    }
  }

  static getFavoriteExerciseCount(): number | null {
    try {
      const saved = localStorage.getItem(EXERCISE_COUNT_FAVORITE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error reading favorite exercise count:', error);
      return null;
    }
  }

  static setFavoriteExerciseCount(exerciseCount: number): void {
    try {
      localStorage.setItem(EXERCISE_COUNT_FAVORITE_KEY, JSON.stringify(exerciseCount));
    } catch (error) {
      console.error('Error saving favorite exercise count:', error);
    }
  }

  static clearFavoriteExerciseCount(): void {
    try {
      localStorage.removeItem(EXERCISE_COUNT_FAVORITE_KEY);
    } catch (error) {
      console.error('Error clearing favorite exercise count:', error);
    }
  }

  static getAllFavorites(): WorkoutFavorites {
    return {
      duration: this.getFavoriteDuration(),
      difficulty: this.getFavoriteDifficulty(),
      exerciseCount: this.getFavoriteExerciseCount()
    };
  }

  static clearAllFavorites(): void {
    this.clearFavoriteDuration();
    this.clearFavoriteDifficulty();
    this.clearFavoriteExerciseCount();
  }
}
const INSTRUCTION_PREFERENCE_KEY = 'hiit-app-instructions-visible';

export class InstructionPreferences {
  static getInstructionsVisible(): boolean {
    try {
      const saved = localStorage.getItem(INSTRUCTION_PREFERENCE_KEY);
      return saved ? JSON.parse(saved) : false; // Default to hidden
    } catch (error) {
      console.error('Error reading instruction preferences:', error);
      return false;
    }
  }

  static setInstructionsVisible(visible: boolean): void {
    try {
      localStorage.setItem(INSTRUCTION_PREFERENCE_KEY, JSON.stringify(visible));
    } catch (error) {
      console.error('Error saving instruction preferences:', error);
    }
  }
}
import { BlacklistStorage } from '../blacklistStorage';
import { mockLocalStorageForTests, setLocalStorageItem, expectLocalStorageToContain } from '../../__tests__/utils/storage-test-utils';

describe('BlacklistStorage', () => {
  mockLocalStorageForTests();

  describe('getBlacklistedExercises', () => {
    it('returns empty array when no exercises are blacklisted', () => {
      const result = BlacklistStorage.getBlacklistedExercises();
      expect(result).toEqual([]);
    });

    it('returns blacklisted exercises from localStorage', () => {
      const blacklisted = ['1', '2', '3'];
      setLocalStorageItem('hiit-app-blacklisted-exercises', blacklisted);

      const result = BlacklistStorage.getBlacklistedExercises();
      expect(result).toEqual(blacklisted);
    });

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('hiit-app-blacklisted-exercises', 'invalid-json');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = BlacklistStorage.getBlacklistedExercises();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load blacklisted exercises:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('addToBlacklist', () => {
    it('adds exercise to blacklist when list is empty', () => {
      BlacklistStorage.addToBlacklist('1');

      expectLocalStorageToContain('hiit-app-blacklisted-exercises', ['1']);
    });

    it('adds exercise to existing blacklist', () => {
      setLocalStorageItem('hiit-app-blacklisted-exercises', ['1', '2']);

      BlacklistStorage.addToBlacklist('3');

      expectLocalStorageToContain('hiit-app-blacklisted-exercises', ['1', '2', '3']);
    });

    it('does not add duplicate exercises', () => {
      setLocalStorageItem('hiit-app-blacklisted-exercises', ['1', '2']);

      BlacklistStorage.addToBlacklist('1');

      expectLocalStorageToContain('hiit-app-blacklisted-exercises', ['1', '2']);
    });

    it('handles localStorage write errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock localStorage.setItem to throw an error
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      BlacklistStorage.addToBlacklist('1');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save blacklisted exercises:', expect.any(Error));

      consoleSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe('removeFromBlacklist', () => {
    it('removes exercise from blacklist', () => {
      setLocalStorageItem('hiit-app-blacklisted-exercises', ['1', '2', '3']);

      BlacklistStorage.removeFromBlacklist('2');

      expectLocalStorageToContain('hiit-app-blacklisted-exercises', ['1', '3']);
    });

    it('handles removing non-existent exercise', () => {
      setLocalStorageItem('hiit-app-blacklisted-exercises', ['1', '2']);

      BlacklistStorage.removeFromBlacklist('3');

      expectLocalStorageToContain('hiit-app-blacklisted-exercises', ['1', '2']);
    });

    it('handles empty blacklist', () => {
      BlacklistStorage.removeFromBlacklist('1');

      expectLocalStorageToContain('hiit-app-blacklisted-exercises', []);
    });
  });

  describe('isBlacklisted', () => {
    it('returns true for blacklisted exercise', () => {
      setLocalStorageItem('hiit-app-blacklisted-exercises', ['1', '2', '3']);

      expect(BlacklistStorage.isBlacklisted('2')).toBe(true);
    });

    it('returns false for non-blacklisted exercise', () => {
      setLocalStorageItem('hiit-app-blacklisted-exercises', ['1', '2', '3']);

      expect(BlacklistStorage.isBlacklisted('4')).toBe(false);
    });

    it('returns false when blacklist is empty', () => {
      expect(BlacklistStorage.isBlacklisted('1')).toBe(false);
    });
  });

  describe('clearBlacklist', () => {
    it('clears all blacklisted exercises', () => {
      setLocalStorageItem('hiit-app-blacklisted-exercises', ['1', '2', '3']);

      BlacklistStorage.clearBlacklist();

      expectLocalStorageToContain('hiit-app-blacklisted-exercises', []);
    });

    it('handles clearing empty blacklist', () => {
      BlacklistStorage.clearBlacklist();

      expectLocalStorageToContain('hiit-app-blacklisted-exercises', []);
    });
  });
});
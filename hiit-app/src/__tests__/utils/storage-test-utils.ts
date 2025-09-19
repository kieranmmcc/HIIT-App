// Storage testing utilities

export const mockLocalStorageForTests = () => {
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterAll(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
  });
};

export const setLocalStorageItem = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorageItem = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const clearLocalStorage = () => {
  localStorage.clear();
};

// Verify localStorage operations
export const expectLocalStorageToContain = (key: string, value: any) => {
  const stored = getLocalStorageItem(key);
  expect(stored).toEqual(value);
};

export const expectLocalStorageToBeEmpty = () => {
  expect(localStorage.length).toBe(0);
};

// Test to ensure utilities work correctly
describe('Storage Test Utils', () => {
  it('should mock localStorage correctly', () => {
    expect(localStorage).toBeDefined();
    expect(typeof localStorage.setItem).toBe('function');
    expect(typeof localStorage.getItem).toBe('function');
  });
});
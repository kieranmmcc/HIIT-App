describe('Test Framework Setup', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to localStorage mock', () => {
    expect(localStorage).toBeDefined();
    expect(typeof localStorage.getItem).toBe('function');
  });

  it('should have access to jest matchers', () => {
    expect(jest).toBeDefined();
    expect(typeof jest.fn).toBe('function');
  });
});
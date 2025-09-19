# HIIT App Testing Framework

A comprehensive testing framework for the HIIT App built with Jest, React Testing Library, and TypeScript.

## Setup

The testing framework is already configured and ready to use. Dependencies include:

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction testing
- **ts-jest**: TypeScript support for Jest

## Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

## Test Structure

```
src/
├── __tests__/
│   ├── utils/
│   │   ├── test-utils.tsx          # Shared test utilities
│   │   └── storage-test-utils.ts   # localStorage testing helpers
│   ├── App.test.tsx                # App component tests
│   └── simple.test.ts              # Basic setup verification
├── components/
│   └── __tests__/
│       ├── AvoidedExercises.test.tsx
│       └── WorkoutSetup.test.tsx
├── utils/
│   └── __tests__/
│       ├── blacklistStorage.test.ts
│       ├── warmupGenerator.test.ts
│       └── workoutGenerator.test.ts
└── setupTests.ts                   # Global test setup
```

## Test Utilities

### Component Test Utilities (`src/__tests__/utils/test-utils.tsx`)

```typescript
import { render, createMockExercise, createMockHandlers } from '../__tests__/utils/test-utils';

// Custom render with providers
render(<Component />);

// Mock data factories
const exercise = createMockExercise({ name: 'Custom Exercise' });
const handlers = createMockHandlers();
```

### Storage Test Utilities (`src/__tests__/utils/storage-test-utils.ts`)

```typescript
import { mockLocalStorageForTests, setLocalStorageItem } from '../__tests__/utils/storage-test-utils';

describe('Component with localStorage', () => {
  mockLocalStorageForTests(); // Sets up localStorage mocking

  it('stores data', () => {
    setLocalStorageItem('key', { data: 'value' });
    // Test localStorage interactions
  });
});
```

## Writing Tests

### Component Testing Example

```typescript
import { screen, fireEvent } from '@testing-library/react';
import { render, createMockHandlers } from '../../__tests__/utils/test-utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  const mockHandlers = createMockHandlers();

  it('renders correctly', () => {
    render(<MyComponent onAction={mockHandlers.onAction} />);

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<MyComponent onAction={mockHandlers.onAction} />);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(mockHandlers.onAction).toHaveBeenCalledTimes(1);
  });
});
```

### Utility Function Testing Example

```typescript
import { myUtilFunction } from '../myUtils';
import { mockLocalStorageForTests } from '../../__tests__/utils/storage-test-utils';

describe('myUtilFunction', () => {
  mockLocalStorageForTests();

  it('performs expected operation', () => {
    const result = myUtilFunction('input');
    expect(result).toEqual('expected output');
  });

  it('handles edge cases', () => {
    expect(() => myUtilFunction(null)).not.toThrow();
  });
});
```

## Mock Configuration

The test framework includes pre-configured mocks for:

- **localStorage**: Full localStorage API with jest.fn() methods
- **window.scrollTo**: Prevents actual scrolling during tests
- **window.matchMedia**: Media query matching for responsive components
- **IntersectionObserver**: Intersection observation for scroll-based components

## Test Coverage

Run `npm run test:coverage` to generate a coverage report. Coverage includes:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

Coverage reports are generated in the `coverage/` directory.

## Best Practices

### 1. Use Descriptive Test Names
```typescript
// ✅ Good
it('should add exercise to blacklist when not already present', () => {});

// ❌ Avoid
it('should work', () => {});
```

### 2. Arrange, Act, Assert Pattern
```typescript
it('should remove exercise from avoid list', () => {
  // Arrange
  const exerciseId = '123';
  setLocalStorageItem('blacklist', [exerciseId]);

  // Act
  BlacklistStorage.removeFromBlacklist(exerciseId);

  // Assert
  expect(BlacklistStorage.isBlacklisted(exerciseId)).toBe(false);
});
```

### 3. Test User Behavior, Not Implementation
```typescript
// ✅ Good - tests user interaction
it('shows success message when form is submitted', async () => {
  render(<ContactForm />);

  await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// ❌ Avoid - tests implementation details
it('calls setState when button is clicked', () => {
  // Testing internal implementation
});
```

### 4. Use Mock Data Factories
```typescript
// Create reusable mock data with overrides
const mockWorkout = createMockWorkout({
  difficulty: 'hard',
  duration: 30
});
```

### 5. Clean Up After Tests
```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Already configured in setupTests.ts
});

afterEach(() => {
  // Clean up any test-specific state
});
```

## Running Specific Tests

```bash
# Run specific test file
npm test -- AvoidedExercises.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should add exercise"

# Run tests in specific directory
npm test -- src/utils/__tests__/

# Debug tests with Node.js debugger
npm test -- --inspect-brk --runInBand
```

## Continuous Integration

The `npm run test:ci` command is optimized for CI environments:
- Runs without watch mode
- Generates coverage reports
- Exits with appropriate status codes
- Includes verbose output for debugging

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Ensure all imports use correct relative paths
2. **"localStorage is not defined"**: Use the provided localStorage mocking utilities
3. **"window is not defined"**: Add necessary window mocks to setupTests.ts
4. **TypeScript errors**: Check that test files are included in tsconfig.test.json

### Debug Mode

To debug tests in VS Code:
1. Set breakpoints in your test files
2. Run tests with `--inspect-brk` flag
3. Use VS Code's Node.js debugger to connect

## Contributing

When adding new components or utilities:

1. Create corresponding test files
2. Use existing test utilities and patterns
3. Maintain good test coverage (aim for >80%)
4. Update this documentation if adding new testing patterns

## Example Test Files

The framework includes comprehensive example tests for:

- **AvoidedExercises.test.tsx**: Component testing with user interactions
- **blacklistStorage.test.ts**: Utility function testing with localStorage
- **warmupGenerator.test.ts**: Algorithm testing with mock data
- **App.test.tsx**: Integration testing with routing

These serve as templates for writing additional tests in the application.
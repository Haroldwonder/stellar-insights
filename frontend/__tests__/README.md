# Error Boundary Tests

This directory contains tests for the error boundary components.

## Test Files

- `ChartErrorBoundary.test.tsx` - Tests for chart error boundary
- `WebSocketErrorBoundary.test.tsx` - Tests for WebSocket error boundary

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The tests verify:

1. **Error Catching:** Error boundaries catch errors thrown by child components
2. **Fallback Rendering:** Appropriate fallback UI is displayed when errors occur
3. **Custom Fallbacks:** Custom fallback components are rendered when provided
4. **Error Callbacks:** `onError` callbacks are invoked with error details
5. **Retry Functionality:** Retry/reconnect buttons reset the error state
6. **Development Mode:** Error details are shown in development
7. **Production Mode:** Error details are hidden in production

## Test Structure

Each test file follows this structure:

```tsx
describe('ComponentName', () => {
  // Setup and teardown
  beforeAll(() => { /* ... */ });
  afterAll(() => { /* ... */ });

  // Test cases
  it('renders children when there is no error', () => { /* ... */ });
  it('catches errors and displays fallback UI', () => { /* ... */ });
  it('displays custom fallback when provided', () => { /* ... */ });
  it('calls onError callback when error is caught', () => { /* ... */ });
  it('resets error state when retry button is clicked', () => { /* ... */ });
  it('shows error message in development mode', () => { /* ... */ });
  it('hides error message in production mode', () => { /* ... */ });
});
```

## Adding New Tests

When adding new error boundary components, follow this pattern:

1. Create a test file: `__tests__/YourErrorBoundary.test.tsx`
2. Import necessary testing utilities
3. Create a component that throws errors for testing
4. Write tests covering all scenarios
5. Run tests to verify they pass

## Dependencies

The tests use:
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM
- `jest` - Test runner and assertion library

## Notes

- Console errors are suppressed during tests for cleaner output
- Tests use `jest.fn()` to mock callbacks
- Environment variables are temporarily modified to test dev/prod behavior

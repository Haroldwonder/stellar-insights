import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WebSocketErrorBoundary } from '@/components/WebSocketErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('WebSocket connection failed');
  }
  return <div>Connected</div>;
};

describe('WebSocketErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <WebSocketErrorBoundary>
        <div>WebSocket Component</div>
      </WebSocketErrorBoundary>
    );

    expect(screen.getByText('WebSocket Component')).toBeInTheDocument();
  });

  it('catches errors and displays fallback UI', () => {
    render(
      <WebSocketErrorBoundary componentName="Live Updates">
        <ThrowError shouldThrow={true} />
      </WebSocketErrorBoundary>
    );

    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to establish connection for Live Updates')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reconnect/i })).toBeInTheDocument();
  });

  it('displays custom fallback when provided', () => {
    const customFallback = <div>Custom Connection Error</div>;

    render(
      <WebSocketErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </WebSocketErrorBoundary>
    );

    expect(screen.getByText('Custom Connection Error')).toBeInTheDocument();
    expect(screen.queryByText('Connection Error')).not.toBeInTheDocument();
  });

  it('calls onError callback when error is caught', () => {
    const onError = jest.fn();

    render(
      <WebSocketErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </WebSocketErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('WebSocket connection failed');
  });

  it('resets error state when reconnect button is clicked', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      return (
        <WebSocketErrorBoundary>
          <button onClick={() => setShouldThrow(false)}>Fix Connection</button>
          <ThrowError shouldThrow={shouldThrow} />
        </WebSocketErrorBoundary>
      );
    };

    render(<TestComponent />);

    // Error should be caught
    expect(screen.getByText('Connection Error')).toBeInTheDocument();

    // Click reconnect button
    const reconnectButton = screen.getByRole('button', { name: /reconnect/i });
    fireEvent.click(reconnectButton);

    // Component should attempt to re-render
  });

  it('shows error message in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <WebSocketErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WebSocketErrorBoundary>
    );

    expect(screen.getByText('WebSocket connection failed')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides error message in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <WebSocketErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WebSocketErrorBoundary>
    );

    expect(screen.queryByText('WebSocket connection failed')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('displays generic message when componentName is not provided', () => {
    render(
      <WebSocketErrorBoundary>
        <ThrowError shouldThrow={true} />
      </WebSocketErrorBoundary>
    );

    expect(screen.getByText('Unable to establish real-time connection')).toBeInTheDocument();
  });
});

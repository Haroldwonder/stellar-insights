# Error Boundary Usage Guide

This document explains how to use the granular error boundaries to prevent component-level errors from crashing the entire application.

## Available Error Boundaries

### 1. ChartErrorBoundary
Use for chart components and data visualization components.

**Location:** `src/components/ChartErrorBoundary.tsx`

**Features:**
- Catches rendering errors in chart components
- Shows a safe fallback UI with retry button
- Logs errors only in development mode
- Accepts optional custom fallback and error handler

### 2. WebSocketErrorBoundary
Use for WebSocket connections and real-time data components.

**Location:** `src/components/WebSocketErrorBoundary.tsx`

**Features:**
- Catches errors in WebSocket handlers and real-time components
- Shows connection error fallback with reconnect button
- Logs errors only in development mode
- Accepts optional custom fallback and error handler

### 3. ErrorBoundary (Root)
The root-level error boundary that catches all unhandled errors.

**Location:** `src/components/ErrorBoundary.tsx`

**Note:** Do NOT modify this component. It serves as the final safety net.

## Usage Examples

### Wrapping Chart Components

```tsx
import { ChartErrorBoundary } from '@/components/ChartErrorBoundary';
import { LiquidityChart } from '@/components/charts/LiquidityChart';

export function DashboardPage() {
  return (
    <div>
      <ChartErrorBoundary chartName="Liquidity Chart">
        <LiquidityChart data={liquidityData} />
      </ChartErrorBoundary>

      <ChartErrorBoundary chartName="TVL Chart">
        <TVLChart data={tvlData} />
      </ChartErrorBoundary>
    </div>
  );
}
```

### Wrapping WebSocket Components

```tsx
import { WebSocketErrorBoundary } from '@/components/WebSocketErrorBoundary';
import { WebSocketDemo } from '@/components/WebSocketDemo';

export function LiveUpdatesPage() {
  return (
    <WebSocketErrorBoundary componentName="Live Updates">
      <WebSocketDemo />
    </WebSocketErrorBoundary>
  );
}
```

### Using Custom Fallback UI

```tsx
import { ChartErrorBoundary } from '@/components/ChartErrorBoundary';

const customFallback = (
  <div className="p-4 text-center">
    <p>Unable to load chart. Please try again later.</p>
  </div>
);

export function CustomFallbackExample() {
  return (
    <ChartErrorBoundary fallback={customFallback}>
      <MyChart />
    </ChartErrorBoundary>
  );
}
```

### Using Error Handler Callback

```tsx
import { ChartErrorBoundary } from '@/components/ChartErrorBoundary';

export function ErrorHandlerExample() {
  const handleChartError = (error: Error, errorInfo: ErrorInfo) => {
    // Send error to monitoring service
    console.error('Chart error:', error);
    // Could send to Sentry, LogRocket, etc.
  };

  return (
    <ChartErrorBoundary onError={handleChartError}>
      <MyChart />
    </ChartErrorBoundary>
  );
}
```

## Components That Should Be Wrapped

### High Priority (Must Wrap)

1. **All Chart Components:**
   - `LiquidityChart`
   - `TVLChart`
   - `CorridorHeatmap`
   - `ReliabilityTrend`
   - `SettlementLatencyChart`
   - `TopCorridors`

2. **WebSocket Components:**
   - `WebSocketDemo`
   - Any component using `useWebSocket` hook
   - Any component using `useSnapshotUpdates`, `useCorridorUpdates`, or `useAnchorUpdates`

3. **Data-Heavy Components:**
   - Components that fetch large amounts of data
   - Components with complex data transformations
   - Components that depend on external APIs

### Medium Priority (Should Wrap)

1. **Dashboard Sections:**
   - Individual dashboard cards
   - Metric displays
   - Data tables

2. **Async Components:**
   - Components with async data fetching
   - Components with Suspense boundaries

## Best Practices

1. **Granular Wrapping:** Wrap individual components rather than entire pages to isolate errors.

2. **Meaningful Names:** Always provide `chartName` or `componentName` props for better error messages.

3. **Custom Fallbacks:** Use custom fallbacks for critical UI sections that need specific messaging.

4. **Error Monitoring:** Use the `onError` callback to send errors to monitoring services in production.

5. **Development vs Production:** Error boundaries automatically hide detailed error messages in production.

6. **Don't Over-Wrap:** Don't wrap every single component. Focus on:
   - Components that render external data
   - Components with complex logic
   - Components that have historically caused errors

## Testing

Tests are located in `__tests__/` directory:
- `ChartErrorBoundary.test.tsx`
- `WebSocketErrorBoundary.test.tsx`

Run tests with:
```bash
npm test
```

## Migration Checklist

- [ ] Install test dependencies: `npm install`
- [ ] Wrap all chart components with `ChartErrorBoundary`
- [ ] Wrap WebSocket components with `WebSocketErrorBoundary`
- [ ] Wrap high-risk async/data-fetch components
- [ ] Add error monitoring callbacks where needed
- [ ] Run tests to verify error boundaries work
- [ ] Test in development mode to see error details
- [ ] Test in production mode to verify error details are hidden

## Example: Complete Dashboard Implementation

```tsx
import { ChartErrorBoundary } from '@/components/ChartErrorBoundary';
import { WebSocketErrorBoundary } from '@/components/WebSocketErrorBoundary';
import { LiquidityChart } from '@/components/charts/LiquidityChart';
import { TVLChart } from '@/components/charts/TVLChart';
import { LiveMetrics } from '@/components/LiveMetrics';

export function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Chart 1 */}
      <ChartErrorBoundary chartName="Liquidity Chart">
        <LiquidityChart data={liquidityData} />
      </ChartErrorBoundary>

      {/* Chart 2 */}
      <ChartErrorBoundary chartName="TVL Chart">
        <TVLChart data={tvlData} />
      </ChartErrorBoundary>

      {/* Live Updates */}
      <WebSocketErrorBoundary componentName="Live Metrics">
        <LiveMetrics />
      </WebSocketErrorBoundary>
    </div>
  );
}
```

## Troubleshooting

### Error boundary not catching errors
- Make sure the error boundary is a parent of the component throwing the error
- Error boundaries only catch errors in child components, not in themselves
- Error boundaries don't catch errors in event handlers (use try-catch for those)

### Retry button not working
- The retry button resets the error boundary state
- If the underlying issue isn't fixed, the error will occur again
- Consider implementing exponential backoff or disabling retry after multiple attempts

### Errors still crashing the app
- Check that you're using class components for error boundaries (functional components can't be error boundaries)
- Verify the error boundary is properly imported and used
- Check browser console for any errors in the error boundary itself

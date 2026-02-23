# Error Boundary Implementation Example

This file shows how to wrap existing components with the new error boundaries.

## Example 1: Dashboard Page with Error Boundaries

Here's how to update `src/app/dashboard/page.tsx`:

```tsx
"use client"

import React, { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CorridorHealth } from '@/components/dashboard/CorridorHealth';
import { LiquidityChart } from '@/components/dashboard/LiquidityChart';
import { TopAssetsTable } from '@/components/dashboard/TopAssetsTable';
import { SettlementSpeedChart } from '@/components/dashboard/SettlementSpeedChart';
import { ChartErrorBoundary } from '@/components/ChartErrorBoundary';

// ... (keep existing interfaces and component logic)

export default function DashboardPage() {
  // ... (keep existing state and useEffect)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Network Overview</h2>
      </div>

      {/* KPI Cards - these are simple and don't need error boundaries */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Payment Success Rate"
          value={`${data.kpi.successRate.value}%`}
          trend={data.kpi.successRate.trend}
          trendDirection={data.kpi.successRate.trendDirection}
        />
        {/* ... other metric cards */}
      </div>

      {/* Charts Row 1 - WRAPPED WITH ERROR BOUNDARIES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 transition-all duration-300 hover:shadow-md">
          <ChartErrorBoundary chartName="Liquidity Chart">
            <LiquidityChart data={data.liquidity} />
          </ChartErrorBoundary>
        </div>
        <div className="col-span-3 transition-all duration-300 hover:shadow-md">
          <ChartErrorBoundary chartName="Corridor Health">
            <CorridorHealth corridors={data.corridors} />
          </ChartErrorBoundary>
        </div>
      </div>

      {/* Charts Row 2 - WRAPPED WITH ERROR BOUNDARIES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-3 transition-all duration-300 hover:shadow-md">
          <ChartErrorBoundary chartName="Settlement Speed Chart">
            <SettlementSpeedChart data={data.settlement} />
          </ChartErrorBoundary>
        </div>
        <div className="col-span-4 transition-all duration-300 hover:shadow-md">
          <ChartErrorBoundary chartName="Top Assets Table">
            <TopAssetsTable assets={data.assets} />
          </ChartErrorBoundary>
        </div>
      </div>
    </div>
  );
}
```

## Example 2: WebSocket Demo with Error Boundary

Here's how to wrap the WebSocket demo component:

```tsx
// In the page that uses WebSocketDemo
import { WebSocketDemo } from '@/components/WebSocketDemo';
import { WebSocketErrorBoundary } from '@/components/WebSocketErrorBoundary';

export default function WebSocketPage() {
  return (
    <div>
      <WebSocketErrorBoundary componentName="WebSocket Demo">
        <WebSocketDemo />
      </WebSocketErrorBoundary>
    </div>
  );
}
```

## Example 3: Individual Chart Components

For pages that use individual chart components from `src/components/charts/`:

```tsx
import { LiquidityChart } from '@/components/charts/LiquidityChart';
import { TVLChart } from '@/components/charts/TVLChart';
import { CorridorHeatmap } from '@/components/charts/CorridorHeatmap';
import { ChartErrorBoundary } from '@/components/ChartErrorBoundary';

export function AnalyticsPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartErrorBoundary chartName="Liquidity Chart">
        <LiquidityChart data={liquidityData} />
      </ChartErrorBoundary>

      <ChartErrorBoundary chartName="TVL Chart">
        <TVLChart data={tvlData} />
      </ChartErrorBoundary>

      <ChartErrorBoundary chartName="Corridor Heatmap">
        <CorridorHeatmap data={heatmapData} />
      </ChartErrorBoundary>
    </div>
  );
}
```

## Example 4: Custom Error Handler

For production monitoring integration:

```tsx
import { ChartErrorBoundary } from '@/components/ChartErrorBoundary';
import { LiquidityChart } from '@/components/charts/LiquidityChart';

export function MonitoredChart() {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Send to monitoring service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  };

  return (
    <ChartErrorBoundary 
      chartName="Liquidity Chart"
      onError={handleError}
    >
      <LiquidityChart data={liquidityData} />
    </ChartErrorBoundary>
  );
}
```

## Example 5: Custom Fallback UI

For branded error messages:

```tsx
import { ChartErrorBoundary } from '@/components/ChartErrorBoundary';
import { AlertCircle } from 'lucide-react';

const CustomFallback = (
  <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-lg">
    <AlertCircle className="w-12 h-12 text-blue-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Chart Temporarily Unavailable</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
      We're experiencing issues loading this chart. Our team has been notified and is working on a fix.
    </p>
  </div>
);

export function BrandedChart() {
  return (
    <ChartErrorBoundary fallback={CustomFallback}>
      <LiquidityChart data={liquidityData} />
    </ChartErrorBoundary>
  );
}
```

## Components to Wrap

### Priority 1: Charts (Use ChartErrorBoundary)
- ✅ `src/components/charts/LiquidityChart.tsx`
- ✅ `src/components/charts/TVLChart.tsx`
- ✅ `src/components/charts/CorridorHeatmap.tsx`
- ✅ `src/components/charts/ReliabilityTrend.tsx`
- ✅ `src/components/charts/SettlementLatencyChart.tsx`
- ✅ `src/components/charts/TopCorridors.tsx`
- ✅ `src/components/dashboard/LiquidityChart.tsx`
- ✅ `src/components/dashboard/SettlementSpeedChart.tsx`
- ✅ `src/components/dashboard/CorridorHealth.tsx`

### Priority 2: WebSocket Components (Use WebSocketErrorBoundary)
- ✅ `src/components/WebSocketDemo.tsx`
- ✅ Any component using `useWebSocket` hook
- ✅ Any component using `useSnapshotUpdates`
- ✅ Any component using `useCorridorUpdates`
- ✅ Any component using `useAnchorUpdates`

### Priority 3: Data-Heavy Components (Use ChartErrorBoundary)
- ✅ `src/components/dashboard/TopAssetsTable.tsx`
- ✅ Any component with complex data transformations
- ✅ Any component fetching from external APIs

## Testing the Implementation

1. **Test Error Catching:**
   ```tsx
   // Temporarily add this to a chart component to test
   if (Math.random() > 0.5) {
     throw new Error('Test error');
   }
   ```

2. **Test Retry Functionality:**
   - Trigger an error
   - Click the "Retry" button
   - Verify the component attempts to re-render

3. **Test Development vs Production:**
   - In development: Error details should be visible
   - In production: Error details should be hidden

4. **Run Automated Tests:**
   ```bash
   npm test
   ```

## Migration Steps

1. ✅ Create error boundary components
2. ✅ Create tests for error boundaries
3. ✅ Add test dependencies to package.json
4. ⏳ Wrap all chart components
5. ⏳ Wrap all WebSocket components
6. ⏳ Wrap data-heavy components
7. ⏳ Add error monitoring callbacks (optional)
8. ⏳ Test in development
9. ⏳ Test in production build
10. ⏳ Deploy and monitor

## Notes

- The root `ErrorBoundary` remains unchanged as the final safety net
- Error boundaries only catch errors during rendering, not in event handlers
- Use try-catch blocks for async operations and event handlers
- Consider adding error boundaries at multiple levels for better isolation

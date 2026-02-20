# Corridor Comparison Tool Documentation

## Overview

The Corridor Comparison Tool allows users to compare multiple payment corridors side-by-side, making it easier to make informed decisions about which corridor to use for their transactions.

## Features

### 1. Multi-Corridor Selection
- Compare 2-4 corridors simultaneously
- Add/remove corridors dynamically
- Visual pills showing selected corridors
- URL-based corridor selection for sharing

### 2. Side-by-Side Metrics Display
- **Success Rate**: Payment success percentage
- **Health Score**: Overall corridor health (0-100)
- **Average Latency**: Transaction processing time
- **Liquidity Depth**: Available liquidity in USD
- **24h Volume**: Trading volume in last 24 hours
- **Average Slippage**: Price slippage in basis points

### 3. Visual Indicators
- 🏆 **Trophy Icon**: Best performing metric
- ⚠️ **Warning Icon**: Worst performing metric
- 📈 **Trending Up**: Above average performance
- 📉 **Trending Down**: Below average performance
- ➖ **Neutral**: Average performance

### 4. Synchronized Charts
- **Success Rate Timeline**: Historical success rates over 30 days
- **Volume Comparison**: Bar chart showing volume trends
- **Slippage Trends**: Line chart tracking slippage over time
- All charts synchronized with same time periods

### 5. Comparison Table
- Sortable columns for all metrics
- Color-coded cells (green for best, red for worst)
- Performance indicators for each metric
- Sticky header and first column for easy navigation

### 6. Export Functionality
- Export comparison data to CSV format
- Includes all key metrics
- Timestamped filename
- Ready for spreadsheet analysis

### 7. Shareable Links
- URL contains selected corridor IDs
- Copy link to clipboard with one click
- Share comparisons with team members
- Persistent comparison state

### 8. Best Time to Transact
- Recommendations for optimal transaction timing
- Based on historical data analysis
- Corridor-specific suggestions
- Reasons for recommendations

## Usage

### Accessing the Comparison Tool

Navigate to `/corridors/compare` or click "Compare" from the corridors listing page.

### Adding Corridors

1. Click the "Add Corridor" button
2. Enter the corridor ID (e.g., "USDC-XLM")
3. Click "Add" or press Enter
4. The corridor will be added to the comparison

### Removing Corridors

Click the "X" button on any corridor pill to remove it from the comparison.

### Sharing Comparisons

1. Click the "Share" button in the header
2. The URL will be copied to your clipboard
3. Share the URL with others
4. Recipients will see the same comparison

### Exporting Data

1. Click the "Export CSV" button
2. A CSV file will be downloaded
3. Open in Excel, Google Sheets, or any spreadsheet application
4. Analyze the data further

## URL Structure

```
/corridors/compare?ids=USDC-XLM,EURC-PHP,USDC-NGN
```

- `ids`: Comma-separated list of corridor IDs
- Maximum 4 corridors
- IDs are case-sensitive

## Component Architecture

### Main Components

1. **ComparePage** (`/app/corridors/compare/page.tsx`)
   - Main comparison page
   - Handles state management
   - Coordinates all sub-components

2. **CorridorComparisonTable** (`/components/CorridorComparisonTable.tsx`)
   - Detailed metrics table
   - Sorting functionality
   - Performance indicators
   - Export functionality

3. **CorridorCompareCards** (`/components/corridors/CorridorCompareCards.tsx`)
   - Visual metric cards
   - Quick overview of key metrics
   - Health score indicators

4. **CorridorCompareCharts** (`/components/corridors/CorridorCompareCharts.tsx`)
   - Success rate timeline
   - Volume comparison
   - Slippage trends

5. **BestTimeToTransact** (`/components/corridors/CorridorCompareCards.tsx`)
   - Transaction timing recommendations
   - Based on historical patterns

## Data Flow

```
User Selection → URL Update → API Fetch → Data Processing → Visualization
```

1. User selects corridors
2. URL is updated with corridor IDs
3. API fetches corridor details
4. Data is processed and compared
5. Visualizations are rendered

## Metrics Explained

### Success Rate
- Percentage of successful transactions
- Higher is better
- Target: >90%

### Health Score
- Composite score of multiple factors
- Range: 0-100
- Factors: success rate, latency, liquidity, volume

### Average Latency
- Time from submission to confirmation
- Measured in milliseconds
- Lower is better
- Target: <500ms

### Liquidity Depth
- Total available liquidity in the corridor
- Measured in USD
- Higher is better
- Affects slippage and large transactions

### 24h Volume
- Total transaction volume in last 24 hours
- Measured in USD
- Indicates corridor activity
- Higher volume = more liquidity

### Average Slippage
- Price difference from expected
- Measured in basis points (bps)
- Lower is better
- Target: <20 bps

## Performance Indicators

### Color Coding
- **Green Background**: Best performing metric
- **Red Background**: Worst performing metric
- **White Background**: Average performance

### Icons
- **Trophy (🏆)**: Best in category
- **Warning (⚠️)**: Worst in category
- **Trending Up (📈)**: Above average (top 80%)
- **Trending Down (📉)**: Below average (bottom 30%)
- **Neutral (➖)**: Average performance

## Best Practices

### Selecting Corridors
1. Choose corridors with similar asset pairs
2. Compare corridors you're considering using
3. Include at least 2 corridors for meaningful comparison
4. Don't exceed 4 corridors (becomes cluttered)

### Interpreting Results
1. Look for consistent patterns across metrics
2. Consider your specific use case (speed vs. cost)
3. Check historical trends, not just current values
4. Pay attention to health scores

### Making Decisions
1. Prioritize success rate for reliability
2. Consider latency for time-sensitive transactions
3. Check liquidity for large transactions
4. Review slippage for cost optimization

## API Integration

### Endpoints Used
- `GET /api/corridors/:id` - Fetch corridor details
- Returns: `CorridorDetailData` including metrics and historical data

### Data Structure
```typescript
interface CorridorDetailData {
  corridor: CorridorMetrics;
  historical_success_rate: SuccessRateDataPoint[];
  latency_distribution: LatencyDataPoint[];
  liquidity_trends: LiquidityDataPoint[];
  historical_volume: VolumeDataPoint[];
  historical_slippage: SlippageDataPoint[];
  related_corridors?: CorridorMetrics[];
}
```

## CSV Export Format

```csv
Corridor,Success Rate (%),Health Score,Avg Latency (ms),Liquidity Depth (USD),24h Volume (USD),Avg Slippage (bps),Total Attempts,Successful,Failed
USDC-XLM,94.50,92.0,487,6200000.00,850000.00,12.50,1678,1552,126
EURC-PHP,88.30,85.0,520,4500000.00,620000.00,18.20,1200,1060,140
```

## Responsive Design

- **Desktop**: Full table with all columns visible
- **Tablet**: Horizontal scroll for table, stacked charts
- **Mobile**: Optimized card view, simplified table

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators
- ARIA labels

## Future Enhancements

- [ ] Save comparison presets
- [ ] Email comparison reports
- [ ] PDF export
- [ ] Historical comparison (compare same corridor over time)
- [ ] Advanced filtering options
- [ ] Custom metric selection
- [ ] Comparison alerts (notify when metrics change)
- [ ] Integration with wallet for direct transactions

## Troubleshooting

### Corridors Not Loading
- Check network connection
- Verify corridor IDs are correct
- Check browser console for errors
- Try refreshing the page

### Export Not Working
- Ensure browser allows downloads
- Check popup blocker settings
- Try a different browser

### Charts Not Displaying
- Ensure JavaScript is enabled
- Check browser compatibility
- Clear browser cache

## Support

For issues or feature requests, please:
1. Check existing documentation
2. Search for similar issues
3. Create a new issue with details
4. Include browser and version information
# Network Switcher Documentation

## Overview

The Network Switcher feature allows users to switch between Stellar Mainnet and Testnet environments. This is essential for developers who want to test their applications on testnet before deploying to mainnet.

## Features

- **Visual Network Indicator**: Clear indication of current network with color coding
- **Easy Switching**: Dropdown interface to switch between networks
- **Warning System**: Confirmation dialog when switching networks
- **Persistent Configuration**: Network preference stored in environment variables
- **Separate Data**: Each network maintains its own data and connections

## Backend Implementation

### Network Configuration

The backend uses environment variables to configure network settings:

```env
# Network Configuration
STELLAR_NETWORK=mainnet
STELLAR_RPC_URL_MAINNET=https://stellar.api.onfinality.io/public
STELLAR_HORIZON_URL_MAINNET=https://horizon.stellar.org
STELLAR_RPC_URL_TESTNET=https://soroban-testnet.stellar.org
STELLAR_HORIZON_URL_TESTNET=https://horizon-testnet.stellar.org
```

### Network Module

- `backend/src/network.rs`: Core network configuration and types
- `backend/src/api/network.rs`: API endpoints for network management
- Network-aware RPC client initialization

### API Endpoints

- `GET /api/network/info`: Get current network information
- `GET /api/network/available`: Get list of available networks
- `POST /api/network/switch`: Request network switch (requires restart)

## Frontend Implementation

### Components

- `NetworkSwitcher.tsx`: Main network switcher component
- Integrated into header layout for easy access
- Visual indicators with network-specific colors

### Features

- **Network Status**: Shows current network with colored indicator
- **Network Selection**: Dropdown with available networks
- **Warning Modal**: Confirmation dialog for network switches
- **Error Handling**: Graceful handling of network API failures

### Usage

```tsx
import { NetworkSwitcher } from '@/components/NetworkSwitcher';

<NetworkSwitcher 
  onNetworkChange={(network) => {
    console.log('Switched to:', network.display_name);
  }}
/>
```

## Network Colors

- **Mainnet**: `#00D4AA` (Stellar Green)
- **Testnet**: `#FF6B35` (Orange)

## Data Separation

Each network maintains separate:
- Database connections (if configured)
- Cache entries
- RPC endpoints
- Historical data
- User preferences

## Security Considerations

- Network switching requires server restart for security
- Environment variables control network configuration
- Clear warnings when switching from mainnet to testnet
- Separate data prevents accidental mainnet operations on testnet

## Development Workflow

1. **Development**: Use testnet for development and testing
2. **Testing**: Validate features on testnet before mainnet deployment
3. **Production**: Switch to mainnet for production use
4. **Debugging**: Switch back to testnet for issue reproduction

## Configuration Examples

### Mainnet Configuration
```env
STELLAR_NETWORK=mainnet
STELLAR_RPC_URL_MAINNET=https://stellar.api.onfinality.io/public
STELLAR_HORIZON_URL_MAINNET=https://horizon.stellar.org
```

### Testnet Configuration
```env
STELLAR_NETWORK=testnet
STELLAR_RPC_URL_TESTNET=https://soroban-testnet.stellar.org
STELLAR_HORIZON_URL_TESTNET=https://horizon-testnet.stellar.org
```

## API Response Examples

### Current Network Info
```json
{
  "network": "mainnet",
  "display_name": "Stellar Mainnet",
  "rpc_url": "https://stellar.api.onfinality.io/public",
  "horizon_url": "https://horizon.stellar.org",
  "network_passphrase": "Public Global Stellar Network ; September 2015",
  "color": "#00D4AA",
  "is_mainnet": true,
  "is_testnet": false
}
```

### Available Networks
```json
[
  {
    "network": "mainnet",
    "display_name": "Stellar Mainnet",
    "color": "#00D4AA",
    "is_mainnet": true,
    "is_testnet": false
  },
  {
    "network": "testnet",
    "display_name": "Stellar Testnet",
    "color": "#FF6B35",
    "is_mainnet": false,
    "is_testnet": true
  }
]
```

## Testing

Run the network tests:
```bash
cd backend
cargo test network_test
```

## Limitations

- Network switching requires server restart
- Cannot switch networks dynamically without restart
- Environment variables must be updated manually
- Data is not automatically migrated between networks

## Future Enhancements

- Dynamic network switching without restart
- Network-specific database configurations
- Automatic data migration tools
- Network health monitoring
- Custom network configurations
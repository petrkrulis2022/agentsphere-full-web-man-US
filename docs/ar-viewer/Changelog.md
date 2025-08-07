# Changelog

All notable changes to the AR Viewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-08-02

### 🔧 Fixed - Critical Database Connection Issues

- **Fixed** critical fallback logic preventing real agent display
  - Issue: Marketplace showing only 3 mock agents instead of 56 real database agents
  - Solution: Enhanced `useDatabase.js` to attempt Supabase queries even when configuration check fails
  - Result: All 56 real agents now load successfully from database
- **Enhanced** location radius from 50km to 100km for global agent coverage
- **Improved** debug logging to track database connection status and fallback triggers

### 🚀 Enhanced Database Schema Integration

- **Added** comprehensive support for 25+ new database fields:
  - `deployer_wallet_address` - Real wallet addresses instead of mock data
  - `payment_recipient_address` - Payment destination addresses
  - `agent_wallet_address` - Agent-specific wallet information
  - `token_address`, `token_symbol` - Multi-token support (USDT, USDC, USDs, USBDG+)
  - `interaction_fee` - Dynamic pricing per agent interaction
  - `text_chat`, `voice_chat`, `video_chat` - Communication capability flags
  - `mcp_services` - Model Context Protocol services integration
  - `features` - Extended agent capabilities storage
- **Enhanced** agent type categorization with 11+ new categories:
  - Intelligent Assistant, Local Services, Payment Terminal
  - Game Agent, 3D World Builder, Home Security, Content Creator
  - Tutor Teacher, Social Media, E-commerce, Travel Guide

### 🔗 Multi-Chain Payment System

- **Added** Morph Holesky testnet support (Chain ID: 2810)
  - USDT, USDC, USDs stablecoin integration
  - Decimal precision handling for stablecoins
  - EIP-681 compliant payment URIs
- **Enhanced** wallet display system with copyable addresses
  - Complete wallet information display in `AgentDetailModal.jsx`
  - CopyableField component for easy address copying
  - Real-time wallet balance detection

### 🌍 Location & RTK Integration

- **Added** RTK location service integration (`rtkLocation.js`)
  - GPS device location detection
  - Intelligent fallback to default coordinates (50.64°, 13.83°)
  - 100km radius ensures global agent coverage
- **Enhanced** `getCurrentLocation()` function with comprehensive error handling
- **Fixed** location filtering issues that excluded valid agents

### 🧪 Testing & Development Tools

- **Added** `test-agents-browser.html` for direct database testing
  - Browser-based Supabase connection testing
  - Real-time agent data visualization
  - Enhanced field display including wallet and token information
- **Enhanced** development server configuration
  - Auto-port selection (5177+ range)
  - Environment variable validation
  - Hot module replacement for rapid development

### 📚 Documentation Updates

- **Updated** comprehensive `AR_QR_SYSTEM_README.md` with latest changes
- **Enhanced** troubleshooting guides with database connection solutions
- **Added** multi-chain configuration examples
- **Documented** enhanced schema fields and their purposes

### 🔐 Technical Improvements

- **Enhanced** environment variable configuration
  - Verified `.env` file with Supabase credentials
  - ThirdWeb client integration
  - Assembly AI API key for voice features
- **Improved** error handling and retry logic
- **Optimized** database queries for enhanced schema fields

---

## [1.3.1] - 2025-01-30

### 📚 Documentation

- **Added** comprehensive `docs/Schemas.md` with complete database documentation
  - All table schemas with field descriptions and constraints
  - TypeScript interfaces for data models
  - Database functions and triggers
  - Security policies (RLS) documentation
  - Performance indexes and optimization
  - Common queries and migration scripts
- **Added** complete `docs/API_Documentation.md` with full API coverage
  - Service APIs for QR code generation and payment processing
  - Component APIs with Props interfaces
  - Database hooks and functions
  - Blockchain configuration APIs
  - Authentication and WebSocket documentation
  - Response codes and rate limiting
- **Enhanced** `docs/Memory.md` with updated task completion status
- **Enhanced** `docs/Changelog.md` with documentation completion record

### 🗂️ Project Structure

- **Completed** comprehensive documentation system as requested
- **Organized** all documentation in structured `docs/` folder
- **Improved** maintainability with complete API and schema documentation

---

## [1.3.0] - 2025-07-30

### Added

- **Morph Holesky Testnet Integration**
  - MetaMask wallet support for Morph Holesky (Chain ID: 2810)
  - USDT token payments (1 USDT per transaction)
  - Dynamic recipient address detection from connected wallet
  - EIP-681 compliant QR code generation for token transfers
- **Documentation System**
  - Comprehensive blockchain integration guide (`BLOCKCHAIN_QR_INTEGRATION_GUIDE.md`)
  - Task management memory bank (`Memory.md`)
  - Structured `/docs` folder organization
- **Enhanced Payment Modal**
  - Three-network selection (BlockDAG, Solana, Morph)
  - Network-specific payment instructions
  - Multiple QR format generation for compatibility testing

### Changed

- **QR Code Generation**
  - Fixed QR format to use contract address first for token transfers
  - Updated USDT configuration to use 18 decimals (Morph Holesky specific)
  - Improved mobile wallet compatibility
- **Wallet Integration**
  - Enhanced `UnifiedWalletConnect` with three-column layout
  - Added dynamic wallet address detection for payment recipients
  - Improved connection state management across all networks

### Fixed

- **Morph Holesky Payment Issues**
  - Fixed "0 ETH" display issue → now shows "1 USDT" correctly
  - Corrected recipient address from placeholder to connected wallet
  - Fixed decimal calculation (1 USDT = 1×10^18 token units)
  - Resolved "Wrong address format" error in mobile wallets

### Technical Details

- **New Files**:
  - `src/config/morph-holesky-chain.js` - Network configuration
  - `src/components/MorphWalletConnect.jsx` - MetaMask integration
  - `src/services/morphPaymentService.js` - Payment processing
  - `docs/BLOCKCHAIN_QR_INTEGRATION_GUIDE.md` - Integration knowledge base
- **Modified Files**:
  - `src/components/UnifiedWalletConnect.jsx` - Multi-chain support
  - `src/components/EnhancedPaymentQRModal.jsx` - Three-network modal
- **Dependencies**: No new external dependencies added

## [1.2.0] - 2025-07-30

### Added

- **Solana Testnet Integration**
  - Phantom wallet support
  - SOL token payments via Solana Pay standard
  - Solana-specific QR code generation
- **Multi-Chain Architecture**
  - Unified wallet connection interface
  - Network selection in payment modal
  - Chain-specific payment services

### Changed

- Enhanced payment modal with network selection tabs
- Improved AR QR code positioning system

## [1.1.0] - 2025-07-30

### Added

- **BlockDAG Primordial Testnet Integration**
  - USBDG+ token payment support
  - ThirdWeb wallet integration
  - EIP-681 compliant QR codes for blockchain payments

### Changed

- Enhanced payment system with blockchain integration
- Updated agent interaction modal with payment options

## [1.0.0] - 2025-07-30

### Added

- **Initial AR Viewer Implementation**
  - React/Vite development environment
  - Three.js AR scene rendering
  - Agent interaction system
  - Basic payment QR code generation
- **Core Components**
  - AR camera view with agent positioning
  - Interactive 3D agent models
  - Payment modal system
  - QR code display and scanning
- **Database Integration**
  - Supabase backend setup
  - Agent data management
  - Real-time updates

### Technical Foundation

- React 18 with Vite build system
- Three.js for 3D rendering
- Supabase for backend services
- Responsive design for mobile devices

---

## Version History Summary

| Version | Date       | Key Feature          | Impact                    |
| ------- | ---------- | -------------------- | ------------------------- |
| 1.3.0   | 2025-07-30 | Morph Holesky + USDT | 3-blockchain support      |
| 1.2.0   | 2025-07-30 | Solana Integration   | Multi-chain architecture  |
| 1.1.0   | 2025-07-30 | BlockDAG Integration | First blockchain payments |
| 1.0.0   | 2025-07-30 | AR Viewer Foundation | Core AR functionality     |

---

## Upcoming Releases

### [1.4.0] - Planned

- **Production Deployment**
  - Environment configuration
  - SSL setup
  - Domain configuration
- **Enhanced Testing**
  - Unit tests for payment flows
  - Integration tests for blockchain connections
  - E2E tests for AR interactions

### [1.5.0] - Planned

- **Additional Blockchain Networks**
  - Polygon support
  - Arbitrum integration
  - Base network
- **Advanced AR Features**
  - Particle effects
  - Hand gesture controls
  - Voice commands

### [2.0.0] - Future

- **Enterprise Features**
  - Multi-tenant support
  - Advanced analytics
  - White-label solutions
- **Mobile Apps**
  - Native iOS app
  - Native Android app
  - WebXR optimization

---

**Changelog Conventions:**

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes

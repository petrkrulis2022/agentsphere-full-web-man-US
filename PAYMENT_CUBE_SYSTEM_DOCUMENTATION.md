# 💳 AgentSphere Payment Cube System Documentation

## 🎯 Overview

The Payment Cube System is a revolutionary 6-faced payment interface that allows merchants to configure multiple payment methods for their AgentSphere agents. This system creates a 3D interactive cube in AR space where customers can select their preferred payment method.

## 🏗️ System Architecture

### Frontend Components

- **PaymentMethodsSelector**: Main configuration component for selecting payment methods
- **BankDetailsForm**: Reusable form for bank account details entry
- **DeployObject**: Updated main deployment form with payment cube integration

### Database Schema

- **payment_methods**: JSONB column storing enabled payment method configurations
- **payment_config**: JSONB column storing payment-specific configuration data

### Payment Methods (6 Cube Faces)

1. **Crypto QR** - Pure cryptocurrency payments via QR codes
2. **Bank Virtual Card** - Traditional banking virtual card payments
3. **Bank QR** - Bank account QR code payments
4. **Voice Pay** - Voice command-based crypto payments
5. **Sound Pay** - Audio signal-based crypto transfers
6. **Onboard Me to Crypto** - Crypto education and onboarding

## 🔧 Implementation Details

### Database Schema Update

```sql
-- Add payment cube system columns
ALTER TABLE deployed_objects ADD COLUMN payment_methods JSONB DEFAULT '{}';
ALTER TABLE deployed_objects ADD COLUMN payment_config JSONB DEFAULT '{}';

-- Add indexes for efficient queries
CREATE INDEX idx_deployed_objects_payment_methods
ON deployed_objects USING GIN (payment_methods);
```

### Payment Methods JSON Structure

```json
{
  "crypto_qr": {
    "enabled": true,
    "wallet_address": "0x742d35Cc6...",
    "supported_chains": ["ethereum", "blockdag"]
  },
  "bank_virtual_card": {
    "enabled": true,
    "bank_details": {
      "account_holder": "John Doe",
      "account_number": "1234567890",
      "bank_name": "Example Bank",
      "swift_code": "EXMPUS33"
    }
  },
  "bank_qr": {
    "enabled": false,
    "bank_details": null
  },
  "voice_pay": {
    "enabled": true,
    "wallet_address": "0x742d35Cc6..."
  },
  "sound_pay": {
    "enabled": false,
    "wallet_address": null
  },
  "onboard_crypto": {
    "enabled": true
  }
}
```

### Payment Configuration Structure

```json
{
  "usd_fee": 5,
  "revenue_sharing": 70,
  "selected_token": "USDT",
  "cube_enabled": true
}
```

## 🎮 User Experience Flow

### Merchant Configuration (AgentSphere)

1. **Agent Deployment**: Merchant creates agent with basic info
2. **Payment Selection**: Select from 6 payment method checkboxes
3. **Wallet Connection**: Connect wallet for crypto methods
4. **Bank Details**: Enter bank information for traditional methods
5. **Validation**: System validates required information
6. **Deployment**: Agent deployed with payment configuration

### Customer Interaction (AR Viewer)

1. **Agent Discovery**: Customer finds agent in AR space
2. **Payment Trigger**: Customer initiates payment interaction
3. **Cube Display**: 3D payment cube appears showing enabled methods
4. **Method Selection**: Customer rotates cube and selects payment face
5. **Payment Processing**: Selected payment method handles transaction

## 🔐 Validation & Security

### Frontend Validation

- At least one payment method must be selected
- Crypto methods require connected wallet
- Bank methods require complete account details
- SWIFT code format validation
- Account number minimum length validation

### Security Features

- Bank details encrypted in database
- Wallet addresses validated against connected wallet
- Row-level security (RLS) for agent data
- Input sanitization and validation

## 🚀 Integration Points

### AR Viewer Integration

The AR Viewer app reads payment configuration from AgentSphere:

- Queries `deployed_objects.payment_methods` to determine enabled faces
- Creates 3D cube with only enabled payment methods
- Handles payment processing based on selected method
- Real-time updates when merchant changes configuration

### Existing Crypto QR Integration

- Crypto QR payment system integrated as first cube face
- Maintains backward compatibility with existing payments
- Uses existing wallet connection infrastructure

## 📱 Component API Reference

### PaymentMethodsSelector Props

```typescript
interface PaymentMethodsSelectorProps {
  onPaymentMethodsChange: (methods: PaymentMethod) => void;
  connectedWallet?: string | null;
  initialMethods?: PaymentMethod;
}
```

### BankDetailsForm Props

```typescript
interface BankDetailsFormProps {
  onBankDetailsChange: (details: BankDetails) => void;
  paymentType: "virtual_card" | "bank_qr";
  initialDetails?: BankDetails;
}
```

## 🎨 UI/UX Features

### Visual Design

- **Grid Layout**: 3x2 grid for 6 payment methods
- **Color Coding**: Each method has unique color scheme
- **Icons**: Intuitive icons for each payment type
- **Status Indicators**: Connected wallet status and validation feedback

### Responsive Design

- Mobile-first approach
- Adaptive grid layout
- Touch-friendly interactions
- Accessible form controls

### Interactive Elements

- **Checkbox Selection**: Toggle payment methods on/off
- **Conditional Forms**: Bank details forms appear when needed
- **Real-time Validation**: Immediate feedback on form errors
- **Wallet Integration**: Automatic wallet address population

## 🔄 Data Flow

### Configuration Flow

1. **User Input**: Merchant selects payment methods
2. **Validation**: Frontend validates selections and requirements
3. **State Update**: React state manages configuration
4. **Database Storage**: Configuration saved to Supabase
5. **AR Sync**: AR Viewer reads updated configuration

### Payment Flow (Future)

1. **Customer Selection**: Customer chooses payment method in AR
2. **Method Routing**: Selected method routes to appropriate handler
3. **Processing**: Payment processed via selected method
4. **Confirmation**: Transaction confirmation in AR interface

## 🧪 Testing Strategy

### Unit Tests

- Payment method selection logic
- Form validation functions
- Bank details validation
- State management

### Integration Tests

- Complete deployment flow
- Database schema updates
- Wallet connection integration
- Form submission and error handling

### User Acceptance Tests

- End-to-end deployment flow
- Mobile responsive testing
- Error handling scenarios
- AR Viewer integration testing

## 🚀 Future Enhancements

### Phase 2: Advanced Features

- **Payment Processing**: Implement actual payment processing for all methods
- **Analytics**: Payment method usage analytics for merchants
- **Customization**: Custom cube colors and branding
- **Multi-currency**: Support for additional cryptocurrencies

### Phase 3: AR Enhancements

- **Gesture Controls**: Hand gesture payment selection
- **Voice Integration**: Voice-activated payment method selection
- **Haptic Feedback**: Physical feedback for cube interactions
- **3D Animations**: Advanced cube rotation and selection animations

## 📋 Migration Guide

### Existing Agents

- All existing agents automatically get default payment configuration
- Merchants can update payment methods via agent management interface
- Backward compatibility maintained for existing Crypto QR payments

### Database Migration

```sql
-- Apply schema update
\i payment_cube_schema_update.sql

-- Verify new columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'deployed_objects'
AND column_name IN ('payment_methods', 'payment_config');
```

## 🔗 Related Documentation

- [AR Viewer Integration Guide](./AR_Viewer_Integration.md)
- [Crypto QR Payment System](./Crypto_QR_Documentation.md)
- [Database Schema Documentation](./Database_Schema.md)
- [AgentSphere API Reference](./API_Documentation.md)

## 🤝 Contributing

1. Follow React/TypeScript best practices
2. Maintain backward compatibility
3. Add comprehensive tests for new features
4. Update documentation for any changes
5. Test AR Viewer integration before deployment

---

**Success Metrics:**

- ✅ 6 payment methods configurable during deployment
- ✅ Crypto methods require wallet connection
- ✅ Bank methods require account details
- ✅ Configuration stored in database
- ✅ AR Viewer integration ready
- ✅ Mobile responsive design
- ✅ Comprehensive validation
- ✅ Backward compatibility maintained

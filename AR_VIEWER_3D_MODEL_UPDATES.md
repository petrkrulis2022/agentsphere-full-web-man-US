# AR Viewer 3D Model Updates - Summary

## Changes Applied

Updated the AR Viewer to use the **payment terminal 3D model** (PAX A920) for the three renamed payment-related agent types.

### 3D Model Assignments

| Agent Type Value   | Display Label              | 3D Model         | File                    |
| ------------------ | -------------------------- | ---------------- | ----------------------- |
| `content_creator`  | **My Payment Terminal**    | Payment Terminal | `pax-a920_highpoly.glb` |
| `payment_terminal` | **Payment Terminal - POS** | Payment Terminal | `pax-a920_highpoly.glb` |
| `home_security`    | **Virtual ATM**            | Payment Terminal | `pax-a920_highpoly.glb` |

### Code Updates in ARViewer.tsx

#### 1. Updated `getShapeMixin()` function (lines ~197-209)

Added `content_creator` and `home_security` to use payment terminal model:

```typescript
const getShapeMixin = (objectType: string) => {
  // Payment terminals and all payment-related agents use terminal device model
  if (
    objectType === "payment_terminal" ||
    objectType === "trailing_payment_terminal" ||
    objectType === "content_creator" || // My Payment Terminal
    objectType === "home_security" // Virtual ATM
  ) {
    return "payment-terminal-model";
  }
  // All other agents use robotic face model
  return "robotic-face-model";
};
```

#### 2. Updated `isPaymentTerminal` check (lines ~363-367)

Extended the payment terminal condition:

```typescript
const isPaymentTerminal =
  obj.object_type === "payment_terminal" ||
  obj.object_type === "trailing_payment_terminal" ||
  obj.object_type === "content_creator" || // My Payment Terminal
  obj.object_type === "home_security"; // Virtual ATM
```

### Visual Result

When users view these agents in AR:

- **My Payment Terminal** → Shows PAX A920 terminal device
- **Payment Terminal - POS** → Shows PAX A920 terminal device
- **Virtual ATM** → Shows PAX A920 terminal device

All three will have the same professional payment terminal appearance, which makes sense since they're all payment/financial transaction agents.

### Available 3D Models

Current models in `/public/models/`:

1. `humanoid_robot_face.glb` - Robotic face (used for most agents)
2. `pax-a920_highpoly.glb` - Payment terminal device (used for payment agents)
3. `human_head.glb` - Human head model (not currently used)

### Future Model Options

If you want different models for each:

- **My Payment Terminal** - Could use a personal device/phone model
- **Payment Terminal - POS** - Current PAX A920 (perfect for POS)
- **Virtual ATM** - Could use a standalone ATM machine model

Let me know if you'd like to add different models for each type!

## Testing

To test the 3D model assignment:

1. Deploy an agent with type "My Payment Terminal", "Payment Terminal - POS", or "Virtual ATM"
2. Open AR Viewer
3. Point camera at the agent's location
4. Should see the PAX A920 payment terminal 3D model

## Files Modified

- `src/components/ARViewer.tsx` - Updated 3D model mapping logic

## Status

✅ 3D model assignments updated for all three payment agent types  
✅ Code uses payment terminal model for content_creator and home_security  
✅ Ready for deployment testing

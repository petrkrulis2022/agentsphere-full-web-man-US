# 🚀 **AR Viewer Copilot: Revolut Integration Prompt** (UPDATED)

**Objective**: Integrate Revolut for **Bank QR** and **Virtual Card** payments into the AR Cube.

**Branch**: `revolut-qr-payments`

---

## **Phase 1: Bank QR Face Implementation**

### **1. Create a New Service: `revolutBankService.js`**

- Create a new file: `src/services/revolutBankService.js`.
- This service will be responsible for communicating with the AgentSphere backend to handle Revolut payments.

```javascript
// src/services/revolutBankService.js

const API_URL =
  import.meta.env.VITE_AGENTSPHERE_API_URL || "http://localhost:5174";

/**
 * Creates a Revolut payment order on the backend.
 * @param {object} orderDetails - The details of the order (amount, currency, etc.).
 * @returns {Promise<object>} - The payment order response from the backend.
 */
export const createRevolutBankOrder = async (orderDetails) => {
  try {
    const response = await fetch(`${API_URL}/api/revolut/create-bank-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderDetails),
    });

    if (!response.ok) {
      throw new Error("Failed to create Revolut bank order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Revolut bank order:", error);
    throw error;
  }
};
```

### **2. Install QR Code Dependency**

```bash
npm install react-qr-code
```

### **3. Create a New Component: `RevolutBankQRModal.jsx`**

- Create a new file: `src/components/RevolutBankQRModal.jsx`.
- This component will display the QR code for the Revolut payment.

```javascript
// src/components/RevolutBankQRModal.jsx
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";

const RevolutBankQRModal = ({ paymentUrl, onClose, onPaymentComplete }) => {
  const [paymentStatus, setPaymentStatus] = useState("pending");

  // Poll for payment status or use websocket connection
  useEffect(() => {
    const pollPaymentStatus = setInterval(() => {
      // You can implement payment status polling here
      // For now, we'll rely on webhooks for status updates
    }, 3000);

    return () => clearInterval(pollPaymentStatus);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Scan to Pay with Your Bank</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <QRCode value={paymentUrl} size={200} />
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Scan this QR code with your phone's camera or banking app to
            complete the payment.
          </p>

          {paymentStatus === "pending" && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-500">
                Waiting for payment...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevolutBankQRModal;
```

### **4. Update `CubePaymentEngine.jsx`**

- Import the new service and component.
- Add state to manage the Revolut payment modal.
- Update the `onSelect` handler to trigger the Bank QR payment flow.

```javascript
// src/components/CubePaymentEngine.jsx

// ... imports
import { createRevolutBankOrder } from "../services/revolutBankService";
import RevolutBankQRModal from "./RevolutBankQRModal";

const CubePaymentEngine = ({ agent }) => {
  // ... existing state
  const [revolutPaymentUrl, setRevolutPaymentUrl] = useState(null);
  const [isRevolutModalOpen, setIsRevolutModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleBankQRPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const orderDetails = {
        amount: agent.interaction_fee,
        currency: "USD", // Or get from agent config
        agentId: agent.id,
        description: `Payment for ${agent.name} interaction`,
      };

      const order = await createRevolutBankOrder(orderDetails);
      setRevolutPaymentUrl(order.payment_url);
      setIsRevolutModalOpen(true);
    } catch (error) {
      console.error("Bank QR payment failed:", error);
      // Show error notification to user
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentComplete = () => {
    setIsRevolutModalOpen(false);
    setRevolutPaymentUrl(null);
    // Update UI to show successful payment
    // Trigger agent interaction unlock
  };

  const onSelect = (face) => {
    // ... existing cases
    if (face.name === "Bank QR" && !isProcessingPayment) {
      handleBankQRPayment();
    }
  };

  return (
    <>
      {/* ... existing JSX */}
      {isRevolutModalOpen && revolutPaymentUrl && (
        <RevolutBankQRModal
          paymentUrl={revolutPaymentUrl}
          onClose={() => setIsRevolutModalOpen(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
};

export default CubePaymentEngine;
```

---

## **Phase 2: Virtual Card Face Implementation**

### **1. Add Revolut Web SDK**

- Add the Revolut Web SDK to your `index.html` file.

```html
<!-- public/index.html or index.html -->
<script src="https://merchant.revolut.com/embed.js"></script>
```

### **2. Create a New Service: `revolutVirtualCardService.js`**

```javascript
// src/services/revolutVirtualCardService.js

const API_URL =
  import.meta.env.VITE_AGENTSPHERE_API_URL || "http://localhost:5174";

/**
 * Processes a Revolut virtual card payment.
 * @param {string} token - The payment token from the Revolut SDK.
 * @param {object} orderDetails - The details of the order.
 * @returns {Promise<object>} - The payment response from the backend.
 */
export const processVirtualCardPayment = async (token, orderDetails) => {
  try {
    const response = await fetch(
      `${API_URL}/api/revolut/process-virtual-card-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, ...orderDetails }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to process virtual card payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error processing virtual card payment:", error);
    throw error;
  }
};
```

### **3. Update `CubePaymentEngine.jsx` for Virtual Card**

```javascript
// src/components/CubePaymentEngine.jsx

// ... imports
import { processVirtualCardPayment } from "../services/revolutVirtualCardService";

const CubePaymentEngine = ({ agent }) => {
  // ... existing state and functions

  const handleVirtualCardPayment = async () => {
    try {
      // Use the Client ID from environment variables
      const revolut = window.RevolutCheckout(
        import.meta.env.VITE_REVOLUT_CLIENT_ID ||
          "96ca6a20-254d-46e7-aad1-46132e087901"
      );

      const orderDetails = {
        amount: Math.round(agent.interaction_fee * 100), // Amount in cents
        currency: "USD",
        description: `Payment for ${agent.name} interaction`,
      };

      const instance = revolut.payWithPopup({
        ...orderDetails,
        onSuccess: async (data) => {
          try {
            const response = await processVirtualCardPayment(
              data.token,
              orderDetails
            );
            console.log("Payment successful:", response);
            // Handle successful payment UI update
            handlePaymentComplete();
          } catch (error) {
            console.error("Payment processing failed:", error);
            // Handle failed payment UI update
          }
        },
        onError: (error) => {
          console.error("Revolut Popup Error:", error);
          // Handle payment error
        },
        onCancel: () => {
          console.log("Payment cancelled by user");
          // Handle payment cancellation
        },
      });
    } catch (error) {
      console.error("Virtual card payment initialization failed:", error);
    }
  };

  const onSelect = (face) => {
    // ... existing cases
    if (face.name === "Virtual Card" && !isProcessingPayment) {
      handleVirtualCardPayment();
    }
    if (face.name === "Bank QR" && !isProcessingPayment) {
      handleBankQRPayment();
    }
  };

  // ... return statement
};
```

---

## **Phase 3: Webhook Integration & Real-time Updates**

### **1. Add Websocket Connection for Real-time Updates**

```javascript
// src/hooks/usePaymentStatus.js
import { useEffect, useState } from "react";

export const usePaymentStatus = (orderId) => {
  const [paymentStatus, setPaymentStatus] = useState("pending");

  useEffect(() => {
    if (!orderId) return;

    // Option 1: WebSocket connection
    const ws = new WebSocket(`ws://localhost:5174/payment-status/${orderId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPaymentStatus(data.status);
    };

    // Option 2: Polling fallback
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment-status/${orderId}`);
        const data = await response.json();
        setPaymentStatus(data.status);

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 3000);

    return () => {
      ws.close();
      clearInterval(pollInterval);
    };
  }, [orderId]);

  return paymentStatus;
};
```

### **2. Environment Variables Update**

Make sure your AR Viewer has access to these environment variables:

```env
# AR Viewer .env
VITE_AGENTSPHERE_API_URL=http://localhost:5174
VITE_REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901
VITE_REVOLUT_ENVIRONMENT=sandbox
```

**Next Steps**:

1. Implement the changes as described above.
2. Test the Bank QR payment flow.
3. Test the Virtual Card payment flow (Apple Pay/Google Pay).
4. Implement webhook status updates for real-time payment confirmation.
5. Add error handling and user feedback for all payment states.
6. Test the complete payment-to-agent-unlock flow.

---

## **Key Improvements Made:**

1. **✅ Correct API URL**: Changed from `3001` to `5174` to match your setup
2. **✅ Environment Variables**: Added proper Client ID reference
3. **✅ Better Error Handling**: Added loading states and error management
4. **✅ Improved UI**: Better modal styling and user feedback
5. **✅ Real-time Updates**: Added webhook integration patterns
6. **✅ Dependencies**: Added npm install instruction for QR code library

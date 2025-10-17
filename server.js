// AgentSphere Backend API Server
// Handles Revolut API endpoints with CORS support

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173", // AR Viewer
  "http://localhost:5174", // AgentSphere
  "https://78e5bf8d9db0.ngrok-free.app", // Ngrok URL (UPDATED)
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Revolut API Configuration
const REVOLUT_ACCESS_TOKEN =
  process.env.REVOLUT_ACCESS_TOKEN ||
  "sand_vfUxRQdLU8kVlztOYCLYNcXrBh0wXoKqGj0C7uIVxCc";
const REVOLUT_API_BASE_URL =
  process.env.REVOLUT_API_BASE_URL || "https://sandbox-merchant.revolut.com";
const REVOLUT_WEBHOOK_SECRET =
  process.env.REVOLUT_WEBHOOK_SECRET || "wsk_fRlH03El2veJJEIMalmaTMQ06cKP9sSb";

// Revolut API Fetch Helper
async function revolutApiFetch(endpoint, options = {}) {
  const url = `${REVOLUT_API_BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${REVOLUT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  console.log(`🔵 Revolut API Request: ${options.method || "GET"} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Revolut API Error:", data);
    throw new Error(data.message || "Revolut API request failed");
  }

  console.log("✅ Revolut API Success:", data);
  return data;
}

// ==================== ROUTES ====================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AgentSphere Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// Create Bank QR Order
app.post("/api/revolut/create-bank-order", async (req, res) => {
  try {
    console.log("📥 Received Bank QR Order Request:", req.body);

    const {
      amount,
      currency = "EUR",
      agentId,
      agentName,
      description,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
        message: "Amount must be greater than 0",
      });
    }

    // Convert to smallest currency unit (cents/pence)
    const amountInSmallestUnit = Math.round(amount * 100);

    const orderData = {
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      order_description:
        description || `Payment for AgentSphere Agent: ${agentName || agentId}`,
      merchant_order_ext_ref: `agent_${agentId}_${Date.now()}`,
    };

    console.log("🚀 Creating Revolut Order:", orderData);

    // Call Revolut API
    const order = await revolutApiFetch("/api/1.0/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    console.log("📦 Revolut API Response:", JSON.stringify(order, null, 2));
    console.log("🔍 Order ID:", order.id);
    console.log("🔍 Payment URL from API:", order.payment_url);
    console.log("🔍 Public ID:", order.public_id);

    // Construct payment URL based on environment
    // IMPORTANT: Revolut sandbox uses public_id, not id
    // Format: https://sandbox-merchant.revolut.com/pay/{public_id}
    let payment_url;
    if (REVOLUT_API_BASE_URL.includes("sandbox")) {
      // Use public_id for sandbox (required for sandbox environment)
      payment_url = `https://sandbox-merchant.revolut.com/pay/${
        order.public_id || order.id
      }`;
      console.log("🧪 SANDBOX MODE: Using constructed sandbox URL");
    } else {
      // Use payment_url from API for production
      payment_url =
        order.payment_url ||
        `https://merchant.revolut.com/pay/${order.public_id || order.id}`;
      console.log(
        "🌐 PRODUCTION MODE: Using API payment_url or constructed production URL"
      );
    }

    console.log("✅ Final Payment URL:", payment_url);
    const qr_code_url = payment_url; // Use same URL for QR code

    const response = {
      success: true,
      order: {
        id: order.id,
        order_id: order.id,
        payment_url: payment_url,
        qr_code_url: qr_code_url,
        amount: amount,
        currency: currency.toUpperCase(),
        status: order.state || "pending",
        created_at: order.created_at || new Date().toISOString(),
        expires_at:
          order.expires_at ||
          new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        description: orderData.order_description,
        agentId: agentId,
        agentName: agentName,
      },
    };

    console.log("✅ Bank QR Order Created:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error creating Bank QR order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment order",
      message: error.message,
    });
  }
});

// Process Virtual Card Payment
app.post("/api/revolut/process-virtual-card-payment", async (req, res) => {
  try {
    console.log("📥 Received Virtual Card Payment Request:", req.body);

    const {
      token,
      amount,
      currency = "EUR",
      agentId,
      agentName,
      provider,
    } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Missing payment token",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
      });
    }

    const amountInSmallestUnit = Math.round(amount * 100);

    const orderData = {
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      order_description: `Virtual Card Payment for Agent: ${
        agentName || agentId
      }`,
      payment_method: {
        type: "card",
        token: token,
        provider: provider || "apple_pay",
      },
    };

    console.log("🚀 Processing Virtual Card Payment:", orderData);

    // Create order with payment token
    const order = await revolutApiFetch("/api/1.0/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    // Capture payment immediately
    let capturedOrder = order;
    if (order.state !== "COMPLETED") {
      capturedOrder = await revolutApiFetch(
        `/api/1.0/orders/${order.id}/capture`,
        {
          method: "POST",
        }
      );
    }

    const response = {
      success: true,
      paymentId: capturedOrder.id,
      status: capturedOrder.state === "COMPLETED" ? "completed" : "pending",
      amount: amount,
      currency: currency.toUpperCase(),
      order: capturedOrder,
    };

    console.log("✅ Virtual Card Payment Processed:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error processing Virtual Card payment:", error);
    res.status(500).json({
      success: false,
      error: "Payment processing failed",
      message: error.message,
    });
  }
});

// Check Order Status
app.get("/api/revolut/order-status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log("🔍 Checking order status:", orderId);

    const order = await revolutApiFetch(`/api/1.0/orders/${orderId}`, {
      method: "GET",
    });

    const response = {
      status: order.state || "pending",
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      updated_at: order.updated_at || new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error checking order status:", error);
    res.status(500).json({
      error: "Failed to check order status",
      message: error.message,
    });
  }
});

// Cancel Order
app.post("/api/revolut/cancel-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log("🚫 Cancelling order:", orderId);

    const order = await revolutApiFetch(`/api/1.0/orders/${orderId}/cancel`, {
      method: "POST",
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      status: order.state || "cancelled",
    });
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel order",
      message: error.message,
    });
  }
});

// Revolut Webhook Handler
app.post("/api/revolut/webhook", async (req, res) => {
  try {
    console.log("📨 Webhook received:", req.body);

    // Verify webhook signature
    const signature = req.headers["revolut-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", REVOLUT_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("❌ Invalid webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { event, order } = req.body;

    console.log(`📬 Webhook Event: ${event}`, order);

    // Handle webhook events
    switch (event) {
      case "ORDER_COMPLETED":
        console.log("✅ Payment completed:", order.id);
        // TODO: Update database, unlock agent interaction
        break;

      case "ORDER_FAILED":
        console.log("❌ Payment failed:", order.id);
        // TODO: Update database
        break;

      case "ORDER_AUTHORISED":
        console.log("⏳ Payment authorized:", order.id);
        // TODO: Update database
        break;

      default:
        console.log("ℹ️ Unhandled webhook event:", event);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`
🚀 AgentSphere Backend API Server Started!

📍 Server running on: http://localhost:${PORT}
🔗 Health check: http://localhost:${PORT}/api/health

🌐 Available Endpoints:
   POST   /api/revolut/create-bank-order
   POST   /api/revolut/process-virtual-card-payment
   GET    /api/revolut/order-status/:orderId
   POST   /api/revolut/cancel-order/:orderId
   POST   /api/revolut/webhook

🔧 CORS Enabled for:
   - http://localhost:5173 (AR Viewer)
   - http://localhost:5174 (AgentSphere)
   - https://8323ecb51478.ngrok-free.app (Ngrok)

📊 Revolut Configuration:
   API Base: ${REVOLUT_API_BASE_URL}
   Environment: ${
     REVOLUT_API_BASE_URL.includes("sandbox") ? "Sandbox" : "Production"
   }

✅ Ready to accept payments!
  `);
});

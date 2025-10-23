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
  "https://78e5bf8d9db0.ngrok-free.app", // Ngrok URL (from SANDBOX_URL_FIX_SUMMARY.md)
  "https://32f83daefe28.ngrok-free.app", // Alternative ngrok URL (from conversation)
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

// Mock mode toggle (set via environment variable)
const USE_MOCK_CARDS = process.env.USE_MOCK_CARDS === "true";

// Mock card storage (in-memory for testing)
const mockCards = new Map();

// ==================== DYNAMIC PAYMENT SYSTEM ====================

// Mock agent storage (in-memory for testing)
const mockAgents = new Map();

// Payment session storage (in-memory for testing)
const paymentSessions = new Map();

// Helper: Check if agent is a terminal type
function isTerminalAgent(agentType) {
  return ["payment_terminal", "trailing_payment_terminal"].includes(agentType);
}

// Helper: Generate payment session ID
function generatePaymentSessionId() {
  return `ps_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
}

// Helper: Store payment session
function storePaymentSession(session) {
  paymentSessions.set(session.id, session);

  // Auto-expire after 15 minutes
  setTimeout(() => {
    const currentSession = paymentSessions.get(session.id);
    if (currentSession && currentSession.status === "pending") {
      currentSession.status = "expired";
      paymentSessions.set(session.id, currentSession);
      console.log(`⏰ Payment session ${session.id} expired`);
    }
  }, 15 * 60 * 1000);

  return session;
}

// Helper: Get payment session
function getPaymentSession(sessionId) {
  return paymentSessions.get(sessionId);
}

// Helper: Update payment session
function updatePaymentSession(sessionId, updates) {
  const session = paymentSessions.get(sessionId);
  if (session) {
    const updatedSession = { ...session, ...updates };
    paymentSessions.set(sessionId, updatedSession);
    return updatedSession;
  }
  return null;
}

// Helper: Verify blockchain transaction (simulated)
async function verifyBlockchainTransaction(txHash, amount, token) {
  console.log(`🔍 Verifying blockchain transaction: ${txHash}`);
  console.log(`   Amount: ${amount} ${token}`);

  // Simulate verification delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In simulation mode, always return true
  // In production, this would check on-chain
  return true;
}

// Helper: Verify Revolut payment (simulated)
async function verifyRevolutPayment(paymentId, amount, currency) {
  console.log(`🔍 Verifying Revolut payment: ${paymentId}`);
  console.log(`   Amount: ${amount} ${currency}`);

  // Simulate verification delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In simulation mode, always return true
  // In production, this would call Revolut API
  return true;
}

// Helper: Notify merchant webhook (simulated)
async function notifyMerchant(webhookUrl, data) {
  try {
    console.log(`📤 Sending webhook to merchant: ${webhookUrl}`);
    console.log(`   Data:`, data);

    // In simulation mode, just log
    // In production, this would make HTTP request
    console.log(`✅ Webhook notification sent (simulated)`);

    return true;
  } catch (error) {
    console.error("❌ Webhook notification failed:", error);
    return false;
  }
}

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

/**
 * Get payment order status
 * AR Viewer polls this while waiting for payment
 */
app.get("/api/revolut/order-status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log("🔍 Checking order status:", orderId);

    const order = await revolutApiFetch(`/api/1.0/orders/${orderId}`, {
      method: "GET",
    });

    console.log("📦 Order status:", order.state);

    const response = {
      success: true,
      order_id: order.id,
      status: order.state || "PENDING", // PENDING, PROCESSING, COMPLETED, CANCELLED, FAILED
      amount: order.order_amount?.value
        ? order.order_amount.value / 100
        : order.amount / 100,
      currency: order.order_amount?.currency || order.currency,
      created_at: order.created_at || new Date().toISOString(),
      updated_at: order.updated_at || new Date().toISOString(),
      completed_at: order.completed_at || null,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error checking order status:", error);
    res.status(500).json({
      success: false,
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

// ==================== VIRTUAL CARD ENDPOINTS ====================

/**
 * Mock: Create virtual card
 * Single-card-per-agent model: checks for existing active card
 */
app.post("/api/revolut/mock/create-virtual-card", async (req, res) => {
  try {
    const { agentId, amount, currency, cardLabel } = req.body;

    console.log("🧪 MOCK: Creating virtual card");

    // Check for existing active card (single-card-per-agent enforcement)
    const existingCard = Array.from(mockCards.values()).find(
      (card) =>
        card.label &&
        card.label.includes(`Agent_${agentId}`) &&
        card.state === "ACTIVE"
    );

    if (existingCard) {
      console.log(
        "⚠️ MOCK: Agent already has an active card:",
        existingCard.card_id
      );
      return res.status(409).json({
        success: false,
        error: "Agent already has an active virtual card",
        existing_card_id: existingCard.card_id,
        message:
          "Use /topup endpoint to add funds or terminate the existing card first",
      });
    }

    // Generate mock card
    const cardId = `mock_card_${Date.now()}`;
    const mockCard = {
      card_id: cardId,
      agent_id: agentId,
      label: cardLabel || `Agent_${agentId}_Card`,
      currency: currency,
      state: "ACTIVE",
      balance: amount,
      card_number: "4111 1111 1111 1111",
      cvv: "123",
      expiry_date: "12/25",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store in mock storage
    mockCards.set(cardId, mockCard);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({
      success: true,
      card: mockCard,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Mock: Get virtual card
 */
app.get("/api/revolut/mock/virtual-card/:card_id", async (req, res) => {
  try {
    const { card_id } = req.params;

    const card = mockCards.get(card_id);

    if (!card) {
      return res.status(404).json({ success: false, error: "Card not found" });
    }

    res.json({
      success: true,
      card: card,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Mock: Top up virtual card
 */
app.post("/api/revolut/mock/virtual-card/:card_id/topup", async (req, res) => {
  try {
    const { card_id } = req.params;
    const { amount } = req.body;

    const card = mockCards.get(card_id);

    if (!card) {
      return res.status(404).json({ success: false, error: "Card not found" });
    }

    // Update balance
    card.balance += amount;
    card.updated_at = new Date().toISOString();
    mockCards.set(card_id, card);

    res.json({
      success: true,
      new_balance: card.balance,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Mock: Get primary card for agent
 */
app.get(
  "/api/revolut/mock/virtual-card/agent/:agentId/primary",
  async (req, res) => {
    try {
      const { agentId } = req.params;

      console.log("🧪 MOCK: Getting primary card for agent:", agentId);

      // Find the agent's active card
      const primaryCard = Array.from(mockCards.values()).find(
        (card) =>
          card.label &&
          card.label.includes(`Agent_${agentId}`) &&
          card.state === "ACTIVE"
      );

      if (primaryCard) {
        console.log("✅ MOCK: Found primary card:", primaryCard.card_id);
        res.json({
          success: true,
          agent_id: agentId,
          card: primaryCard,
        });
      } else {
        console.log("⚠️ MOCK: No primary card found for agent:", agentId);
        res.json({
          success: true,
          agent_id: agentId,
          card: null,
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * Unified endpoint: Auto-route to mock or real based on USE_MOCK_CARDS
 */
app.post("/api/revolut/virtual-card/create", async (req, res) => {
  if (USE_MOCK_CARDS) {
    console.log("🧪 Using MOCK mode for virtual cards");
    // Forward to mock endpoint
    req.url = "/api/revolut/mock/create-virtual-card";
    return app._router.handle(req, res);
  } else {
    console.log("🌐 Using REAL Revolut API for virtual cards");
    // Forward to real endpoint
    req.url = "/api/revolut/create-virtual-card";
    return app._router.handle(req, res);
  }
});

/**
 * Create and fund a virtual card for an agent
 * Single-card-per-agent model: checks for existing active card first
 */
app.post("/api/revolut/create-virtual-card", async (req, res) => {
  try {
    const { agentId, amount, currency, cardLabel } = req.body;

    console.log("💳 Creating virtual card for agent:", agentId);
    console.log("💰 Initial funding:", amount, currency);

    // Validate input
    if (!agentId || !amount || !currency) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: agentId, amount, currency",
      });
    }

    // Check for existing active card (single-card-per-agent enforcement)
    console.log("🔍 Checking for existing card...");
    const existingCards = await revolutApiFetch("/api/1.0/cards", {
      method: "GET",
    });

    const agentActiveCard = existingCards.find(
      (card) =>
        card.label &&
        card.label.includes(`Agent_${agentId}`) &&
        card.state === "ACTIVE"
    );

    if (agentActiveCard) {
      console.log("⚠️ Agent already has an active card:", agentActiveCard.id);
      return res.status(409).json({
        success: false,
        error: "Agent already has an active virtual card",
        existing_card_id: agentActiveCard.id,
        message:
          "Use /topup endpoint to add funds or terminate the existing card first",
      });
    }

    // Step 1: Create virtual card via Revolut API
    const cardData = {
      label: cardLabel || `Agent_${agentId}_Card`,
      currency: currency,
      card_type: "VIRTUAL",
    };

    console.log("🚀 Creating card with Revolut API:", cardData);

    const card = await revolutApiFetch("/api/1.0/cards", {
      method: "POST",
      body: JSON.stringify(cardData),
    });

    console.log("✅ Card created:", card.id);
    console.log("📋 Card details:", JSON.stringify(card, null, 2));

    // Step 2: Fund the card (if amount > 0)
    if (amount > 0) {
      console.log("💰 Funding card with", amount, currency);

      const topupData = {
        amount: amount,
        currency: currency,
        reference: `Initial_funding_agent_${agentId}`,
      };

      const topup = await revolutApiFetch(`/api/1.0/cards/${card.id}/topup`, {
        method: "POST",
        body: JSON.stringify(topupData),
      });

      console.log("✅ Card funded:", topup);
    }

    // Step 3: Get full card details (including card number, CVV, etc.)
    const cardDetails = await revolutApiFetch(`/api/1.0/cards/${card.id}`, {
      method: "GET",
    });

    console.log("📋 Full card details retrieved");

    // Step 4: Return card information
    // IMPORTANT: In production, NEVER return full card details to frontend
    // Use tokenization or secure display methods
    res.json({
      success: true,
      card: {
        card_id: cardDetails.id,
        label: cardDetails.label,
        currency: cardDetails.currency,
        state: cardDetails.state, // ACTIVE, INACTIVE, BLOCKED, TERMINATED
        balance: amount,

        // Card details (mask in production!)
        card_number: cardDetails.card_number || "XXXX XXXX XXXX XXXX",
        cvv: cardDetails.cvv || "XXX",
        expiry_date: cardDetails.expiry_date || "MM/YY",

        // Metadata
        created_at: cardDetails.created_at,
        updated_at: cardDetails.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Failed to create virtual card:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || "No additional details",
    });
  }
});

/**
 * Get virtual card details
 */
app.get("/api/revolut/virtual-card/:card_id", async (req, res) => {
  try {
    const { card_id } = req.params;

    console.log("🔍 Getting card details:", card_id);

    const card = await revolutApiFetch(`/api/1.0/cards/${card_id}`, {
      method: "GET",
    });

    res.json({
      success: true,
      card: {
        card_id: card.id,
        label: card.label,
        currency: card.currency,
        state: card.state,
        balance: card.balance || 0,
        card_number: card.card_number || "XXXX XXXX XXXX XXXX",
        cvv: card.cvv || "XXX",
        expiry_date: card.expiry_date || "MM/YY",
        created_at: card.created_at,
        updated_at: card.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Failed to get card details:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Top up virtual card
 */
app.post("/api/revolut/virtual-card/:card_id/topup", async (req, res) => {
  try {
    const { card_id } = req.params;
    const { amount, currency } = req.body;

    console.log("💰 Topping up card:", card_id);
    console.log("💵 Amount:", amount, currency);

    const topupData = {
      amount: amount,
      currency: currency,
      reference: `Topup_${Date.now()}`,
    };

    const topup = await revolutApiFetch(`/api/1.0/cards/${card_id}/topup`, {
      method: "POST",
      body: JSON.stringify(topupData),
    });

    res.json({
      success: true,
      topup: topup,
      new_balance: topup.balance || amount,
    });
  } catch (error) {
    console.error("❌ Failed to top up card:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Freeze/unfreeze virtual card
 */
app.post("/api/revolut/virtual-card/:card_id/freeze", async (req, res) => {
  try {
    const { card_id } = req.params;
    const { freeze } = req.body; // true to freeze, false to unfreeze

    console.log(freeze ? "❄️ Freezing card:" : "🔥 Unfreezing card:", card_id);

    const action = freeze ? "freeze" : "unfreeze";

    await revolutApiFetch(`/api/1.0/cards/${card_id}/${action}`, {
      method: "POST",
    });

    res.json({
      success: true,
      card_id: card_id,
      state: freeze ? "FROZEN" : "ACTIVE",
      action: action,
    });
  } catch (error) {
    console.error("❌ Failed to freeze/unfreeze card:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Terminate virtual card (permanent)
 */
app.delete("/api/revolut/virtual-card/:card_id", async (req, res) => {
  try {
    const { card_id } = req.params;

    console.log("🗑️ Terminating card:", card_id);

    await revolutApiFetch(`/api/1.0/cards/${card_id}/terminate`, {
      method: "POST",
    });

    res.json({
      success: true,
      card_id: card_id,
      state: "TERMINATED",
      message: "Card permanently terminated",
    });
  } catch (error) {
    console.error("❌ Failed to terminate card:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * List all virtual cards for an agent (DEPRECATED - use /primary instead)
 */
app.get("/api/revolut/virtual-cards/agent/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;

    console.log("📋 Listing cards for agent:", agentId);

    // Get all cards from Revolut
    const cards = await revolutApiFetch("/api/1.0/cards", {
      method: "GET",
    });

    // Filter by agent ID (based on label)
    const agentCards = cards.filter(
      (card) => card.label && card.label.includes(`Agent_${agentId}`)
    );

    res.json({
      success: true,
      agent_id: agentId,
      cards: agentCards.map((card) => ({
        card_id: card.id,
        label: card.label,
        currency: card.currency,
        state: card.state,
        balance: card.balance || 0,
        created_at: card.created_at,
      })),
    });
  } catch (error) {
    console.error("❌ Failed to list cards:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get the primary (single) virtual card for an agent
 * Single-card-per-agent model: returns one ACTIVE card or null
 */
app.get(
  "/api/revolut/virtual-card/agent/:agentId/primary",
  async (req, res) => {
    try {
      const { agentId } = req.params;

      console.log("🔍 Getting primary card for agent:", agentId);

      // Get all cards from Revolut
      const cards = await revolutApiFetch("/api/1.0/cards", {
        method: "GET",
      });

      // Filter by agent ID and ACTIVE state
      const agentCards = cards.filter(
        (card) =>
          card.label &&
          card.label.includes(`Agent_${agentId}`) &&
          card.state === "ACTIVE"
      );

      // Return the first active card (or null if none)
      const primaryCard = agentCards.length > 0 ? agentCards[0] : null;

      if (primaryCard) {
        console.log("✅ Found primary card:", primaryCard.id);
        res.json({
          success: true,
          agent_id: agentId,
          card: {
            card_id: primaryCard.id,
            label: primaryCard.label,
            currency: primaryCard.currency,
            state: primaryCard.state,
            balance: primaryCard.balance || 0,
            created_at: primaryCard.created_at,
          },
        });
      } else {
        console.log("⚠️ No primary card found for agent:", agentId);
        res.json({
          success: true,
          agent_id: agentId,
          card: null,
        });
      }
    } catch (error) {
      console.error("❌ Failed to get primary card:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Internal webhook handler (extracted for reuse)
 */
async function handleRevolutWebhook(event) {
  console.log("🔔 Processing webhook:", event.event_type || event.event);

  const eventType = event.event_type || event.event;
  const orderData = event.order || event;

  switch (eventType) {
    case "ORDER_COMPLETED":
      console.log("✅ Payment completed:", orderData.id || orderData.order_id);
      console.log(
        "💰 Amount:",
        orderData.order_amount?.value || orderData.amount,
        orderData.order_amount?.currency || orderData.currency
      );
      // TODO: Update database
      // TODO: Notify AR Viewer via WebSocket
      // TODO: Update agent balance
      break;

    case "ORDER_CANCELLED":
      console.log("❌ Payment cancelled:", orderData.id || orderData.order_id);
      // TODO: Update database
      break;

    case "ORDER_FAILED":
      console.log("⚠️ Payment failed:", orderData.id || orderData.order_id);
      console.log("Reason:", event.failure_reason || "Unknown");
      // TODO: Update database
      break;

    case "ORDER_AUTHORISED":
      console.log(
        "🔐 Payment AUTHORISED (pending capture):",
        orderData.id || orderData.order_id
      );
      // TODO: Update database
      break;

    default:
      console.log("ℹ️ Unhandled event type:", eventType);
  }
}

/**
 * Test endpoint: Simulate virtual card payment
 * This simulates using the virtual card at a merchant
 */
app.post("/api/revolut/test-card-payment", async (req, res) => {
  try {
    const { card_id, amount, currency, merchant } = req.body;

    console.log("🧪 TEST: Simulating card payment");
    console.log("💳 Card ID:", card_id);
    console.log("💰 Amount:", amount, currency);
    console.log("🏪 Merchant:", merchant);

    // Step 1: Get card details
    const card = await revolutApiFetch(`/api/1.0/cards/${card_id}`, {
      method: "GET",
    });

    // Step 2: Check balance
    const currentBalance = card.balance || 0;
    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient balance",
        current_balance: currentBalance,
        required: amount,
      });
    }

    // Step 3: Simulate payment delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 4: Deduct amount (in real implementation, this happens automatically)
    // For testing, we'll just return success

    res.json({
      success: true,
      message: "Payment simulation completed",
      card_id: card_id,
      amount: amount,
      currency: currency,
      merchant: merchant,
      remaining_balance: currentBalance - amount,
      transaction_id: `test_txn_${Date.now()}`,
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Test card payment failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Test endpoint: Simulate QR code payment completion
 * This allows testing the full flow without scanning QR codes
 */
app.post("/api/revolut/test-qr-payment", async (req, res) => {
  try {
    const { order_id, amount, currency } = req.body;

    console.log("🧪 TEST: Simulating QR payment completion");
    console.log("📋 Order ID:", order_id);
    console.log("💰 Amount:", amount, currency);

    // Simulate payment delay (1-3 seconds)
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate webhook callback
    const webhookPayload = {
      event_type: "ORDER_COMPLETED",
      order_id: order_id,
      state: "COMPLETED",
      order_amount: {
        value: amount,
        currency: currency,
      },
      completed_at: new Date().toISOString(),
    };

    // Call internal webhook handler
    await handleRevolutWebhook(webhookPayload);

    res.json({
      success: true,
      message: "Payment simulation completed",
      order_id: order_id,
      status: "COMPLETED",
      completed_at: webhookPayload.completed_at,
    });
  } catch (error) {
    console.error("❌ Test payment simulation failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== AGENT DEPLOYMENT ====================

/**
 * Deploy a new agent with economics configuration
 * Supports regular agents and payment terminals
 */
app.post("/api/agents/deploy", async (req, res) => {
  try {
    console.log("📥 Agent Deployment Request:", req.body);

    const {
      agentType,
      name,
      description,
      interactionMethods,
      mcpInteractions,
      paymentToken,
      interactionFee,
      paymentMethods,
      revenueSharing,
      walletAddress,
    } = req.body;

    // Validate agent type
    const validTypes = [
      "text_chat",
      "voice_chat",
      "video_chat",
      "defi_features",
      "payment_terminal",
      "trailing_payment_terminal",
    ];

    if (!validTypes.includes(agentType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid agent type",
        validTypes,
      });
    }

    const isTerminal = isTerminalAgent(agentType);

    // Validate interaction fee for non-terminal agents
    if (!isTerminal && (!interactionFee || interactionFee <= 0)) {
      return res.status(400).json({
        success: false,
        error: "Interaction fee is required for non-terminal agents",
      });
    }

    // Generate agent ID
    const agentId = `agent_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    // Create agent object
    const agent = {
      id: agentId,
      agentType,
      name,
      description,
      interactionMethods: interactionMethods || [],
      mcpInteractions: mcpInteractions || [],
      walletAddress:
        walletAddress || `0x${crypto.randomBytes(20).toString("hex")}`,
      economics: {
        paymentToken: paymentToken || "USDC",
        interactionFee: {
          amount: isTerminal ? 0 : interactionFee,
          isDynamic: isTerminal,
        },
        paymentMethods: paymentMethods || {
          crypto: {
            enabled: true,
            tokens: [paymentToken || "USDC"],
          },
          revolut: {
            qr: false,
            virtualCard: false,
          },
        },
        revenueSharing: {
          userPercentage: isTerminal
            ? 100
            : revenueSharing?.userPercentage || 70,
          platformPercentage: isTerminal
            ? 0
            : revenueSharing?.platformPercentage || 30,
        },
      },
      status: "active",
      deployedAt: new Date().toISOString(),
    };

    // Store agent in memory
    mockAgents.set(agentId, agent);

    console.log(`✅ Agent deployed successfully: ${agentId}`);
    console.log(`   Type: ${agentType}`);
    console.log(`   Dynamic Payment: ${isTerminal}`);
    console.log(
      `   Revenue Split: ${agent.economics.revenueSharing.userPercentage}% user`
    );

    res.json({
      success: true,
      agent: {
        id: agent.id,
        agentType: agent.agentType,
        name: agent.name,
        walletAddress: agent.walletAddress,
        economics: agent.economics,
        isDynamicPayment: isTerminal,
        status: agent.status,
        deployedAt: agent.deployedAt,
      },
    });
  } catch (error) {
    console.error("❌ Agent deployment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to deploy agent",
      message: error.message,
    });
  }
});

/**
 * Get agent details by ID
 */
app.get("/api/agents/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;

    const agent = mockAgents.get(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: "Agent not found",
      });
    }

    res.json({
      success: true,
      agent,
    });
  } catch (error) {
    console.error("❌ Get agent error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve agent",
    });
  }
});

/**
 * List all agents
 */
app.get("/api/agents", async (req, res) => {
  try {
    const { type, status } = req.query;

    let agents = Array.from(mockAgents.values());

    // Filter by type
    if (type) {
      agents = agents.filter((a) => a.agentType === type);
    }

    // Filter by status
    if (status) {
      agents = agents.filter((a) => a.status === status);
    }

    res.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    console.error("❌ List agents error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list agents",
    });
  }
});

// ==================== DYNAMIC PAYMENT ENDPOINTS ====================

/**
 * Create payment session for virtual terminal
 * Used by e-shop, on-ramp, and other merchants
 */
app.post("/api/payments/terminal/create-session", async (req, res) => {
  try {
    console.log("📥 Create Payment Session Request:", req.body);

    const {
      terminalAgentId,
      merchantId,
      merchantName,
      amount,
      currency,
      paymentMethod,
      token,
      cartData,
      redirectUrl,
      metadata,
    } = req.body;

    // Validate required fields
    if (!terminalAgentId || !merchantId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: ["terminalAgentId", "merchantId", "amount", "paymentMethod"],
      });
    }

    // Get terminal agent
    const agent = mockAgents.get(terminalAgentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: "Terminal agent not found",
      });
    }

    // Verify it's a terminal agent
    if (!isTerminalAgent(agent.agentType)) {
      return res.status(400).json({
        success: false,
        error: "Agent is not a payment terminal",
        agentType: agent.agentType,
      });
    }

    // Verify agent is active
    if (agent.status !== "active") {
      return res.status(400).json({
        success: false,
        error: "Terminal agent is not active",
        status: agent.status,
      });
    }

    // Validate payment method is enabled
    const paymentMethodsConfig = agent.economics.paymentMethods;

    if (paymentMethod === "crypto" && !paymentMethodsConfig.crypto.enabled) {
      return res.status(400).json({
        success: false,
        error: "Crypto payments not enabled for this terminal",
      });
    }

    if (paymentMethod === "revolut_qr" && !paymentMethodsConfig.revolut.qr) {
      return res.status(400).json({
        success: false,
        error: "Revolut QR not enabled for this terminal",
      });
    }

    if (
      paymentMethod === "revolut_card" &&
      !paymentMethodsConfig.revolut.virtualCard
    ) {
      return res.status(400).json({
        success: false,
        error: "Revolut Virtual Card not enabled for this terminal",
      });
    }

    // Create payment session
    const session = {
      id: generatePaymentSessionId(),
      terminalAgentId,
      terminalOwner: agent.walletAddress,
      merchantId,
      merchantName: merchantName || "Online Merchant",
      amount: parseFloat(amount),
      currency: currency || "USD",
      paymentMethod,
      token: token || "USDC",
      cartData: cartData || null,
      redirectUrl: redirectUrl || null,
      metadata: metadata || {},
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    // Store session
    storePaymentSession(session);

    console.log(`✅ Payment session created: ${session.id}`);
    console.log(`   Terminal: ${terminalAgentId}`);
    console.log(`   Merchant: ${merchantName}`);
    console.log(`   Amount: ${amount} ${currency || "USD"}`);
    console.log(`   Method: ${paymentMethod}`);

    // Return session for AR Viewer
    res.json({
      success: true,
      session: {
        id: session.id,
        terminalAgentId,
        terminalOwner: agent.walletAddress,
        merchantName: session.merchantName,
        amount: session.amount,
        currency: session.currency,
        paymentMethod: session.paymentMethod,
        token: session.token,
        expiresAt: session.expiresAt,
        paymentUrl: `http://localhost:5173/virtual-terminal?session=${session.id}`,
      },
    });
  } catch (error) {
    console.error("❌ Create session error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment session",
      message: error.message,
    });
  }
});

/**
 * Get payment session details
 * Used by AR Viewer to retrieve payment information
 */
app.get("/api/payments/terminal/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log(`📥 Get Payment Session: ${sessionId}`);

    const session = getPaymentSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Payment session not found or expired",
      });
    }

    // Check if expired
    if (new Date() > new Date(session.expiresAt)) {
      session.status = "expired";
      updatePaymentSession(sessionId, { status: "expired" });

      return res.status(410).json({
        success: false,
        error: "Payment session has expired",
      });
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        terminalAgentId: session.terminalAgentId,
        merchantName: session.merchantName,
        amount: session.amount,
        currency: session.currency,
        paymentMethod: session.paymentMethod,
        token: session.token,
        cartData: session.cartData,
        status: session.status,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("❌ Get session error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve payment session",
      message: error.message,
    });
  }
});

/**
 * Complete payment
 * Called by AR Viewer after user confirms payment
 */
app.post("/api/payments/terminal/complete", async (req, res) => {
  try {
    console.log("📥 Complete Payment Request:", req.body);

    const {
      sessionId,
      transactionHash,
      revolutPaymentId,
      paymentProof,
      userWallet,
    } = req.body;

    const session = getPaymentSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Payment session not found",
      });
    }

    if (session.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Payment session already processed",
        status: session.status,
      });
    }

    // Check if expired
    if (new Date() > new Date(session.expiresAt)) {
      updatePaymentSession(sessionId, { status: "expired" });

      return res.status(410).json({
        success: false,
        error: "Payment session has expired",
      });
    }

    // Verify payment based on method
    let verified = false;

    if (session.paymentMethod === "crypto") {
      verified = await verifyBlockchainTransaction(
        transactionHash,
        session.amount,
        session.token
      );
    } else if (session.paymentMethod.startsWith("revolut_")) {
      verified = await verifyRevolutPayment(
        revolutPaymentId,
        session.amount,
        session.currency
      );
    }

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: "Payment verification failed",
      });
    }

    // Update session
    const updatedSession = updatePaymentSession(sessionId, {
      status: "completed",
      completedAt: new Date().toISOString(),
      transactionHash,
      revolutPaymentId,
      userWallet,
      paymentProof,
    });

    console.log(`✅ Payment completed: ${sessionId}`);
    console.log(`   Amount: ${session.amount} ${session.currency}`);
    console.log(`   Method: ${session.paymentMethod}`);
    console.log(`   TX Hash: ${transactionHash || revolutPaymentId}`);

    // Notify merchant (if webhook URL provided)
    if (session.metadata?.webhookUrl) {
      await notifyMerchant(session.metadata.webhookUrl, {
        sessionId,
        status: "completed",
        amount: session.amount,
        currency: session.currency,
        transactionHash,
        revolutPaymentId,
        completedAt: updatedSession.completedAt,
      });
    }

    res.json({
      success: true,
      payment: {
        sessionId,
        status: "completed",
        amount: session.amount,
        currency: session.currency,
        transactionHash,
        revolutPaymentId,
        redirectUrl: session.redirectUrl,
        completedAt: updatedSession.completedAt,
      },
    });
  } catch (error) {
    console.error("❌ Complete payment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete payment",
      message: error.message,
    });
  }
});

/**
 * Cancel payment session
 */
app.post("/api/payments/terminal/cancel/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    console.log(`📥 Cancel Payment Session: ${sessionId}`);

    const session = getPaymentSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Payment session not found",
      });
    }

    if (session.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Cannot cancel completed or expired session",
        status: session.status,
      });
    }

    // Update session
    updatePaymentSession(sessionId, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: reason || "User cancelled",
    });

    console.log(`✅ Payment session cancelled: ${sessionId}`);

    res.json({
      success: true,
      message: "Payment session cancelled",
      sessionId,
    });
  } catch (error) {
    console.error("❌ Cancel session error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel payment session",
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

    // Process event using extracted handler
    await handleRevolutWebhook({ event_type: event, order: order });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    // Still return 200 to prevent Revolut from retrying
    res.status(200).json({ received: true, error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`
🚀 AgentSphere Backend API Server Started!

📍 Server running on: http://localhost:${PORT}
🔗 Health check: http://localhost:${PORT}/api/health

🌐 Bank QR Code Endpoints:
   POST   /api/revolut/create-bank-order
   GET    /api/revolut/order-status/:orderId
   POST   /api/revolut/cancel-order/:orderId
   POST   /api/revolut/test-qr-payment (testing)

💳 Virtual Card Endpoints (Single-Card-Per-Agent Model):
   POST   /api/revolut/create-virtual-card (enforces 1 card/agent)
   GET    /api/revolut/virtual-card/agent/:agentId/primary ⭐ NEW
   GET    /api/revolut/virtual-card/:card_id
   POST   /api/revolut/virtual-card/:card_id/topup
   POST   /api/revolut/virtual-card/:card_id/freeze
   DELETE /api/revolut/virtual-card/:card_id
   GET    /api/revolut/virtual-cards/agent/:agentId (deprecated)
   POST   /api/revolut/test-card-payment (testing)

🧪 Mock Mode Endpoints:
   POST   /api/revolut/mock/create-virtual-card
   GET    /api/revolut/mock/virtual-card/agent/:agentId/primary ⭐ NEW
   GET    /api/revolut/mock/virtual-card/:card_id
   POST   /api/revolut/mock/virtual-card/:card_id/topup
   POST   /api/revolut/virtual-card/create (auto-routes)

🤖 Agent Deployment Endpoints:
   POST   /api/agents/deploy (deploy regular or terminal agents)
   GET    /api/agents/:agentId (get agent details)
   GET    /api/agents (list all agents)

💰 Dynamic Payment Endpoints (Terminal Agents):
   POST   /api/payments/terminal/create-session (create payment session)
   GET    /api/payments/terminal/session/:sessionId (get session details)
   POST   /api/payments/terminal/complete (complete payment)
   POST   /api/payments/terminal/cancel/:sessionId (cancel session)

📞 Other Endpoints:
   POST   /api/revolut/process-virtual-card-payment
   POST   /api/revolut/webhook

🔧 CORS Enabled for:
   - http://localhost:5173 (AR Viewer)
   - http://localhost:5174 (AgentSphere)
   - https://78e5bf8d9db0.ngrok-free.app (Ngrok - UPDATED)

📊 Revolut Configuration:
   API Base: ${REVOLUT_API_BASE_URL}
   Environment: ${
     REVOLUT_API_BASE_URL.includes("sandbox") ? "Sandbox 🧪" : "Production 🌐"
   }
   Mock Cards: ${USE_MOCK_CARDS ? "Enabled 🧪" : "Disabled"}

✅ Ready to accept payments!
  `);
});

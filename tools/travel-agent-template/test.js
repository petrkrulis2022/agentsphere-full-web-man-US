#!/usr/bin/env node

/**
 * Test x402 Payment Flow
 * Sends a test query to the Travel Agent to verify Flightradar24 MCP integration
 */

const axios = require("axios");

const AGENT_URL = process.env.AGENT_URL || "http://localhost:4001";
const TEST_QUERIES = [
  {
    name: "Flight Query (BUD → BCN)",
    query: "Find flights from BUD to BCN on 2025-01-15",
    expectedKeywords: ["FR8024", "Ryanair", "flight", "USDH"],
  },
  {
    name: "General Travel Planning",
    query: "Plan a trip to Barcelona",
    expectedKeywords: ["package", "Bus", "Train", "Hotel"],
  },
];

async function testAgent() {
  console.log("🧪 Testing Travel Agent x402 MCP Integration");
  console.log("============================================\n");

  // Test 1: Health Check
  console.log("Test 1: Health Check");
  console.log("-------------------");
  try {
    const healthResponse = await axios.get(`${AGENT_URL}/health`);
    console.log("✅ Server is running");
    console.log("   Agent:", healthResponse.data.agent);
    console.log("   Version:", healthResponse.data.version);
    console.log("   MCP Enabled:", healthResponse.data.mcp_enabled);
    console.log("   Account:", healthResponse.data.account_id);
    console.log("");
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    console.error("   Make sure the server is running on", AGENT_URL);
    process.exit(1);
  }

  // Test 2-N: Query Tests
  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const test = TEST_QUERIES[i];
    console.log(`Test ${i + 2}: ${test.name}`);
    console.log("-------------------");
    console.log("Query:", test.query);

    try {
      const startTime = Date.now();

      const response = await axios.post(
        `${AGENT_URL}/message`,
        {
          message: {
            messageId: `test-${Date.now()}`,
            role: "user",
            parts: [{ kind: "text", text: test.query }],
            kind: "message",
          },
        },
        {
          timeout: 30000, // 30 second timeout for MCP queries
        }
      );

      const responseTime = Date.now() - startTime;

      if (response.status === 200 && response.data.result) {
        const message = response.data.result;
        const text = message.parts?.[0]?.text || "";

        console.log("✅ Query successful");
        console.log("   Response time:", responseTime, "ms");
        console.log("   Message type:", message.kind);
        console.log("   Text length:", text.length, "characters");

        // Check for expected keywords
        let foundKeywords = 0;
        for (const keyword of test.expectedKeywords) {
          if (text.includes(keyword)) {
            foundKeywords++;
            console.log(`   ✓ Found keyword: "${keyword}"`);
          }
        }

        if (foundKeywords === 0) {
          console.log("   ⚠️  No expected keywords found in response");
        }

        console.log("\n   Response preview:");
        console.log(
          "   " + text.substring(0, 200) + (text.length > 200 ? "..." : "")
        );
      } else {
        console.log("❌ Unexpected response format");
        console.log("   Status:", response.status);
        console.log("   Data:", JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.error("❌ Query failed:", error.message);
      if (error.response) {
        console.error("   Status:", error.response.status);
        console.error("   Data:", JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log("");
  }

  console.log("============================================");
  console.log("Test suite completed!\n");
}

// Run tests
testAgent().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

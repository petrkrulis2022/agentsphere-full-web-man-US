/**
 * x402 Payment Client
 * Based on: https://github.com/hedera-dev/x402-hedera
 *
 * Implements HTTP 402 Payment Required protocol for micropayments.
 * Agents pay for external data services (timetables, booking APIs, etc.)
 */

import { hederaService } from "./hederaService";

interface X402Invoice {
  amount: number; // Amount in USDh
  currency: string; // "USDh"
  recipient: string; // Hedera Account ID of service provider
  memo: string;
  expiresAt: number; // Unix timestamp
  invoiceId: string;
}

interface X402PaymentProof {
  transactionId: string;
  invoiceId: string;
  amount: number;
  timestamp: number;
  signature: string;
}

interface X402Response {
  status: 402;
  invoice: X402Invoice;
  retryAfter?: number;
}

/**
 * x402 Payment Client Class
 */
class X402Client {
  private agentAccountId: string | null = null;
  private agentPrivateKey: string | null = null;

  /**
   * Initialize the x402 client with agent credentials
   */
  initialize(agentAccountId: string, agentPrivateKey: string) {
    this.agentAccountId = agentAccountId;
    this.agentPrivateKey = agentPrivateKey;
    console.log(`💳 x402 Client initialized for agent: ${agentAccountId}`);
  }

  /**
   * Fetch data from an x402-protected service
   * Automatically handles 402 responses and payment
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.agentAccountId || !this.agentPrivateKey) {
      throw new Error("x402 Client not initialized");
    }

    console.log(`🔷 Fetching x402-protected resource: ${url}`);

    try {
      // 1. Initial request
      const response = await fetch(url, options);

      // 2. If 402 Payment Required, process payment
      if (response.status === 402) {
        console.log("💳 402 Payment Required - processing payment...");

        const x402Response: X402Response = await response.json();
        const { invoice } = x402Response;

        // Validate invoice
        if (!invoice || !invoice.amount || !invoice.recipient) {
          throw new Error("Invalid x402 invoice received");
        }

        console.log(
          `💰 Invoice: ${invoice.amount} ${invoice.currency} to ${invoice.recipient}`
        );

        // 3. Pay the invoice using Hedera service
        const paymentResult = await hederaService.processX402Payment(
          this.agentAccountId,
          this.agentPrivateKey,
          {
            serviceUrl: invoice.recipient,
            amount: invoice.amount,
            memo: invoice.memo || `x402 payment for ${url}`,
          }
        );

        console.log(`✅ Payment processed: ${paymentResult.transactionId}`);

        // 4. Retry request with payment proof
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            "X-Payment-Transaction": paymentResult.transactionId,
            "X-Payment-Proof": paymentResult.paymentProof,
            "X-Invoice-Id": invoice.invoiceId,
          },
        });

        if (!retryResponse.ok) {
          throw new Error(
            `Request failed after payment: ${retryResponse.statusText}`
          );
        }

        console.log("✅ x402 request successful after payment");
        return retryResponse;
      }

      // 3. If not 402, return original response
      return response;
    } catch (error) {
      console.error("❌ x402 request failed:", error);
      throw error;
    }
  }

  /**
   * Query external timetable service (x402-protected)
   * Example: Bus agent queries timetable API
   */
  async queryTimetable(params: {
    from: string;
    to: string;
    date: string;
  }): Promise<any> {
    const timetableApiUrl =
      import.meta.env.VITE_TIMETABLE_API_URL ||
      "https://api.example.com/timetables";

    try {
      console.log("🚌 Querying timetable service:", params);

      const response = await this.fetch(
        `${timetableApiUrl}?from=${params.from}&to=${params.to}&date=${params.date}`
      );

      const timetable = await response.json();
      console.log("✅ Timetable retrieved:", timetable);
      return timetable;
    } catch (error) {
      console.error("❌ Timetable query failed:", error);
      throw error;
    }
  }

  /**
   * Query hotel booking service (x402-protected)
   * Example: Hotel agent queries availability API
   */
  async queryHotelAvailability(params: {
    location: { latitude: number; longitude: number };
    checkIn: string;
    checkOut: string;
    guests: number;
  }): Promise<any> {
    const hotelApiUrl =
      import.meta.env.VITE_HOTEL_API_URL ||
      "https://api.example.com/hotels/availability";

    try {
      console.log("🏨 Querying hotel availability:", params);

      const response = await this.fetch(hotelApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const availability = await response.json();
      console.log("✅ Hotel availability retrieved:", availability);
      return availability;
    } catch (error) {
      console.error("❌ Hotel availability query failed:", error);
      throw error;
    }
  }

  /**
   * Query Thirdweb Nexus for data
   * Example: Any agent queries Nexus for blockchain data
   */
  async queryNexus(query: string): Promise<any> {
    const nexusUrl = "https://nexus.thirdweb.com/api";

    try {
      console.log("🔷 Querying Thirdweb Nexus:", query);

      const response = await this.fetch(`${nexusUrl}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      console.log("✅ Nexus query successful:", result);
      return result;
    } catch (error) {
      console.error("❌ Nexus query failed:", error);
      throw error;
    }
  }

  /**
   * Get current USDh balance to ensure agent can pay
   */
  async checkBalance(): Promise<number> {
    if (!this.agentAccountId) {
      throw new Error("x402 Client not initialized");
    }

    const balance = await hederaService.getUSDhBalance(this.agentAccountId);
    console.log(`💰 Agent USDh balance: ${balance}`);

    if (balance < 1) {
      console.warn(
        "⚠️ Low balance! Agent may not be able to pay for x402 services"
      );
    }

    return balance;
  }
}

// Export singleton instance
export const x402Client = new X402Client();

// Export types
export type { X402Invoice, X402PaymentProof, X402Response };

/**
 * x402 Payment Service for Travel Agent
 * Implements HTTP 402 Payment Required protocol with Hedera HTS transfers
 *
 * Based on: tools/tutorial-a2a-x402-trustless-agent/a2a-agent/client.ts
 * Token: USDH 0.0.7218375 (Hedera Testnet)
 *
 * Protocol Flow:
 * 1. Make request to x402-protected MCP server
 * 2. Receive 402 response with payment invoice (L402 format)
 * 3. Parse invoice to extract: amount, recipient, proof_required
 * 4. Execute Hedera HTS transfer (USDH token)
 * 5. Retry request with payment proof in Authorization header
 */

import {
  Client,
  AccountId,
  PrivateKey,
  TransferTransaction,
  Hbar,
  TokenId,
  AccountBalanceQuery,
} from "@hashgraph/sdk";
import axios from "axios";

export class X402PaymentService {
  constructor(config) {
    this.accountId = AccountId.fromString(config.accountId);
    this.privateKey = PrivateKey.fromString(config.privateKey);
    this.usdhTokenId = TokenId.fromString(config.usdhTokenId || "0.0.7218375");
    this.network = config.network || "testnet";
    this.client = this._initClient();
    this.maxRetries = config.maxRetries || 3;
    this.retryDelayMs = config.retryDelayMs || 1000;
  }

  /**
   * Initialize Hedera client
   */
  _initClient() {
    const client =
      this.network === "mainnet" ? Client.forMainnet() : Client.forTestnet();

    client.setOperator(this.accountId, this.privateKey);
    return client;
  }

  /**
   * Parse L402 invoice from 402 response
   * Expected header format: "L402 invoice=<base64_invoice> macaroon=<base64_macaroon>"
   *
   * Invoice structure (decoded):
   * {
   *   "amount": "220000000000000",  // 0.00022 USDH in smallest units (18 decimals)
   *   "recipient": "0.0.7145000",    // MCP server Hedera account
   *   "memo": "flight_query_dck8b9de",
   *   "timestamp": 1704067200
   * }
   */
  _parseL402Header(header) {
    try {
      const parts = header.split(" ");
      if (parts[0] !== "L402") {
        throw new Error(`Invalid protocol: expected L402, got ${parts[0]}`);
      }

      const invoiceMatch = header.match(/invoice=([A-Za-z0-9+/=]+)/);
      const macaroonMatch = header.match(/macaroon=([A-Za-z0-9+/=]+)/);

      if (!invoiceMatch) {
        throw new Error("Missing invoice in L402 header");
      }

      const invoiceBase64 = invoiceMatch[1];
      const macaroonBase64 = macaroonMatch ? macaroonMatch[1] : null;

      // Decode invoice (base64 -> JSON)
      const invoiceJson = Buffer.from(invoiceBase64, "base64").toString(
        "utf-8"
      );
      const invoice = JSON.parse(invoiceJson);

      return {
        invoice,
        macaroon: macaroonBase64,
        rawHeader: header,
      };
    } catch (error) {
      throw new Error(`Failed to parse L402 header: ${error.message}`);
    }
  }

  /**
   * Execute Hedera HTS transfer for payment
   * @param {string} recipientAccountId - MCP server account (e.g., "0.0.7145000")
   * @param {string} amount - Amount in smallest units (e.g., "220000000000000" = 0.00022 USDH)
   * @param {string} memo - Payment memo for tracking
   * @returns {string} Transaction ID as payment proof
   */
  async _executePayment(recipientAccountId, amount, memo) {
    try {
      console.log(`[x402] Executing payment:`);
      console.log(`  From: ${this.accountId.toString()}`);
      console.log(`  To: ${recipientAccountId}`);
      console.log(`  Amount: ${amount} (smallest units)`);
      console.log(`  Token: ${this.usdhTokenId.toString()}`);
      console.log(`  Memo: ${memo}`);

      // Check agent balance before payment
      const balance = await new AccountBalanceQuery()
        .setAccountId(this.accountId)
        .execute(this.client);

      const tokenBalance = balance.tokens.get(this.usdhTokenId);
      console.log(`  Current USDH balance: ${tokenBalance || 0}`);

      if (!tokenBalance || tokenBalance.toNumber() < parseInt(amount)) {
        throw new Error(
          `Insufficient USDH balance: ${tokenBalance || 0} < ${amount}`
        );
      }

      // Build transfer transaction
      const transferTx = new TransferTransaction()
        .addTokenTransfer(this.usdhTokenId, this.accountId, -parseInt(amount))
        .addTokenTransfer(
          this.usdhTokenId,
          AccountId.fromString(recipientAccountId),
          parseInt(amount)
        )
        .setTransactionMemo(memo)
        .freezeWith(this.client);

      // Sign and execute
      const signedTx = await transferTx.sign(this.privateKey);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      if (receipt.status.toString() !== "SUCCESS") {
        throw new Error(`Payment failed: ${receipt.status.toString()}`);
      }

      const transactionId = txResponse.transactionId.toString();
      console.log(`[x402] Payment successful: ${transactionId}`);
      return transactionId;
    } catch (error) {
      console.error(`[x402] Payment execution failed:`, error);
      throw new Error(`Payment execution failed: ${error.message}`);
    }
  }

  /**
   * Make x402-protected API request with automatic payment handling
   * @param {string} url - MCP server endpoint
   * @param {object} options - Axios request options
   * @param {object} requestData - Request payload
   * @returns {object} Response data from MCP server
   */
  async makeX402Request(url, options = {}, requestData = null) {
    let attempt = 0;

    while (attempt < this.maxRetries) {
      attempt++;
      console.log(
        `[x402] Request attempt ${attempt}/${this.maxRetries}: ${url}`
      );

      try {
        // Prepare request configuration
        const config = {
          ...options,
          url,
          method: options.method || "POST",
          data: requestData,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          validateStatus: (status) => status < 500, // Don't throw on 402
        };

        // Execute initial request
        const response = await axios(config);

        // Success - data returned without payment
        if (response.status === 200) {
          console.log(`[x402] Request successful (no payment required)`);
          return response.data;
        }

        // 402 Payment Required
        if (response.status === 402) {
          console.log(`[x402] Payment required (402 response)`);

          // Extract L402 header
          const l402Header =
            response.headers["www-authenticate"] ||
            response.headers["WWW-Authenticate"];

          if (!l402Header) {
            throw new Error("402 response missing WWW-Authenticate header");
          }

          // Parse invoice
          const { invoice, macaroon } = this._parseL402Header(l402Header);
          console.log(`[x402] Invoice parsed:`, invoice);

          // Execute payment
          const paymentProof = await this._executePayment(
            invoice.recipient,
            invoice.amount,
            invoice.memo || `x402_payment_${Date.now()}`
          );

          console.log(`[x402] Retrying request with payment proof...`);

          // Retry with payment proof in Authorization header
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `L402 ${macaroon || ""}:${paymentProof}`,
            },
          };

          const retryResponse = await axios(retryConfig);

          if (retryResponse.status === 200) {
            console.log(`[x402] Request successful after payment`);
            // Attach transaction ID to response for tracking
            const responseData = retryResponse.data;
            responseData.transactionId = paymentProof; // x402 payment transaction ID
            return responseData;
          } else {
            throw new Error(
              `Request failed after payment: ${retryResponse.status} ${retryResponse.statusText}`
            );
          }
        }

        // Other error status
        throw new Error(
          `Request failed: ${response.status} ${response.statusText}`
        );
      } catch (error) {
        console.error(
          `[x402] Request failed (attempt ${attempt}):`,
          error.message
        );

        // Don't retry on certain errors
        if (
          error.message.includes("Insufficient USDH balance") ||
          error.message.includes("Invalid protocol")
        ) {
          throw error;
        }

        // Retry with delay
        if (attempt < this.maxRetries) {
          console.log(`[x402] Retrying in ${this.retryDelayMs}ms...`);
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelayMs)
          );
        } else {
          throw new Error(`Max retries exceeded: ${error.message}`);
        }
      }
    }

    throw new Error("Request failed after all retries");
  }

  /**
   * Check agent's USDH balance
   * @returns {number} Balance in smallest units
   */
  async getUsdhBalance() {
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(this.accountId)
        .execute(this.client);

      const tokenBalance = balance.tokens.get(this.usdhTokenId);
      return tokenBalance ? tokenBalance.toNumber() : 0;
    } catch (error) {
      console.error("[x402] Balance check failed:", error);
      return 0;
    }
  }

  /**
   * Close Hedera client connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}

export default X402PaymentService;

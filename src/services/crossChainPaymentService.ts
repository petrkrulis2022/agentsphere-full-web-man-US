/**
 * Cross-Chain Payment Service for AgentSphere
 * Handles CCIP-based and Bridge Kit / CCTP cross-chain USDC payments for agent interactions
 */

import {
  NetworkConfig,
  getCCIPSupportedNetworks,
  canSendCrossChainTo,
  getCCIPLaneAddress,
  estimateCrossChainFee,
  getNetworkByChainId,
  ALL_NETWORKS,
} from "../config/multiChainNetworks";
import { getCCIPNetworkByChainId } from "../config/ccipNetworkConfig";

// Payment rail type
export type PaymentRail = "ccip" | "bridgekit" | "gateway";

export interface CrossChainPaymentRequest {
  fromNetwork: NetworkConfig;
  toNetwork: NetworkConfig;
  fromAddress: string;
  toAddress: string; // Agent wallet address
  amount: number; // USDC amount
  agentId?: string;
  agentName?: string;
  rail?: PaymentRail; // preferred rail; defaults to auto-detect
  metadata?: {
    interactionType?: string;
    transactionId?: string;
    timestamp?: number;
  };
}

export interface CrossChainPaymentResult {
  success: boolean;
  transactionHash?: string;
  ccipMessageId?: string;
  // Bridge Kit / CCTP fields
  bridgeTransferId?: string;
  arcIntermediateChainId?: number;
  clientMustExecute?: boolean; // true when browser must sign txs
  routePlan?: BridgeKitRoutePlan;
  estimatedFee?: number;
  totalCost?: number;
  error?: string;
  paymentType: "same_chain" | "cross_chain";
  rail?: PaymentRail;
  sourceNetwork: string;
  destinationNetwork: string;
}

export interface PaymentEstimate {
  canProcess: boolean;
  agentFee: number; // What agent receives
  ccipFee: number; // Cross-chain transfer fee (legacy name kept for compat)
  bridgeFee?: number; // Bridge Kit fee when applicable
  totalUserCost: number; // Total cost to user
  estimatedTime: string; // Estimated completion time
  rail?: PaymentRail;
  route: {
    source: NetworkConfig;
    destination: NetworkConfig;
    intermediate?: NetworkConfig; // Arc hub when using Bridge Kit
    isDirect: boolean;
  };
  error?: string;
}

// Bridge Kit route plan (returned to client for wallet-side execution)
export interface BridgeKitRoutePlan {
  source: { chainId: number; domainId: number | null };
  intermediate: {
    chainId: number;
    domainId: number;
    usdcAddress: string;
    name: string;
  };
  destination: { chainId: number; domainId: number | null };
  amount: number;
  token: string;
}

// Arc Testnet constants
const ARC_CHAIN_ID = 5042002;
const ARC_CCTP_DOMAIN = 26;
const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

// Circle CCTP domain map (testnets)
const CIRCLE_DOMAIN_MAP: Record<number, number> = {
  11155111: 0, // Ethereum Sepolia
  84532: 6, // Base Sepolia
  43113: 1, // Avalanche Fuji
  5042002: 26, // Arc Testnet
};

export class CrossChainPaymentService {
  private supportedNetworks: NetworkConfig[];

  constructor() {
    this.supportedNetworks = getCCIPSupportedNetworks();
    // Also include Arc (which may not have CCIP but is reachable via Bridge Kit)
    const arcNet = Object.values(ALL_NETWORKS).find(
      (n) => n.chainId === ARC_CHAIN_ID,
    );
    if (
      arcNet &&
      !this.supportedNetworks.find((n) => n.chainId === ARC_CHAIN_ID)
    ) {
      this.supportedNetworks.push(arcNet);
    }
  }

  /**
   * Determine which rail to use for a given source → destination pair.
   * - If either end is Arc, use bridgekit.
   * - If both have circleDomainId, prefer bridgekit (routable via CCTP).
   * - Otherwise fall back to ccip.
   */
  detectRail(source: NetworkConfig, destination: NetworkConfig): PaymentRail {
    if (
      source.chainId === ARC_CHAIN_ID ||
      destination.chainId === ARC_CHAIN_ID
    ) {
      return "bridgekit";
    }
    if (
      source.circleDomainId !== undefined &&
      destination.circleDomainId !== undefined
    ) {
      return "bridgekit";
    }
    return "ccip";
  }

  /**
   * Check if Bridge Kit / CCTP route is available between two chains
   */
  canRouteViaBridgeKit(
    sourceChainId: number,
    destinationChainId: number,
  ): boolean {
    return (
      CIRCLE_DOMAIN_MAP[sourceChainId] !== undefined &&
      CIRCLE_DOMAIN_MAP[destinationChainId] !== undefined
    );
  }

  /**
   * Build a Bridge Kit route plan (returned to client for wallet-side execution)
   */
  buildBridgeKitRoutePlan(
    sourceChainId: number,
    destinationChainId: number,
    amount: number,
  ): BridgeKitRoutePlan {
    return {
      source: {
        chainId: sourceChainId,
        domainId: CIRCLE_DOMAIN_MAP[sourceChainId] ?? null,
      },
      intermediate: {
        chainId: ARC_CHAIN_ID,
        domainId: ARC_CCTP_DOMAIN,
        usdcAddress: ARC_USDC_ADDRESS,
        name: "Arc Testnet",
      },
      destination: {
        chainId: destinationChainId,
        domainId: CIRCLE_DOMAIN_MAP[destinationChainId] ?? null,
      },
      amount,
      token: "USDC",
    };
  }

  /**
   * Estimate cross-chain payment costs and feasibility
   */
  async estimatePayment(
    sourceChainId: number | string,
    destinationChainId: number | string,
    agentFee: number,
  ): Promise<PaymentEstimate> {
    const sourceNetwork = getNetworkByChainId(
      typeof sourceChainId === "string" ? 0 : sourceChainId,
    );
    const destinationNetwork = getNetworkByChainId(
      typeof destinationChainId === "string" ? 0 : destinationChainId,
    );

    if (!sourceNetwork || !destinationNetwork) {
      return {
        canProcess: false,
        agentFee,
        ccipFee: 0,
        totalUserCost: agentFee,
        estimatedTime: "N/A",
        route: {
          source: sourceNetwork!,
          destination: destinationNetwork!,
          isDirect: false,
        },
        error: "Unsupported network",
      };
    }

    // Same chain payment (no CCIP fees)
    if (sourceChainId.toString() === destinationChainId.toString()) {
      return {
        canProcess: true,
        agentFee,
        ccipFee: 0,
        totalUserCost: agentFee,
        estimatedTime: "1-2 minutes",
        route: {
          source: sourceNetwork,
          destination: destinationNetwork,
          isDirect: true,
        },
      };
    }

    // Cross-chain payment estimation
    // Try Bridge Kit route first (via Arc)
    const srcId = typeof sourceChainId === "number" ? sourceChainId : 0;
    const dstId =
      typeof destinationChainId === "number" ? destinationChainId : 0;
    if (this.canRouteViaBridgeKit(srcId, dstId)) {
      const arcNetwork = getNetworkByChainId(ARC_CHAIN_ID);
      const bridgeFee = agentFee * 0.001 + 0.5; // 0.1% + $0.50 base
      return {
        canProcess: true,
        agentFee,
        ccipFee: 0, // not using CCIP
        bridgeFee,
        totalUserCost: agentFee + bridgeFee,
        estimatedTime: "<30 seconds (via Arc)",
        rail: "bridgekit",
        route: {
          source: sourceNetwork,
          destination: destinationNetwork,
          intermediate: arcNetwork || undefined,
          isDirect: false,
        },
      };
    }

    // Fallback: CCIP estimation
    if (!canSendCrossChainTo(sourceNetwork, destinationChainId)) {
      return {
        canProcess: false,
        agentFee,
        ccipFee: 0,
        totalUserCost: agentFee,
        estimatedTime: "N/A",
        route: {
          source: sourceNetwork,
          destination: destinationNetwork,
          isDirect: false,
        },
        error: `Cross-chain transfer not available from ${sourceNetwork.name} to ${destinationNetwork.name}`,
      };
    }

    const feeEstimate = await estimateCrossChainFee(
      sourceNetwork,
      destinationNetwork,
      agentFee,
    );

    if (!feeEstimate.canSend) {
      return {
        canProcess: false,
        agentFee,
        ccipFee: 0,
        totalUserCost: agentFee,
        estimatedTime: "N/A",
        route: {
          source: sourceNetwork,
          destination: destinationNetwork,
          isDirect: false,
        },
        error: feeEstimate.error,
      };
    }

    return {
      canProcess: true,
      agentFee,
      ccipFee: feeEstimate.estimatedFee || 2.5,
      totalUserCost: feeEstimate.totalCost || agentFee + 2.5,
      estimatedTime: "5-15 minutes",
      route: {
        source: sourceNetwork,
        destination: destinationNetwork,
        isDirect: true,
      },
    };
  }

  /**
   * Process cross-chain payment (implementation would integrate with actual CCIP contracts)
   */
  async processPayment(
    request: CrossChainPaymentRequest,
  ): Promise<CrossChainPaymentResult> {
    try {
      // Validate payment request
      const validation = this.validatePaymentRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          paymentType: "cross_chain",
          sourceNetwork: request.fromNetwork.name,
          destinationNetwork: request.toNetwork.name,
        };
      }

      // Check if same chain or cross-chain
      const isSameChain =
        request.fromNetwork.chainId === request.toNetwork.chainId;

      if (isSameChain) {
        return this.processSameChainPayment(request);
      }

      // Determine rail
      const rail =
        request.rail || this.detectRail(request.fromNetwork, request.toNetwork);

      if (rail === "bridgekit") {
        return this.processBridgeKitPayment(request);
      } else {
        return this.processCrossChainPayment(request);
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Payment processing failed",
        paymentType: "cross_chain",
        sourceNetwork: request.fromNetwork.name,
        destinationNetwork: request.toNetwork.name,
      };
    }
  }

  /**
   * Validate payment request
   */
  private validatePaymentRequest(request: CrossChainPaymentRequest): {
    valid: boolean;
    error?: string;
  } {
    if (!request.fromNetwork || !request.toNetwork) {
      return { valid: false, error: "Invalid network configuration" };
    }

    if (!request.fromAddress || !request.toAddress) {
      return { valid: false, error: "Invalid wallet addresses" };
    }

    if (request.amount <= 0) {
      return { valid: false, error: "Invalid payment amount" };
    }

    // Check if networks are supported
    if (
      !this.supportedNetworks.find(
        (n) => n.chainId === request.fromNetwork.chainId,
      )
    ) {
      return {
        valid: false,
        error: `Source network ${request.fromNetwork.name} not supported`,
      };
    }

    if (
      !this.supportedNetworks.find(
        (n) => n.chainId === request.toNetwork.chainId,
      )
    ) {
      return {
        valid: false,
        error: `Destination network ${request.toNetwork.name} not supported`,
      };
    }

    return { valid: true };
  }

  /**
   * Process same-chain payment (existing functionality)
   */
  private async processSameChainPayment(
    request: CrossChainPaymentRequest,
  ): Promise<CrossChainPaymentResult> {
    // This would integrate with existing same-chain payment logic
    // For now, simulate successful payment
    console.log("🔄 Processing same-chain payment:", request);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    return {
      success: true,
      transactionHash: mockTxHash,
      paymentType: "same_chain",
      sourceNetwork: request.fromNetwork.name,
      destinationNetwork: request.toNetwork.name,
      totalCost: request.amount,
    };
  }

  /**
   * Process cross-chain payment using Bridge Kit (via Arc)
   * Returns clientMustExecute: true — the AR Viewer frontend calls Bridge Kit SDK.
   */
  private async processBridgeKitPayment(
    request: CrossChainPaymentRequest,
  ): Promise<CrossChainPaymentResult> {
    console.log(
      "🌉 Processing Bridge Kit (Arc) payment — client-side execution required:",
      request,
    );

    const routePlan = this.buildBridgeKitRoutePlan(
      request.fromNetwork.chainId,
      request.toNetwork.chainId,
      request.amount,
    );

    if (!routePlan) {
      return {
        success: false,
        error: "Cannot build Bridge Kit route plan between these networks",
        paymentType: "cross_chain",
        sourceNetwork: request.fromNetwork.name,
        destinationNetwork: request.toNetwork.name,
      };
    }

    const bridgeFee = request.amount * 0.001 + 0.5; // 0.1% + $0.50

    return {
      success: true,
      paymentType: "cross_chain",
      rail: "bridgekit",
      clientMustExecute: true,
      routePlan,
      sourceNetwork: request.fromNetwork.name,
      destinationNetwork: request.toNetwork.name,
      arcIntermediateChainId: ARC_CHAIN_ID,
      estimatedFee: bridgeFee,
      totalCost: request.amount + bridgeFee,
    };
  }

  /**
   * Process cross-chain payment using CCIP
   */
  private async processCrossChainPayment(
    request: CrossChainPaymentRequest,
  ): Promise<CrossChainPaymentResult> {
    console.log("🌉 Processing cross-chain payment via CCIP:", request);

    // Get CCIP configurations
    const sourceCCIP = getCCIPNetworkByChainId(request.fromNetwork.chainId);
    const destinationCCIP = getCCIPNetworkByChainId(request.toNetwork.chainId);

    if (!sourceCCIP || !destinationCCIP) {
      return {
        success: false,
        error: "CCIP configuration not found for networks",
        paymentType: "cross_chain",
        sourceNetwork: request.fromNetwork.name,
        destinationNetwork: request.toNetwork.name,
      };
    }

    // Get CCIP lane address
    const laneAddress = getCCIPLaneAddress(
      request.fromNetwork,
      request.toNetwork,
    );
    if (!laneAddress) {
      return {
        success: false,
        error: "No CCIP lane available between networks",
        paymentType: "cross_chain",
        sourceNetwork: request.fromNetwork.name,
        destinationNetwork: request.toNetwork.name,
      };
    }

    // Estimate fees
    const feeEstimate = await estimateCrossChainFee(
      request.fromNetwork,
      request.toNetwork,
      request.amount,
    );

    if (!feeEstimate.canSend) {
      return {
        success: false,
        error: feeEstimate.error || "Cross-chain transfer not available",
        paymentType: "cross_chain",
        sourceNetwork: request.fromNetwork.name,
        destinationNetwork: request.toNetwork.name,
      };
    }

    // TODO: Integrate with actual CCIP smart contracts
    // This would involve:
    // 1. Approve USDC spending by CCIP router
    // 2. Call CCIP router with destination chain selector and recipient
    // 3. Monitor CCIP message execution

    // Simulate CCIP processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const mockCCIPMessageId = `0x${Math.random().toString(16).substr(2, 64)}`;

    return {
      success: true,
      transactionHash: mockTxHash,
      ccipMessageId: mockCCIPMessageId,
      estimatedFee: feeEstimate.estimatedFee,
      totalCost: feeEstimate.totalCost,
      paymentType: "cross_chain",
      sourceNetwork: request.fromNetwork.name,
      destinationNetwork: request.toNetwork.name,
    };
  }

  /**
   * Get all supported cross-chain routes for display
   */
  getSupportedRoutes(): Array<{
    source: NetworkConfig;
    destinations: NetworkConfig[];
  }> {
    return this.supportedNetworks.map((sourceNetwork) => ({
      source: sourceNetwork,
      destinations: this.supportedNetworks.filter(
        (targetNetwork) =>
          targetNetwork.chainId !== sourceNetwork.chainId &&
          canSendCrossChainTo(sourceNetwork, targetNetwork.chainId),
      ),
    }));
  }

  /**
   * Check if user has sufficient balance for cross-chain payment
   */
  async checkSufficientBalance(requiredAmount: number): Promise<{
    hasSufficientBalance: boolean;
    currentBalance: number;
    requiredAmount: number;
    deficit?: number;
  }> {
    // TODO: Integrate with actual balance checking
    // This would check USDC balance on the source network

    // For now, simulate balance check
    const mockBalance = 10.0; // Mock balance
    const hasSufficientBalance = mockBalance >= requiredAmount;

    return {
      hasSufficientBalance,
      currentBalance: mockBalance,
      requiredAmount,
      deficit: hasSufficientBalance ? undefined : requiredAmount - mockBalance,
    };
  }

  /**
   * Get payment history (for future implementation)
   */
  async getPaymentHistory(limit: number = 10): Promise<
    Array<{
      id: string;
      timestamp: number;
      amount: number;
      sourceNetwork: string;
      destinationNetwork: string;
      agentId?: string;
      agentName?: string;
      status: "pending" | "completed" | "failed";
      transactionHash?: string;
      ccipMessageId?: string;
    }>
  > {
    console.log(`Getting payment history with limit: ${limit}`);
    // TODO: Implement payment history tracking
    return [];
  }
}

// Export singleton instance
export const crossChainPaymentService = new CrossChainPaymentService();

export default crossChainPaymentService;

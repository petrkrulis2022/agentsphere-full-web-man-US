/**
 * Hedera Service Module
 * Handles all Hedera-related operations including:
 * - Agent wallet creation
 * - ERC-8004 identity NFT minting
 * - x402 payment processing
 * - A2A communication setup
 */

import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  AccountId,
  TokenAssociateTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
} from "@hashgraph/sdk";

// USDh Token ID from Hedera Testnet
const USDH_TOKEN_ID = "0.0.7218375";

// Treasury account credentials (from .env)
const TREASURY_ACCOUNT_ID = import.meta.env.VITE_TREASURY_ACCOUNT_ID || "";
const TREASURY_PRIVATE_KEY = import.meta.env.VITE_TREASURY_PRIVATE_KEY || "";

// ERC-8004 Contract ID (deployed once, stored in env)
const ERC8004_CONTRACT_ID = import.meta.env.VITE_ERC8004_CONTRACT_ID || "";

interface AgentWallet {
  accountId: string;
  privateKey: string;
  publicKey: string;
  evmAddress: string;
}

interface AgentIdentity {
  nftId: string;
  tokenId: string;
  serialNumber: number;
  agentCardUrl: string;
}

interface X402PaymentRequest {
  serviceUrl: string;
  amount: number;
  memo: string;
}

/**
 * Initialize Hedera client for Testnet
 */
function getHederaClient(): Client {
  if (!TREASURY_ACCOUNT_ID || !TREASURY_PRIVATE_KEY) {
    throw new Error(
      "Treasury account credentials not configured. Check .env file."
    );
  }

  try {
    const client = Client.forTestnet();

    console.log("🔑 Treasury Account ID:", TREASURY_ACCOUNT_ID);
    console.log(
      "🔑 Treasury Key (first 20 chars):",
      TREASURY_PRIVATE_KEY.substring(0, 20) + "..."
    );

    const accountId = AccountId.fromString(TREASURY_ACCOUNT_ID);
    const privateKey = PrivateKey.fromStringDer(TREASURY_PRIVATE_KEY);

    client.setOperator(accountId, privateKey);

    return client;
  } catch (error) {
    console.error("❌ Failed to initialize Hedera client:", error);
    throw new Error(
      `Hedera client initialization failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Creates a new Hedera account for an agent with initial HBAR balance
 * and associates it with the USDh stablecoin
 *
 * @param initialHbarBalance - Initial HBAR balance (default: 10)
 * @returns Agent wallet details (accountId, privateKey, publicKey)
 */
export async function createAgentWallet(
  initialHbarBalance: number = 10
): Promise<AgentWallet> {
  const client = getHederaClient();

  try {
    // Generate new key pair for agent
    const newPrivateKey = PrivateKey.generateED25519();
    const newPublicKey = newPrivateKey.publicKey;

    console.log("🔑 Generating new agent wallet...");

    // Create account transaction
    const createAccountTx = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(initialHbarBalance))
      .setMaxAutomaticTokenAssociations(10); // Allow automatic token associations

    const createResponse = await createAccountTx.execute(client);
    const createReceipt = await createResponse.getReceipt(client);
    const newAccountId = createReceipt.accountId;

    if (!newAccountId) {
      throw new Error("Failed to create agent account");
    }

    console.log(`✅ Agent account created: ${newAccountId.toString()}`);

    // Associate the new account with USDh token
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(newAccountId)
      .setTokenIds([USDH_TOKEN_ID])
      .freezeWith(client);

    const signedAssociateTx = await associateTx.sign(newPrivateKey);
    const associateResponse = await signedAssociateTx.execute(client);
    await associateResponse.getReceipt(client);

    console.log(
      `✅ Agent account ${newAccountId.toString()} associated with USDh token`
    );

    // Convert Hedera account ID to EVM address format
    const evmAddress = newAccountId.toSolidityAddress();
    console.log(`🔗 EVM address: 0x${evmAddress}`);

    return {
      accountId: newAccountId.toString(),
      privateKey: newPrivateKey.toStringRaw(),
      publicKey: newPublicKey.toString(),
      evmAddress: `0x${evmAddress}`,
    };
  } catch (error) {
    console.error("❌ Error creating agent wallet:", error);
    throw error;
  }
}

/**
 * Mints an ERC-8004 identity NFT for an agent
 * Links the NFT to the agent's card URL
 *
 * @param agentAccountId - The agent's Hedera account ID
 * @param agentCardUrl - URL to the agent's card/profile
 * @param agentName - Name of the agent
 * @returns Agent identity details
 */
export async function mintAgentIdentity(
  agentAccountId: string,
  agentCardUrl: string,
  agentName: string
): Promise<AgentIdentity> {
  const client = getHederaClient();

  try {
    if (!ERC8004_CONTRACT_ID) {
      throw new Error(
        "ERC-8004 contract not deployed. Run deployment script first."
      );
    }

    console.log(`🎭 Minting identity NFT for agent: ${agentName}`);

    // Prepare metadata
    const metadata = JSON.stringify({
      name: agentName,
      cardUrl: agentCardUrl,
      standard: "ERC-8004",
      timestamp: Date.now(),
    });

    // Call the mint function on ERC-8004 contract
    const mintTx = new ContractExecuteTransaction()
      .setContractId(ERC8004_CONTRACT_ID)
      .setGas(300000)
      .setFunction(
        "mintIdentity",
        new ContractFunctionParameters()
          .addAddress(agentAccountId)
          .addString(metadata)
      );

    const mintResponse = await mintTx.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);

    console.log(`✅ Identity NFT minted successfully`);

    // Note: You'll need to query the contract to get the actual NFT ID/serial number
    // This is a placeholder - implement based on your ERC-8004 contract structure
    return {
      nftId: `${ERC8004_CONTRACT_ID}-${Date.now()}`,
      tokenId: ERC8004_CONTRACT_ID,
      serialNumber: 0, // Get from contract event
      agentCardUrl,
    };
  } catch (error) {
    console.error("❌ Error minting agent identity:", error);
    throw error;
  }
}

/**
 * Transfers USDh tokens from one account to another
 * Used for agent-to-server x402 payments
 *
 * @param fromAccountId - Sender's account ID
 * @param fromPrivateKey - Sender's private key
 * @param toAccountId - Recipient's account ID
 * @param amount - Amount in USDh (with decimals)
 * @param memo - Payment memo
 */
export async function transferUSDh(
  fromAccountId: string,
  fromPrivateKey: string,
  toAccountId: string,
  amount: number,
  memo: string = ""
): Promise<string> {
  const client = getHederaClient();
  client.setOperator(
    AccountId.fromString(fromAccountId),
    PrivateKey.fromString(fromPrivateKey)
  );

  try {
    console.log(
      `💸 Transferring ${amount} USDh from ${fromAccountId} to ${toAccountId}`
    );

    // Convert amount to smallest unit (assuming 6 decimals for USDh)
    const amountInSmallestUnit = Math.floor(amount * 1000000);

    const transferTx = new TransferTransaction()
      .addTokenTransfer(USDH_TOKEN_ID, fromAccountId, -amountInSmallestUnit)
      .addTokenTransfer(USDH_TOKEN_ID, toAccountId, amountInSmallestUnit)
      .setTransactionMemo(memo);

    const transferResponse = await transferTx.execute(client);
    const transferReceipt = await transferResponse.getReceipt(client);

    console.log(`✅ Transfer successful: ${transferReceipt.status.toString()}`);

    return transferResponse.transactionId.toString();
  } catch (error) {
    console.error("❌ Error transferring USDh:", error);
    throw error;
  }
}

/**
 * Processes an x402 payment for external data services
 * Agent pays for data on behalf of the user
 *
 * @param agentAccountId - Agent's account ID
 * @param agentPrivateKey - Agent's private key
 * @param request - x402 payment request details
 */
export async function processX402Payment(
  agentAccountId: string,
  agentPrivateKey: string,
  request: X402PaymentRequest
): Promise<{ transactionId: string; paymentProof: string }> {
  try {
    console.log(`💳 Processing x402 payment for: ${request.serviceUrl}`);

    // Transfer USDh to the service provider
    const transactionId = await transferUSDh(
      agentAccountId,
      agentPrivateKey,
      request.serviceUrl, // In real implementation, extract recipient from 402 response
      request.amount,
      request.memo
    );

    // Generate payment proof (hash of transaction ID + timestamp)
    const paymentProof = Buffer.from(`${transactionId}-${Date.now()}`).toString(
      "base64"
    );

    console.log(`✅ x402 payment processed: ${transactionId}`);

    return {
      transactionId,
      paymentProof,
    };
  } catch (error) {
    console.error("❌ Error processing x402 payment:", error);
    throw error;
  }
}

/**
 * Gets the USDh balance for an account
 *
 * @param accountId - Account ID to check balance
 */
export async function getUSDhBalance(accountId: string): Promise<number> {
  const client = getHederaClient();

  try {
    const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
    const balance = await balanceQuery.execute(client);

    const usdhBalance = balance.tokens?.get(USDH_TOKEN_ID);
    const balanceInUSDh = usdhBalance ? Number(usdhBalance) / 1000000 : 0;

    console.log(`💰 USDh balance for ${accountId}: ${balanceInUSDh}`);

    return balanceInUSDh;
  } catch (error) {
    console.error("❌ Error getting USDh balance:", error);
    return 0;
  }
}

/**
 * Multi-transfer for splitting payments among multiple agents
 * Used when user pays for a journey involving multiple agents
 *
 * @param userAccountId - User's account ID
 * @param userPrivateKey - User's private key
 * @param transfers - Array of {accountId, amount} for each recipient
 */
export async function multiTransferUSDh(
  userAccountId: string,
  userPrivateKey: string,
  transfers: Array<{ accountId: string; amount: number; description: string }>
): Promise<string> {
  const client = getHederaClient();
  client.setOperator(
    AccountId.fromString(userAccountId),
    PrivateKey.fromString(userPrivateKey)
  );

  try {
    console.log(
      `💸 Multi-transfer from ${userAccountId} to ${transfers.length} recipients`
    );

    let transferTx = new TransferTransaction();

    // Calculate total and add all transfers
    let totalAmount = 0;
    transfers.forEach(({ accountId, amount, description }) => {
      const amountInSmallestUnit = Math.floor(amount * 1000000);
      totalAmount += amountInSmallestUnit;

      transferTx = transferTx.addTokenTransfer(
        USDH_TOKEN_ID,
        accountId,
        amountInSmallestUnit
      );

      console.log(`  → ${description}: ${amount} USDh to ${accountId}`);
    });

    // Deduct total from user
    transferTx = transferTx
      .addTokenTransfer(USDH_TOKEN_ID, userAccountId, -totalAmount)
      .setTransactionMemo(
        `Journey payment: ${transfers.map((t) => t.description).join(", ")}`
      );

    const transferResponse = await transferTx.execute(client);
    const transferReceipt = await transferResponse.getReceipt(client);

    console.log(
      `✅ Multi-transfer successful: ${transferReceipt.status.toString()}`
    );

    return transferResponse.transactionId.toString();
  } catch (error) {
    console.error("❌ Error in multi-transfer:", error);
    throw error;
  }
}

/**
 * Fund agent wallet with initial USDh from treasury
 * Used during agent deployment to give agents initial operating capital
 *
 * @param agentAccountId - Agent's account ID
 * @param amount - Amount of USDh to transfer
 */
export async function fundAgentWallet(
  agentAccountId: string,
  amount: number
): Promise<void> {
  try {
    console.log(`💵 Funding agent ${agentAccountId} with ${amount} USDh`);

    await transferUSDh(
      TREASURY_ACCOUNT_ID,
      TREASURY_PRIVATE_KEY,
      agentAccountId,
      amount,
      "Initial agent funding"
    );

    console.log(`✅ Agent wallet funded successfully`);
  } catch (error) {
    console.error("❌ Error funding agent wallet:", error);
    throw error;
  }
}

export const hederaService = {
  createAgentWallet,
  mintAgentIdentity,
  transferUSDh,
  processX402Payment,
  getUSDhBalance,
  multiTransferUSDh,
  fundAgentWallet,
};

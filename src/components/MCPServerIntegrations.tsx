import React, { useState } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

interface MCPServerConfig {
  [serverId: string]: {
    enabled: boolean;
    config: Record<string, any>;
    configSchema: Record<string, FieldDefinition>;
  };
}

interface FieldDefinition {
  type: "string" | "number" | "boolean" | "select";
  required: boolean;
  sensitive?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

interface MCPServerIntegrationsProps {
  selectedServers: string[];
  onToggleServer: (serverId: string) => void;
  onConfigUpdate: (serverId: string, config: Record<string, any>) => void;
  className?: string;
}

export const FINANCIAL_MCP_SERVERS = {
  BLOCKCHAIN: [
    {
      id: "solana-mcp",
      name: "Solana Network",
      category: "blockchain",
      icon: "🟣",
      description: "Native Solana blockchain interaction",
      configSchema: {
        network: {
          type: "select",
          required: true,
          options: ["mainnet", "devnet", "testnet"],
          description: "Solana network to connect to",
        },
        rpc_endpoint: {
          type: "string",
          required: true,
          placeholder: "https://api.mainnet-beta.solana.com",
          description: "Custom RPC endpoint (optional)",
        },
      },
    },
    {
      id: "ethereum-mcp",
      name: "Ethereum/EVM",
      category: "blockchain",
      icon: "⟠",
      description: "EVM-compatible chains (Ethereum, Polygon, etc.)",
      configSchema: {
        network: {
          type: "select",
          required: true,
          options: ["ethereum", "polygon", "arbitrum", "optimism", "sepolia"],
          description: "EVM network to connect to",
        },
        rpc_endpoint: {
          type: "string",
          required: false,
          placeholder: "https://eth-mainnet.alchemyapi.io/v2/YOUR-KEY",
          description: "Custom RPC endpoint",
        },
        contract_address: {
          type: "string",
          required: false,
          placeholder: "0x...",
          description: "Smart contract address for interactions",
        },
      },
    },
    {
      id: "bitcoin-mcp",
      name: "Bitcoin Network",
      category: "blockchain",
      icon: "🟠",
      description: "Bitcoin blockchain interaction",
      configSchema: {
        network: {
          type: "select",
          required: true,
          options: ["mainnet", "testnet"],
          description: "Bitcoin network",
        },
        fee_rate: {
          type: "number",
          required: false,
          description: "Default fee rate in satoshi/byte",
        },
      },
    },
    {
      id: "hedera-mcp",
      name: "Hedera Network",
      category: "blockchain",
      icon: "🔷",
      description: "Hedera Hashgraph network",
      configSchema: {
        network: {
          type: "select",
          required: true,
          options: ["mainnet", "testnet"],
          description: "Hedera network",
        },
        account_id: {
          type: "string",
          required: true,
          placeholder: "0.0.xxxxx",
          description: "Your Hedera account ID",
        },
      },
    },
  ],
  BANKING: [
    {
      id: "swift-mcp",
      name: "SWIFT Wire Transfers",
      category: "banking",
      icon: "🏦",
      description: "International wire transfers",
      configSchema: {
        api_key: {
          type: "string",
          required: true,
          sensitive: true,
          description: "SWIFT API key",
        },
        default_currency: {
          type: "select",
          required: true,
          options: ["USD", "EUR", "GBP", "JPY", "CHF"],
          description: "Default currency for transfers",
        },
      },
    },
    {
      id: "ach-mcp",
      name: "ACH Bank Transfers",
      category: "banking",
      icon: "🏧",
      description: "US domestic ACH transfers",
      configSchema: {
        api_key: {
          type: "string",
          required: true,
          sensitive: true,
          description: "ACH service API key",
        },
        originating_account: {
          type: "string",
          required: true,
          placeholder: "Account ID",
          description: "Your originating bank account",
        },
      },
    },
    {
      id: "revolut-mcp",
      name: "Revolut Banking API",
      category: "banking",
      icon: "💙",
      description: "Revolut banking service",
      configSchema: {
        api_key: {
          type: "string",
          required: true,
          sensitive: true,
          description: "Revolut API key",
        },
        webhook_secret: {
          type: "string",
          required: false,
          sensitive: true,
          description: "Webhook signing secret",
        },
      },
    },
  ],
  PAYMENT: [
    {
      id: "stripe-mcp",
      name: "Stripe Payments",
      category: "payment",
      icon: "🟦",
      description: "Stripe payment processing",
      configSchema: {
        api_key: {
          type: "string",
          required: true,
          sensitive: true,
          description: "Stripe API key (sk_...)",
        },
        api_version: {
          type: "string",
          required: true,
          placeholder: "2024-02-01",
          description: "Stripe API version",
        },
        webhook_secret: {
          type: "string",
          required: false,
          sensitive: true,
          description: "Webhook signing secret (whsec_...)",
        },
      },
    },
    {
      id: "paypal-mcp",
      name: "PayPal Payments",
      category: "payment",
      icon: "📘",
      description: "PayPal payment processing",
      configSchema: {
        client_id: {
          type: "string",
          required: true,
          sensitive: true,
          description: "PayPal Client ID",
        },
        client_secret: {
          type: "string",
          required: true,
          sensitive: true,
          description: "PayPal Client Secret",
        },
        mode: {
          type: "select",
          required: true,
          options: ["sandbox", "live"],
          description: "PayPal environment mode",
        },
      },
    },
  ],
  DEFI: [
    {
      id: "uniswap-mcp",
      name: "Uniswap DEX",
      category: "defi",
      icon: "🦄",
      description: "Decentralized exchange interaction",
      configSchema: {
        network: {
          type: "select",
          required: true,
          options: ["ethereum", "polygon", "arbitrum", "optimism"],
          description: "Network for Uniswap",
        },
        slippage: {
          type: "number",
          required: true,
          placeholder: "0.5",
          description: "Default slippage tolerance (%)",
        },
        router_address: {
          type: "string",
          required: false,
          placeholder: "0x...",
          description: "Custom router contract address",
        },
      },
    },
    {
      id: "aave-mcp",
      name: "Aave Lending",
      category: "defi",
      icon: "👻",
      description: "Aave lending protocol",
      configSchema: {
        network: {
          type: "select",
          required: true,
          options: ["ethereum", "polygon", "arbitrum", "optimism"],
          description: "Network for Aave",
        },
        pool_address: {
          type: "string",
          required: false,
          placeholder: "0x...",
          description: "Aave Pool contract address",
        },
      },
    },
    {
      id: "curve-mcp",
      name: "Curve Stablecoins",
      category: "defi",
      icon: "📈",
      description: "Curve stablecoin DEX",
      configSchema: {
        network: {
          type: "select",
          required: true,
          options: ["ethereum", "polygon", "arbitrum"],
          description: "Network for Curve",
        },
      },
    },
  ],
  DATA: [
    {
      id: "coingecko-mcp",
      name: "CoinGecko Data",
      category: "data",
      icon: "📊",
      description: "Cryptocurrency market data",
      configSchema: {
        api_tier: {
          type: "select",
          required: true,
          options: ["free", "pro"],
          description: "CoinGecko API tier",
        },
        api_key: {
          type: "string",
          required: false,
          sensitive: true,
          description: "API key (for Pro tier)",
        },
      },
    },
    {
      id: "chainlink-mcp",
      name: "Chainlink Oracles",
      category: "data",
      icon: "🔗",
      description: "Chainlink oracle services",
      configSchema: {
        network: {
          type: "select",
          required: true,
          options: ["ethereum", "polygon", "arbitrum", "optimism"],
          description: "Network for Chainlink",
        },
      },
    },
    {
      id: "thegraph-mcp",
      name: "TheGraph Queries",
      category: "data",
      icon: "📈",
      description: "TheGraph data indexing",
      configSchema: {
        api_key: {
          type: "string",
          required: false,
          sensitive: true,
          description: "TheGraph API key",
        },
      },
    },
  ],
  COMPLIANCE: [
    {
      id: "kyc-mcp",
      name: "KYC Verification",
      category: "compliance",
      icon: "✅",
      description: "Know Your Customer verification",
      configSchema: {
        api_key: {
          type: "string",
          required: true,
          sensitive: true,
          description: "KYC service API key",
        },
        webhook_secret: {
          type: "string",
          required: false,
          sensitive: true,
          description: "Webhook signing secret",
        },
      },
    },
    {
      id: "aml-mcp",
      name: "AML Screening",
      category: "compliance",
      icon: "🛡️",
      description: "AML/sanctions screening",
      configSchema: {
        api_key: {
          type: "string",
          required: true,
          sensitive: true,
          description: "AML service API key",
        },
      },
    },
  ],
};

export default function MCPServerIntegrations({
  selectedServers,
  onToggleServer,
  onConfigUpdate,
  className = "",
}: MCPServerIntegrationsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "BLOCKCHAIN",
  );
  const [configExpanded, setConfigExpanded] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [serverConfigs, setServerConfigs] = useState<MCPServerConfig>({});

  const toggleServerConfig = (serverId: string) => {
    const isCurrentlySelected = selectedServers.includes(serverId);

    if (isCurrentlySelected) {
      // Deselect and remove config
      const newConfigs = { ...serverConfigs };
      delete newConfigs[serverId];
      setServerConfigs(newConfigs);
      onConfigUpdate(serverId, {});
    }

    onToggleServer(serverId);
  };

  const updateFieldValue = (
    serverId: string,
    fieldName: string,
    value: any,
  ) => {
    const currentServer = Object.values(FINANCIAL_MCP_SERVERS)
      .flat()
      .find((s) => s.id === serverId);

    if (!currentServer) return;

    const updatedConfigs = {
      ...serverConfigs,
      [serverId]: {
        enabled: true,
        config: {
          ...serverConfigs[serverId]?.config,
          [fieldName]: value,
        },
        configSchema: currentServer.configSchema,
      },
    };

    setServerConfigs(updatedConfigs);
    onConfigUpdate(serverId, updatedConfigs[serverId].config);
  };

  const toggleSecretVisibility = (fieldId: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(fieldId)) {
      newVisible.delete(fieldId);
    } else {
      newVisible.add(fieldId);
    }
    setVisibleSecrets(newVisible);
  };

  const renderConfigField = (
    serverId: string,
    fieldName: string,
    field: FieldDefinition,
  ) => {
    const fieldId = `${serverId}-${fieldName}`;
    const currentValue = serverConfigs[serverId]?.config?.[fieldName] || "";
    const isVisible = visibleSecrets.has(fieldId);

    return (
      <div key={fieldName} className="mb-3">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {fieldName.replace(/_/g, " ")}
          {field.required && <span className="text-red-400">*</span>}
        </label>
        {field.description && (
          <p className="text-xs text-gray-400 mb-1">{field.description}</p>
        )}

        {field.type === "select" ? (
          <select
            value={currentValue}
            onChange={(e) =>
              updateFieldValue(serverId, fieldName, e.target.value)
            }
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select {fieldName.replace(/_/g, " ")}</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : field.type === "number" ? (
          <input
            type="number"
            value={currentValue}
            onChange={(e) =>
              updateFieldValue(serverId, fieldName, parseFloat(e.target.value))
            }
            placeholder={field.placeholder}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        ) : (
          <div className="relative">
            <input
              type={field.sensitive && !isVisible ? "password" : "text"}
              value={currentValue}
              onChange={(e) =>
                updateFieldValue(serverId, fieldName, e.target.value)
              }
              placeholder={field.placeholder}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
            />
            {field.sensitive && (
              <button
                type="button"
                onClick={() => toggleSecretVisibility(fieldId)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="text-xl">🔌</div>
        <h3 className="text-lg font-semibold text-gray-100">
          Financial MCP Servers
        </h3>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Connect to crypto, banking, and payment integrations. Each agent can use
        multiple servers simultaneously.
      </p>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {Object.keys(FINANCIAL_MCP_SERVERS).map((category) => (
          <button
            key={category}
            onClick={() =>
              setExpandedCategory(
                expandedCategory === category ? null : category,
              )
            }
            className={`px-3 py-2 rounded text-sm font-medium transition ${
              expandedCategory === category
                ? "bg-emerald-600 text-white"
                : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Server List by Category */}
      {expandedCategory && (
        <div className="border-t border-slate-700 pt-4">
          <div className="space-y-3">
            {FINANCIAL_MCP_SERVERS[
              expandedCategory as keyof typeof FINANCIAL_MCP_SERVERS
            ].map((server: any) => {
              const isSelected = selectedServers.includes(server.id);

              return (
                <div
                  key={server.id}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-3"
                >
                  {/* Server Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        id={server.id}
                        checked={isSelected}
                        onChange={() => toggleServerConfig(server.id)}
                        className="mt-1 w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={server.id}
                          className="cursor-pointer block"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{server.icon}</span>
                            <span className="font-medium text-gray-100">
                              {server.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {server.description}
                          </p>
                        </label>
                      </div>
                    </div>

                    {isSelected && (
                      <button
                        onClick={() =>
                          setConfigExpanded(
                            configExpanded === server.id ? null : server.id,
                          )
                        }
                        className="text-gray-400 hover:text-gray-200 ml-2"
                      >
                        <ChevronDown
                          size={18}
                          className={`transform transition ${
                            configExpanded === server.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Configuration Fields */}
                  {isSelected && configExpanded === server.id && (
                    <div className="mt-4 pt-4 border-t border-slate-600 pl-8">
                      {Object.entries(server.configSchema).map(
                        ([fieldName, field]) =>
                          renderConfigField(
                            server.id,
                            fieldName,
                            field as FieldDefinition,
                          ),
                      )}

                      {/* Missing Required Fields Warning */}
                      {Object.entries(server.configSchema).some(
                        ([fieldName, field]) =>
                          (field as FieldDefinition).required &&
                          !serverConfigs[server.id]?.config?.[fieldName],
                      ) && (
                        <div className="mt-3 flex items-start gap-2 p-2 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded text-xs text-yellow-300">
                          <AlertCircle
                            size={14}
                            className="mt-0.5 flex-shrink-0"
                          />
                          <span>
                            Fill in all required fields to enable this server
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedServers.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="text-sm text-gray-300">
            <strong>Active Servers:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedServers.map((serverId) => {
                const server = Object.values(FINANCIAL_MCP_SERVERS)
                  .flat()
                  .find((s) => s.id === serverId);
                return (
                  <span
                    key={serverId}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900 bg-opacity-40 border border-emerald-700 rounded text-xs text-emerald-300"
                  >
                    {server?.icon} {server?.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedServers.length === 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700 text-center text-sm text-gray-500">
          No MCP servers selected. Choose a category above to get started.
        </div>
      )}
    </div>
  );
}

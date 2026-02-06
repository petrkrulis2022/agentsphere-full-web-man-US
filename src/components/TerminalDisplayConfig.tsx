import React, { useState } from "react";
import { Monitor, AlertCircle, Info } from "lucide-react";

interface TerminalDisplayConfigProps {
  agentType: string;
  onConfigChange: (config: TerminalDisplayConfig) => void;
  initialConfig?: TerminalDisplayConfig;
}

export interface TerminalDisplayConfig {
  mock_balance_eur: number;
  mock_wallet_usdc: number;
  dispenser_id: string;
  ui_theme: string;
}

const UI_THEMES = [
  {
    value: "revolut",
    label: "Revolut",
    description: "Revolut branding and UI style",
    enabled: true,
  },
  {
    value: "csob",
    label: "ČSOB",
    description: "ČSOB branding and UI style",
    enabled: false,
  },
  {
    value: "raiffeisen",
    label: "Raiffeisen",
    description: "Raiffeisen branding and UI style",
    enabled: false,
  },
];

export const TerminalDisplayConfig: React.FC<TerminalDisplayConfigProps> = ({
  agentType,
  onConfigChange,
  initialConfig = {
    mock_balance_eur: 2450.67,
    mock_wallet_usdc: 1250.0,
    dispenser_id: "ATM_CZ_001",
    ui_theme: "revolut",
  },
}) => {
  const [config, setConfig] = useState<TerminalDisplayConfig>(initialConfig);
  const [errors, setErrors] = useState<string[]>([]);

  // Only show for Virtual Terminal agents
  if (agentType !== "home_security") {
    return null;
  }

  const handleConfigChange = (
    field: keyof TerminalDisplayConfig,
    value: any,
  ) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);

    // Validate
    const newErrors: string[] = [];
    if (updated.mock_balance_eur < 0) {
      newErrors.push("Mock balance EUR must be positive");
    }
    if (updated.mock_wallet_usdc < 0) {
      newErrors.push("Mock wallet USDC must be positive");
    }
    if (!updated.dispenser_id || updated.dispenser_id.trim() === "") {
      newErrors.push("Cash dispenser ID is required");
    }

    setErrors(newErrors);

    // Only call onChange if valid
    if (newErrors.length === 0) {
      onConfigChange(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center mb-2">
          <Monitor className="h-5 w-5 mr-2 text-cyan-400" />
          Terminal Display Configuration
        </h3>
        <p className="text-sm text-gray-300">
          Configure how the ARTM will display information to users. These values
          are used for mock/demo purposes in the MVP.
        </p>
      </div>

      <div className="space-y-4 bg-slate-700/50 rounded-lg p-6 border border-slate-600">
        {/* Mock Balance EUR */}
        <div className="space-y-2">
          <label
            htmlFor="mock-balance-eur"
            className="block text-sm font-medium text-gray-200"
          >
            Mock Revolut Account Balance (EUR)
          </label>
          <input
            type="number"
            id="mock-balance-eur"
            value={config.mock_balance_eur}
            onChange={(e) =>
              handleConfigChange(
                "mock_balance_eur",
                parseFloat(e.target.value) || 0,
              )
            }
            step="0.01"
            min="0"
            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            This balance will be displayed when users interact with the Revolut
            card withdrawal flow.
          </p>
        </div>

        {/* Mock Wallet USDC */}
        <div className="space-y-2">
          <label
            htmlFor="mock-wallet-usdc"
            className="block text-sm font-medium text-gray-200"
          >
            Mock Crypto Wallet Balance (USDC)
          </label>
          <input
            type="number"
            id="mock-wallet-usdc"
            value={config.mock_wallet_usdc}
            onChange={(e) =>
              handleConfigChange(
                "mock_wallet_usdc",
                parseFloat(e.target.value) || 0,
              )
            }
            step="0.01"
            min="0"
            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            This balance will be displayed when users connect their crypto
            wallet for stablecoin conversions.
          </p>
        </div>

        {/* Cash Dispenser ID */}
        <div className="space-y-2">
          <label
            htmlFor="dispenser-id"
            className="block text-sm font-medium text-gray-200"
          >
            Cash Dispenser ID
          </label>
          <input
            type="text"
            id="dispenser-id"
            value={config.dispenser_id}
            onChange={(e) => handleConfigChange("dispenser_id", e.target.value)}
            placeholder="e.g., ATM_CZ_001"
            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            Unique identifier for the physical cash dispenser. Used for
            transaction receipts and logging.
          </p>
        </div>

        {/* UI Theme */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200 mb-3">
            UI Theme
          </label>
          <div className="space-y-2">
            {UI_THEMES.map((theme) => (
              <div
                key={theme.value}
                className={`p-3 rounded-lg border transition-colors ${
                  config.ui_theme === theme.value
                    ? "bg-blue-500/20 border-blue-500"
                    : theme.enabled
                      ? "bg-slate-600/50 border-slate-500 hover:border-blue-500/50"
                      : "bg-slate-600/20 border-slate-600 opacity-50"
                }`}
              >
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="ui-theme"
                    value={theme.value}
                    checked={config.ui_theme === theme.value}
                    onChange={() => handleConfigChange("ui_theme", theme.value)}
                    disabled={!theme.enabled}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="ml-3 flex-1">
                    <span className="text-sm font-medium text-gray-200">
                      {theme.label}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {theme.description}
                    </p>
                  </span>
                  {!theme.enabled && (
                    <span className="text-xs bg-slate-600 text-gray-400 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            UI themes determine the bank branding and visual style shown in the
            ARTM interface.
          </p>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-300">
                Configuration Errors
              </h4>
              <ul className="text-red-300 text-xs mt-2 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-300">
          <strong>MVP Note:</strong> These mock values are used for
          demonstration purposes. In production, real balances will be fetched
          from bank and exchange APIs.
        </div>
      </div>
    </div>
  );
};

export default TerminalDisplayConfig;

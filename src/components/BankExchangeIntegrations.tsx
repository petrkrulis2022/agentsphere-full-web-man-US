import React, { useState } from "react";
import { Building2, DollarSign, AlertCircle, CheckCircle } from "lucide-react";

interface BankExchangeIntegrationsProps {
  agentType: string;
  onBankIntegrationsChange: (banks: string[]) => void;
  onExchangeIntegrationsChange: (exchanges: string[]) => void;
  initialBanks?: string[];
  initialExchanges?: string[];
}

const AVAILABLE_BANKS = [
  "Revolut",
  "HSBC",
  "Deutsche Bank",
  "Santander",
  "ING",
  "BNP Paribas",
  "Bank of America",
  "Chase",
];

const AVAILABLE_EXCHANGES = [
  "Revolut",
  "Binance",
  "Coinbase",
  "Kraken",
  "Bybit",
  "OKX",
];

export const BankExchangeIntegrations: React.FC<
  BankExchangeIntegrationsProps
> = ({
  agentType,
  onBankIntegrationsChange,
  onExchangeIntegrationsChange,
  initialBanks = ["Revolut"],
  initialExchanges = ["Revolut"],
}) => {
  const [selectedBanks, setSelectedBanks] = useState<string[]>(initialBanks);
  const [selectedExchanges, setSelectedExchanges] =
    useState<string[]>(initialExchanges);

  // Only show for ARTM Terminal agents
  if (agentType !== "artm_terminal") {
    return null;
  }

  const toggleBank = (bank: string) => {
    const updated = selectedBanks.includes(bank)
      ? selectedBanks.filter((b) => b !== bank)
      : [...selectedBanks, bank];

    // Ensure at least one bank is selected
    if (updated.length === 0) {
      return;
    }

    setSelectedBanks(updated);
    onBankIntegrationsChange(updated);
  };

  const toggleExchange = (exchange: string) => {
    const updated = selectedExchanges.includes(exchange)
      ? selectedExchanges.filter((e) => e !== exchange)
      : [...selectedExchanges, exchange];

    setSelectedExchanges(updated);
    onExchangeIntegrationsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Banks Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-blue-400" />
          Supported Banks
        </h3>

        <p className="text-sm text-gray-300">
          Select which banks your ARTM will support for card withdrawals. Users
          will see these options in the AR interface.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_BANKS.map((bank) => (
            <div
              key={bank}
              className="flex items-center p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500/50 transition-colors"
            >
              <input
                type="checkbox"
                id={`bank-${bank}`}
                checked={selectedBanks.includes(bank)}
                onChange={() => toggleBank(bank)}
                disabled={
                  selectedBanks.includes(bank) && selectedBanks.length === 1
                }
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label
                htmlFor={`bank-${bank}`}
                className="ml-3 text-sm font-medium text-gray-200 flex items-center cursor-pointer flex-1"
              >
                {bank}
                {bank === "Revolut" && (
                  <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>

        {selectedBanks.length === 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-300">
              At least one bank must be selected
            </p>
          </div>
        )}

        {selectedBanks.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-300">
              {selectedBanks.length} bank{selectedBanks.length !== 1 ? "s" : ""}{" "}
              selected: {selectedBanks.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Crypto Exchanges Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
          Crypto Exchange Integrations
        </h3>

        <p className="text-sm text-gray-300">
          Select which crypto exchanges your ARTM will support for
          stablecoin-to-fiat conversions. This enables crypto wallet holders to
          withdraw cash without a local bank account.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_EXCHANGES.map((exchange) => (
            <div
              key={exchange}
              className="flex items-center p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-500/50 transition-colors"
            >
              <input
                type="checkbox"
                id={`exchange-${exchange}`}
                checked={selectedExchanges.includes(exchange)}
                onChange={() => toggleExchange(exchange)}
                className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-500 rounded"
              />
              <label
                htmlFor={`exchange-${exchange}`}
                className="ml-3 text-sm font-medium text-gray-200 cursor-pointer flex-1"
              >
                {exchange}
              </label>
            </div>
          ))}
        </div>

        {selectedExchanges.length > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-start">
            <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-purple-300">
              {selectedExchanges.length} exchange
              {selectedExchanges.length !== 1 ? "s" : ""} selected:{" "}
              {selectedExchanges.join(", ")}
            </p>
          </div>
        )}

        {selectedExchanges.length === 0 && (
          <div className="bg-slate-600/50 border border-slate-500 rounded-lg p-3">
            <p className="text-sm text-gray-300">
              ℹ️ No crypto exchanges selected. Users won't be able to convert
              crypto to cash from this ARTM.
            </p>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 space-y-2">
        <h4 className="text-sm font-semibold text-gray-200 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-yellow-400" />
          MVP Information
        </h4>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li>
            Revolut is mocked with default balance €2,450.67 (configurable
            below)
          </li>
          <li>
            Other banks currently disabled - UI theme selection coming soon
          </li>
          <li>
            Crypto exchanges are mocked with default balance 1,250.00 USDC
          </li>
          <li>All transactions are simulated (no real payments processed)</li>
        </ul>
      </div>
    </div>
  );
};

export default BankExchangeIntegrations;

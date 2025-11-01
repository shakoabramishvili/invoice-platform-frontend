'use client';

import { motion } from 'framer-motion';
import { CurrencyRates, BankCurrencyRate } from '@/types';
import { TrendingUp } from 'lucide-react';

interface CurrencyRatesComparisonProps {
  rates: CurrencyRates;
}

// Bank metadata mapping
const BANK_INFO: Record<string, { name: string; logo: string }> = {
  bog: { name: 'Bank of Georgia', logo: 'bog-logo.svg' },
  tbc: { name: 'TBC Bank', logo: 'tbc-logo.svg' },
  pcb: { name: 'ProCredit Bank', logo: 'pcb-logo.svg' },
  nbg: { name: 'National Bank of Georgia', logo: 'nbg-logo.svg' },
};

interface TransformedRate {
  bank: string;
  logo: string;
  buy: number | null;
  sell: number | null;
}

export default function CurrencyRatesComparison({ rates }: CurrencyRatesComparisonProps) {
  // Transform API response to flat list for each currency
  const transformRates = (currency: 'USD' | 'EUR'): TransformedRate[] => {
    const transformed: TransformedRate[] = [];

    Object.entries(rates).forEach(([bankCode, bankData]) => {
      if (!bankData || !bankData[currency]) return;

      const currencyData = bankData[currency] as BankCurrencyRate;
      const bankInfo = BANK_INFO[bankCode];

      if (!bankInfo) return;

      let buy: number | null = null;
      let sell: number | null = null;

      // Handle different bank response formats
      if (currencyData.buy !== undefined && currencyData.sell !== undefined) {
        // bog, tbc, pcb format
        buy = currencyData.buy;
        sell = currencyData.sell;
      } else if (currencyData.rate !== undefined) {
        // nbg format - show official rate as both buy and sell
        buy = currencyData.rate;
        sell = currencyData.rate;
      }

      if (buy !== null || sell !== null) {
        transformed.push({
          bank: bankInfo.name,
          logo: bankInfo.logo,
          buy,
          sell,
        });
      }
    });

    return transformed;
  };

  const renderCurrencyCard = (
    currencyName: string,
    currencyCode: 'USD' | 'EUR',
    flag: string,
    index: number
  ) => {
    const bankRates = transformRates(currencyCode);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="
          bg-white dark:bg-gray-800
          rounded-2xl
          shadow-lg
          overflow-hidden
          border border-gray-100 dark:border-gray-700
        "
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label={currencyCode}>
              {flag}
            </span>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              {currencyName}
            </h3>
          </div>
        </div>

        {/* Table Header */}
        <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Bank
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">
              Buy
            </div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">
              Sell
            </div>
          </div>
        </div>

        {/* Bank Rates */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {bankRates.map((rate, rateIndex) => (
            <motion.div
              key={rate.bank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: (index * 0.1) + (rateIndex * 0.05),
              }}
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.03)' }}
              className="px-4 py-2 transition-colors duration-200"
            >
              <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 items-center">
                {/* Bank Name with Logo */}
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center p-1 shadow-sm">
                    <img
                      src={`/images/${rate.logo}`}
                      alt={rate.bank}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-xs font-bold text-gray-400 dark:text-gray-500">${rate.bank.substring(0, 3)}</span>`;
                        }
                      }}
                    />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white text-xs">
                    {rate.bank}
                  </span>
                </div>

                {/* Buy Rate */}
                <div className="text-center">
                  {rate.buy !== null ? (
                    <div className="inline-flex items-center justify-center px-2 py-1 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-100 dark:border-green-900/50">
                      <span className="font-bold text-green-700 dark:text-green-400 text-xs tabular-nums">
                        {rate.buy.toFixed(4)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-600">N/A</span>
                  )}
                </div>

                {/* Sell Rate */}
                <div className="text-center">
                  {rate.sell !== null ? (
                    <div className="inline-flex items-center justify-center px-2 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-100 dark:border-blue-900/50">
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-xs tabular-nums">
                        {rate.sell.toFixed(4)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-600">N/A</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {bankRates.length === 0 && (
          <div className="px-4 py-6 text-center text-gray-400 dark:text-gray-500">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No rates available</p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Currency Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* USD Card */}
        {renderCurrencyCard('Dollar', 'USD', '🇺🇸', 0)}

        {/* EUR Card */}
        {renderCurrencyCard('Euro', 'EUR', '🇪🇺', 1)}
      </div>

      {/* Disclaimer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-xs text-gray-500 dark:text-gray-400 italic text-center px-4"
      >
        *Displayed rates are fetched from official bank APIs and may differ from in-branch or online banking rates.
      </motion.div>
    </div>
  );
}

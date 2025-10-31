'use client';

import { motion } from 'framer-motion';
import { FileText, Trophy, Medal, Award } from 'lucide-react';
import { TopBuyer } from '@/types';

interface TopBuyersRankedProps {
  buyers: TopBuyer[];
}

export default function TopBuyersRanked({ buyers }: TopBuyersRankedProps) {
  const formatRevenue = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: Trophy,
          color: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          textColor: 'text-yellow-900',
          label: '1st',
          emoji: '🥇',
        };
      case 2:
        return {
          icon: Medal,
          color: 'bg-gradient-to-br from-gray-300 to-gray-500',
          textColor: 'text-gray-900',
          label: '2nd',
          emoji: '🥈',
        };
      case 3:
        return {
          icon: Award,
          color: 'bg-gradient-to-br from-orange-400 to-orange-600',
          textColor: 'text-orange-900',
          label: '3rd',
          emoji: '🥉',
        };
      default:
        return {
          icon: null,
          color: 'bg-gradient-to-br from-gray-100 to-gray-200',
          textColor: 'text-gray-700',
          label: `${rank}th`,
          emoji: `${rank}️⃣`,
        };
    }
  };

  const getRevenueItems = (buyer: TopBuyer) => {
    const items = [];

    const usd = buyer.revenueByCurrency.USD || 0;
    const gel = buyer.revenueByCurrency.GEL || 0;
    const eur = buyer.revenueByCurrency.EUR || 0;

    if (usd > 0) {
      items.push({ currency: 'USD', value: usd, symbol: '$', emoji: '💵' });
    }
    if (gel > 0) {
      items.push({ currency: 'GEL', value: gel, symbol: '₾', emoji: '🇬🇪' });
    }
    if (eur > 0) {
      items.push({ currency: 'EUR', value: eur, symbol: '€', emoji: '💶' });
    }

    return items;
  };

  const calculateTotalRevenue = (buyer: TopBuyer): number => {
    const usd = buyer.revenueByCurrency.USD || 0;
    const gel = buyer.revenueByCurrency.GEL || 0;
    const eur = buyer.revenueByCurrency.EUR || 0;
    return usd + gel + eur;
  };

  // Sort buyers by total revenue (descending)
  const sortedBuyers = [...buyers]
    .sort((a, b) => {
      const totalA = calculateTotalRevenue(a);
      const totalB = calculateTotalRevenue(b);
      return totalB - totalA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-3">
      {sortedBuyers.map((buyer, index) => {
        const rank = index + 1;
        const rankBadge = getRankBadge(rank);
        const RankIcon = rankBadge.icon;
        const revenueItems = getRevenueItems(buyer);

        return (
          <motion.div
            key={`${buyer.name}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
              scale: 1.02,
              y: -2,
              transition: { duration: 0.2 },
            }}
            className="
              relative overflow-hidden
              bg-white rounded-xl
              shadow-md hover:shadow-xl
              border border-gray-100
              p-4 md:p-5
              transition-all duration-300
              cursor-pointer
            "
          >
            <div className="flex items-start gap-4">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <div
                  className={`
                    ${rankBadge.color}
                    w-14 h-14 rounded-xl
                    flex flex-col items-center justify-center
                    shadow-lg
                  `}
                >
                  {RankIcon && <RankIcon className="w-6 h-6 text-white mb-0.5" strokeWidth={2.5} />}
                  <span className="text-xs font-bold text-white">{rankBadge.label}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Buyer Name and Invoice Count */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                    {buyer.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{buyer.invoiceCount}</span>
                    <span className="text-gray-500">
                      {buyer.invoiceCount === 1 ? 'invoice' : 'invoices'}
                    </span>
                  </div>
                </div>

                {/* Revenue by Currency */}
                {revenueItems.length > 0 ? (
                  <div className="flex flex-wrap gap-3 md:gap-4">
                    {revenueItems.map((item) => (
                      <div
                        key={item.currency}
                        className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5"
                      >
                        <span className="text-lg" role="img" aria-label={item.currency}>
                          {item.emoji}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {item.symbol}
                          {formatRevenue(item.value)}
                        </span>
                        <span className="text-xs text-gray-500 font-medium uppercase">
                          {item.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">No revenue recorded</div>
                )}
              </div>

              {/* Rank Emoji (Mobile) */}
              <div className="flex-shrink-0 sm:hidden">
                <span className="text-2xl" role="img" aria-label={`Rank ${rank}`}>
                  {rankBadge.emoji}
                </span>
              </div>
            </div>

            {/* Decorative gradient line for top 3 */}
            {rank <= 3 && (
              <div
                className={`
                  absolute bottom-0 left-0 right-0 h-1
                  ${rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : ''}
                  ${rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' : ''}
                  ${rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : ''}
                `}
              />
            )}
          </motion.div>
        );
      })}

      {sortedBuyers.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No buyer data available yet</p>
        </div>
      )}
    </div>
  );
}

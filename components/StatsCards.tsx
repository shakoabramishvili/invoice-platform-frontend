'use client';

import { motion } from 'framer-motion';
import { FileText, XCircle, DollarSign, Banknote, Euro } from 'lucide-react';

interface StatsCardsProps {
  totalInvoices: number;
  totalCanceledInvoices: number;
  revenueUSD: string | number;
  revenueGEL: string | number;
  revenueEUR: string | number;
}

export default function StatsCards({
  totalInvoices,
  totalCanceledInvoices,
  revenueUSD,
  revenueGEL,
  revenueEUR,
}: StatsCardsProps) {
  const formatRevenue = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const stats = [
    {
      label: 'Invoices',
      value: totalInvoices.toLocaleString(),
      icon: FileText,
      emoji: '🧾',
      bgGradient: 'from-blue-500 to-blue-600',
      shadowColor: 'shadow-blue-200',
      hoverShadow: 'hover:shadow-blue-300',
    },
    {
      label: 'Canceled',
      value: totalCanceledInvoices.toLocaleString(),
      icon: XCircle,
      emoji: '❌',
      bgGradient: 'from-red-500 to-red-600',
      shadowColor: 'shadow-red-200',
      hoverShadow: 'hover:shadow-red-300',
    },
    {
      label: 'USD',
      value: `$${formatRevenue(revenueUSD)}`,
      icon: DollarSign,
      emoji: '💵',
      bgGradient: 'from-green-500 to-green-600',
      shadowColor: 'shadow-green-200',
      hoverShadow: 'hover:shadow-green-300',
    },
    {
      label: 'GEL',
      value: `₾${formatRevenue(revenueGEL)}`,
      icon: Banknote,
      emoji: '🇬🇪',
      bgGradient: 'from-orange-500 to-orange-600',
      shadowColor: 'shadow-orange-200',
      hoverShadow: 'hover:shadow-orange-300',
    },
    {
      label: 'EUR',
      value: `€${formatRevenue(revenueEUR)}`,
      icon: Euro,
      emoji: '💶',
      bgGradient: 'from-purple-500 to-purple-600',
      shadowColor: 'shadow-purple-200',
      hoverShadow: 'hover:shadow-purple-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative overflow-hidden rounded-2xl
              bg-gradient-to-br ${stat.bgGradient}
              shadow-lg ${stat.shadowColor} ${stat.hoverShadow}
              p-6 cursor-pointer
              transition-shadow duration-300
            `}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
              <Icon className="w-full h-full" strokeWidth={1} />
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Icon and Emoji */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-3xl" role="img" aria-label={stat.label}>
                  {stat.emoji}
                </span>
              </div>

              {/* Value */}
              <div className="mb-2">
                <div className="text-3xl font-bold text-white tracking-tight">
                  {stat.value}
                </div>
              </div>

              {/* Label */}
              <div className="text-sm font-medium text-white/90 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>

            {/* Shine effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { User, FileText } from 'lucide-react';
import { EmployeeInvoiceStats } from '@/types';
import { useState } from 'react';

interface InvoicesPerEmployeeProps {
  employees: EmployeeInvoiceStats[];
}

export default function InvoicesPerEmployee({ employees }: InvoicesPerEmployeeProps) {
  // Sort employees by invoice count (descending)
  const sortedEmployees = [...employees].sort((a, b) => b.invoiceCount - a.invoiceCount);

  // Track failed avatar loads
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(new Set());

  const handleAvatarError = (fullName: string) => {
    setFailedAvatars((prev) => new Set(prev).add(fullName));
  };

  return (
    <div className="space-y-0">
      {sortedEmployees.map((employee, index) => (
        <motion.div
          key={`${employee.fullName}-${index}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          whileHover={{
            x: 4,
            transition: { duration: 0.2 },
          }}
          className="
            flex items-center justify-between
            px-4 py-3.5
            border-b border-gray-100 dark:border-gray-700 last:border-b-0
            hover:bg-blue-50 dark:hover:bg-blue-950/30
            transition-all duration-200
            cursor-pointer
            group
          "
        >
          {/* Employee Name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/70 transition-colors">
              {employee.avatar && !failedAvatars.has(employee.fullName) ? (
                <img
                  src={employee.avatar}
                  alt={employee.fullName}
                  className="w-full h-full object-cover"
                  onError={() => handleAvatarError(employee.fullName)}
                />
              ) : (
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              )}
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-base truncate">
              {employee.fullName}
            </span>
          </div>

          {/* Separator */}
          <div className="hidden sm:block mx-3 text-gray-300 dark:text-gray-600 flex-shrink-0">—</div>

          {/* Invoice Count */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 hidden sm:block" />
            <span className="font-bold text-gray-900 dark:text-white text-lg tabular-nums">
              {employee.invoiceCount}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
              {employee.invoiceCount === 1 ? 'invoice' : 'invoices'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">inv</span>
          </div>
        </motion.div>
      ))}

      {sortedEmployees.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No employee data available</p>
        </div>
      )}
    </div>
  );
}

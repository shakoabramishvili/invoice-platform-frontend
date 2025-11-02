'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: {
    message: string;
    error?: string;
    statusCode?: number;
  } | null;
}

export default function ErrorModal({ isOpen, onClose, error }: ErrorModalProps) {
  if (!error) return null;

  // Determine error type based on status code
  const getErrorType = () => {
    if (!error.statusCode) return 'error';

    if (error.statusCode >= 500) return 'server';
    if (error.statusCode === 403) return 'forbidden';
    if (error.statusCode === 401) return 'unauthorized';
    if (error.statusCode === 404) return 'notfound';
    if (error.statusCode >= 400) return 'client';

    return 'error';
  };

  const errorType = getErrorType();

  // Get icon and colors based on error type
  const getErrorStyles = () => {
    switch (errorType) {
      case 'server':
        return {
          icon: <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />,
          bgGradient: 'from-red-100 to-red-200 dark:from-red-950/50 dark:to-red-900/50',
          borderColor: 'border-red-200 dark:border-red-900/50',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          textColor: 'text-red-900 dark:text-red-100',
          subtextColor: 'text-red-700 dark:text-red-300',
          title: 'Server Error',
        };
      case 'forbidden':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />,
          bgGradient: 'from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50',
          borderColor: 'border-orange-200 dark:border-orange-900/50',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          textColor: 'text-orange-900 dark:text-orange-100',
          subtextColor: 'text-orange-700 dark:text-orange-300',
          title: 'Access Denied',
        };
      case 'unauthorized':
        return {
          icon: <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
          bgGradient: 'from-amber-100 to-yellow-100 dark:from-amber-950/50 dark:to-yellow-950/50',
          borderColor: 'border-amber-200 dark:border-amber-900/50',
          bgColor: 'bg-amber-50 dark:bg-amber-950/20',
          textColor: 'text-amber-900 dark:text-amber-100',
          subtextColor: 'text-amber-700 dark:text-amber-300',
          title: 'Unauthorized',
        };
      case 'notfound':
        return {
          icon: <Info className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
          bgGradient: 'from-blue-100 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50',
          borderColor: 'border-blue-200 dark:border-blue-900/50',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          textColor: 'text-blue-900 dark:text-blue-100',
          subtextColor: 'text-blue-700 dark:text-blue-300',
          title: 'Not Found',
        };
      default:
        return {
          icon: <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />,
          bgGradient: 'from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50',
          borderColor: 'border-red-200 dark:border-red-900/50',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          textColor: 'text-red-900 dark:text-red-100',
          subtextColor: 'text-red-700 dark:text-red-300',
          title: 'Error',
        };
    }
  };

  const styles = getErrorStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {/* Error Icon Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-6">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${styles.bgGradient} flex items-center justify-center`}>
            {styles.icon}
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{styles.title}</DialogTitle>
          </DialogHeader>
        </div>

        {/* Error Message */}
        <div className={`${styles.bgColor} border ${styles.borderColor} rounded-lg p-4`}>
          <p className={`text-sm font-medium ${styles.textColor}`}>
            {error.message}
          </p>
        </div>

        {/* Additional Info */}
        {errorType === 'forbidden' && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Please contact your administrator if you believe you should have access to this resource.
            </p>
          </div>
        )}

        {errorType === 'server' && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              An unexpected error occurred. Please try again later or contact support if the problem persists.
            </p>
          </div>
        )}

        {/* Close Button */}
        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { User } from '@/types';

export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'ACCOUNTANT' | 'VIEWER';

export interface Permissions {
  // Invoice permissions
  canCreateInvoice: boolean;
  canEditInvoice: boolean;
  canDeleteInvoice: boolean;
  canCancelInvoice: boolean;
  canViewInvoice: boolean;
  canDownloadPdf: boolean;
  canExportExcel: boolean;
  canUpdateInvoiceStatus: boolean;
  canUpdatePaymentStatus: boolean;

  // User management permissions
  canCreateUser: boolean;
  canEditUser: boolean;
  canDeleteUser: boolean;
  canViewUsers: boolean;

  // Buyer/Seller permissions
  canCreateBuyer: boolean;
  canEditBuyer: boolean;
  canDeleteBuyer: boolean;
  canViewBuyers: boolean;
  canCreateSeller: boolean;
  canEditSeller: boolean;
  canDeleteSeller: boolean;
  canViewSellers: boolean;

  // Dashboard permissions
  canViewDashboard: boolean;
}

export const rolePermissions: Record<UserRole, Permissions> = {
  ADMIN: {
    // Admin has full access to everything
    canCreateInvoice: true,
    canEditInvoice: true,
    canDeleteInvoice: true,
    canCancelInvoice: true,
    canViewInvoice: true,
    canDownloadPdf: true,
    canExportExcel: true,
    canUpdateInvoiceStatus: true,
    canUpdatePaymentStatus: true,
    canCreateUser: true,
    canEditUser: true,
    canDeleteUser: true,
    canViewUsers: true,
    canCreateBuyer: true,
    canEditBuyer: true,
    canDeleteBuyer: true,
    canViewBuyers: true,
    canCreateSeller: true,
    canEditSeller: true,
    canDeleteSeller: true,
    canViewSellers: true,
    canViewDashboard: true,
  },
  MANAGER: {
    // Manager has full access EXCEPT cannot update payment status
    canCreateInvoice: true,
    canEditInvoice: true,
    canDeleteInvoice: true,
    canCancelInvoice: true,
    canViewInvoice: true,
    canDownloadPdf: true,
    canExportExcel: true,
    canUpdateInvoiceStatus: true,
    canUpdatePaymentStatus: false, // Manager cannot update payment status
    canCreateUser: true,
    canEditUser: true,
    canDeleteUser: true,
    canViewUsers: true,
    canCreateBuyer: true,
    canEditBuyer: true,
    canDeleteBuyer: true,
    canViewBuyers: true,
    canCreateSeller: true,
    canEditSeller: true,
    canDeleteSeller: true,
    canViewSellers: true,
    canViewDashboard: true,
  },
  OPERATOR: {
    // Operator can do all EXCEPT add/edit users or update payment status
    canCreateInvoice: true,
    canEditInvoice: true,
    canDeleteInvoice: true,
    canCancelInvoice: true,
    canViewInvoice: true,
    canDownloadPdf: true,
    canExportExcel: true,
    canUpdateInvoiceStatus: true,
    canUpdatePaymentStatus: false, // Operator cannot update payment status
    canCreateUser: false, // Operator cannot manage users
    canEditUser: false,
    canDeleteUser: false,
    canViewUsers: true, // Can view but not edit
    canCreateBuyer: true,
    canEditBuyer: true,
    canDeleteBuyer: true,
    canViewBuyers: true,
    canCreateSeller: true,
    canEditSeller: true,
    canDeleteSeller: true,
    canViewSellers: true,
    canViewDashboard: true,
  },
  ACCOUNTANT: {
    // Accountant can only view, download PDFs, and export Excel
    canCreateInvoice: false,
    canEditInvoice: false,
    canDeleteInvoice: false,
    canCancelInvoice: false,
    canViewInvoice: true,
    canDownloadPdf: true, // Can download PDFs
    canExportExcel: true, // Can export Excel
    canUpdateInvoiceStatus: false,
    canUpdatePaymentStatus: false,
    canCreateUser: false,
    canEditUser: false,
    canDeleteUser: false,
    canViewUsers: true,
    canCreateBuyer: false,
    canEditBuyer: false,
    canDeleteBuyer: false,
    canViewBuyers: true,
    canCreateSeller: false,
    canEditSeller: false,
    canDeleteSeller: false,
    canViewSellers: true,
    canViewDashboard: true,
  },
  VIEWER: {
    // Viewer can only view data (nothing else)
    canCreateInvoice: false,
    canEditInvoice: false,
    canDeleteInvoice: false,
    canCancelInvoice: false,
    canViewInvoice: true,
    canDownloadPdf: false, // Viewer cannot download
    canExportExcel: false, // Viewer cannot export
    canUpdateInvoiceStatus: false,
    canUpdatePaymentStatus: false,
    canCreateUser: false,
    canEditUser: false,
    canDeleteUser: false,
    canViewUsers: true,
    canCreateBuyer: false,
    canEditBuyer: false,
    canDeleteBuyer: false,
    canViewBuyers: true,
    canCreateSeller: false,
    canEditSeller: false,
    canDeleteSeller: false,
    canViewSellers: true,
    canViewDashboard: true,
  },
};

/**
 * Get permissions for a specific role
 */
export function getPermissions(role: UserRole): Permissions {
  return rolePermissions[role];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: User | null,
  permission: keyof Permissions
): boolean {
  if (!user) return false;
  const permissions = getPermissions(user.role as UserRole);
  return permissions[permission];
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    OPERATOR: 'Operator',
    ACCOUNTANT: 'Accountant',
    VIEWER: 'Viewer',
  };
  return roleNames[role];
}

/**
 * Get user role description
 */
export function getRoleDescription(role: UserRole): string {
  const roleDescriptions: Record<UserRole, string> = {
    ADMIN: 'Full access to all features and actions',
    MANAGER: 'Full access except cannot update payment status',
    OPERATOR: 'Can perform all actions except cannot add/edit users or update payment status',
    ACCOUNTANT: 'Can only view data, download PDFs, and export Excel files',
    VIEWER: 'Can only view data (no other actions)',
  };
  return roleDescriptions[role];
}

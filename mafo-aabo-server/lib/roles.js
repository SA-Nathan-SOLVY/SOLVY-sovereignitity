/**
 * MAFO AABO Trust™ — server-side role matrix.
 * Mirrors the ROLES permission flags from solvy-platform/mafo-aabo/index.html
 * (spec §5). Display metadata (names/taglines) stays in the UI; the server
 * is the authority on capabilities.
 */
export const PERMISSIONS = {
  trustee: {
    canApprove: true,
    canPay: true,
    canRequest: false,
    canCreateLoan: true,
    viewAllExpenses: true,
    viewAudit: true,
    viewLoans: true,
    viewLoanRatios: true,
    exportCSV: 'all',
    viewAllDocuments: true,
    canUploadDocuments: true,   // any category
    canDeleteDocuments: true,
    canUploadReceipt: false,
    viewBank: true,
    canManageBank: true,
  },
  grantor: {
    canApprove: false,
    canPay: false,
    canRequest: false,
    canCreateLoan: false,
    viewAllExpenses: true,
    viewAudit: false,
    viewLoans: true,
    viewLoanRatios: true,
    exportCSV: 'all',
    viewAllDocuments: true,
    canUploadDocuments: false,
    canDeleteDocuments: false,
    canUploadReceipt: false,
    viewBank: true,             // read-only
    canManageBank: false,
  },
  beneficiary: {
    canApprove: false,
    canPay: false,
    canRequest: true,
    canCreateLoan: false,
    viewAllExpenses: false,
    viewAudit: false,
    viewLoans: false,
    viewLoanRatios: false,
    exportCSV: 'own',
    viewAllDocuments: false,    // own receipts only
    canUploadDocuments: false,
    canDeleteDocuments: false,
    canUploadReceipt: true,     // receipts on own requests
    viewBank: false,
    canManageBank: false,
  },
};

export function permissionsFor(role) {
  return PERMISSIONS[role] || null;
}

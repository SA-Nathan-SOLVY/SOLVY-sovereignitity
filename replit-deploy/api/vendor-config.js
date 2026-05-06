/**
 * SOLVY Cooperative - Vendor Configuration Manager
 * 
 * Single source of truth for which banking vendor is active.
 * Change ONE environment variable to switch between Unit.co and Treasury Prime.
 * 
 * Usage:
 *   BANKING_VENDOR=unit          → Use Unit.co
 *   BANKING_VENDOR=treasuryprime → Use Treasury Prime
 * 
 * @module vendor-config
 */

const ACTIVE_VENDOR = (process.env.BANKING_VENDOR || 'treasuryprime').toLowerCase();

const VENDORS = {
  unit: {
    name: 'Unit.co',
    type: 'white-label',
    hasIframeApp: true,
    features: {
      depositAccounts: true,
      virtualCards: true,
      physicalCards: true,
      ach: true,
      wires: false,
      fedNow: false,
      checkDeposit: false,
      greenDot: false,
      applePay: false,
      googlePay: false,
      cardAuthLoop: false
    }
  },
  treasuryprime: {
    name: 'Treasury Prime',
    type: 'api-first',
    hasIframeApp: false,
    features: {
      depositAccounts: true,
      virtualCards: true,
      physicalCards: true,
      ach: true,
      wires: true,
      fedNow: true,
      checkDeposit: true,
      greenDot: true,
      applePay: true,
      googlePay: true,
      cardAuthLoop: true
    }
  }
};

function getVendor() {
  const vendor = VENDORS[ACTIVE_VENDOR];
  if (!vendor) {
    throw new Error(`Unknown banking vendor: ${ACTIVE_VENDOR}. Use 'unit' or 'treasuryprime'.`);
  }
  return { key: ACTIVE_VENDOR, ...vendor };
}

function isVendor(vendorKey) {
  return ACTIVE_VENDOR === vendorKey.toLowerCase();
}

function getFeature(featureName) {
  const vendor = getVendor();
  return vendor.features[featureName] || false;
}

module.exports = {
  ACTIVE_VENDOR,
  getVendor,
  isVendor,
  getFeature,
  VENDORS
};

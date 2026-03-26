/**
 * Unit Deposit Account Management
 */

const unit = require('../../lib/unit');

/**
 * Create a deposit account for a customer
 * @param {string} customerId - Unit customer ID
 * @param {Object} options - Account options
 */
const createDepositAccount = async (customerId, options = {}) => {
  const payload = {
    data: {
      type: 'depositAccount',
      attributes: {
        depositProduct: options.product || 'checking',
        tags: {
          accountType: 'individual',
          openedAt: new Date().toISOString(),
          ...options.tags
        }
      },
      relationships: {
        customer: {
          data: {
            type: 'customer',
            id: customerId
          }
        }
      }
    }
  };

  return await unit.post('/accounts', payload);
};

/**
 * Get account details and balance
 * @param {string} accountId - Unit account ID
 */
const getAccount = async (accountId) => {
  return await unit.get(`/accounts/${accountId}`);
};

/**
 * Get account balance
 * @param {string} accountId - Unit account ID
 */
const getBalance = async (accountId) => {
  const account = await getAccount(accountId);
  return {
    available: account.data.attributes.balance,
    hold: account.data.attributes.hold || 0,
    total: account.data.attributes.balance + (account.data.attributes.hold || 0)
  };
};

/**
 * Close an account
 * @param {string} accountId - Unit account ID
 * @param {string} reason - Closure reason
 */
const closeAccount = async (accountId, reason = 'By customer') => {
  return await unit.post(`/accounts/${accountId}/close`, {
    data: {
      type: 'depositAccountClose',
      attributes: { reason }
    }
  });
};

module.exports = {
  createDepositAccount,
  getAccount,
  getBalance,
  closeAccount
};

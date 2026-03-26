/**
 * SOLVY Card Management
 */

const unit = require('../../lib/unit');

/**
 * Create a SOLVY debit card
 * @param {string} accountId - Unit account ID
 * @param {Object} shippingAddress - Card shipping address
 * @param {string} design - Card design (optional)
 */
const createCard = async (accountId, shippingAddress, design = 'solvyStandard') => {
  const payload = {
    data: {
      type: 'individualDebitCard',
      attributes: {
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.zip,
          country: 'US'
        },
        design,
        tags: {
          issuedAt: new Date().toISOString()
        }
      },
      relationships: {
        account: {
          data: {
            type: 'account',
            id: accountId
          }
        }
      }
    }
  };

  return await unit.post('/cards', payload);
};

/**
 * Get card details
 * @param {string} cardId - Unit card ID
 */
const getCard = async (cardId) => {
  return await unit.get(`/cards/${cardId}`);
};

/**
 * Freeze a card (lost/stolen)
 * @param {string} cardId - Unit card ID
 */
const freezeCard = async (cardId) => {
  return await unit.post(`/cards/${cardId}/freeze`);
};

/**
 * Unfreeze a card
 * @param {string} cardId - Unit card ID
 */
const unfreezeCard = async (cardId) => {
  return await unit.post(`/cards/${cardId}/unfreeze`);
};

/**
 * Report card lost or stolen
 * @param {string} cardId - Unit card ID
 */
const reportLost = async (cardId) => {
  return await unit.post(`/cards/${cardId}/report-lost`);
};

module.exports = {
  createCard,
  getCard,
  freezeCard,
  unfreezeCard,
  reportLost
};

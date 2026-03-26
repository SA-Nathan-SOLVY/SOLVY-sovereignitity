/**
 * Create Unit Customer (Member Onboarding)
 */

const unit = require('../../lib/unit');

/**
 * Create an individual customer in Unit
 * @param {Object} memberData - Member information
 * @returns {Promise<Object>} Created customer
 */
const createCustomer = async (memberData) => {
  const payload = {
    data: {
      type: 'individualCustomer',
      attributes: {
        ssn: memberData.ssn,
        fullName: {
          first: memberData.firstName,
          last: memberData.lastName
        },
        dateOfBirth: memberData.dateOfBirth,
        address: {
          street: memberData.address.street,
          city: memberData.address.city,
          state: memberData.address.state,
          postalCode: memberData.address.zip,
          country: 'US'
        },
        email: memberData.email,
        phone: {
          countryCode: '1',
          number: memberData.phone.replace(/\D/g, '') // Remove non-digits
        },
        tags: {
          memberId: memberData.id,
          cohort: memberData.cohort || 'first_circle',
          businessName: memberData.businessName,
          joinedAt: new Date().toISOString()
        }
      }
    }
  };

  return await unit.post('/customers', payload);
};

/**
 * Get customer by ID
 * @param {string} customerId - Unit customer ID
 */
const getCustomer = async (customerId) => {
  return await unit.get(`/customers/${customerId}`);
};

module.exports = { createCustomer, getCustomer };

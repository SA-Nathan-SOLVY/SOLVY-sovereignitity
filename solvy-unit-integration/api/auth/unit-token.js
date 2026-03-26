/**
 * Generate JWT Token for Unit Ready To Launch
 */

const jwt = require('jsonwebtoken');

const generateUnitJwt = (customerId, memberData) => {
  const payload = {
    sub: customerId || `new-${memberData.id}`,
    org: process.env.UNIT_ORG_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    email: memberData.email,
    fullName: {
      first: memberData.firstName,
      last: memberData.lastName
    }
  };
  
  return jwt.sign(payload, process.env.UNIT_API_TOKEN);
};

const getUnitToken = async (req, res) => {
  try {
    const { memberId, email } = req.body;
    
    const memberData = {
      id: memberId,
      email,
      firstName: req.body.firstName || 'Eva',
      lastName: req.body.lastName || 'Evergreen'
    };
    
    const token = generateUnitJwt(null, memberData);
    
    res.json({ success: true, token, expiresIn: 3600 });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate token' });
  }
};

module.exports = { generateUnitJwt, getUnitToken };

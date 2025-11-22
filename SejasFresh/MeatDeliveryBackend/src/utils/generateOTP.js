// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate OTP with expiration
const generateOTPWithExpiry = (expiryMinutes = 5) => {
  const otp = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
  
  return {
    otp,
    expiresAt
  };
};

module.exports = {
  generateOTP,
  generateOTPWithExpiry
};


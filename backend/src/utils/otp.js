// Generates a random 6 digit OTP like 483920
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Adds 5 minutes to current time — OTP expires after this
const getOTPExpiry = () => {
  const expiry = new Date()
  expiry.setMinutes(expiry.getMinutes() + 5)
  return expiry
}

module.exports = { generateOTP, getOTPExpiry }
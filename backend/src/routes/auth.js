const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../db/supabase')
const { generateOTP, getOTPExpiry } = require('../utils/otp')
const { sendOTPEmail } = require('../utils/mailer')

//  Login: verify password, send OTP
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email in DB
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    // If no user found or DB error
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Compare typed password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate OTP and save to DB
    const otp = generateOTP()
    const expires_at = getOTPExpiry()

    await supabase.from('otps').insert({
      email,
      otp,
      expires_at
    })

    // Send OTP via email
    await sendOTPEmail(email, otp)

    res.json({ message: 'OTP sent to your email' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// STEP 2 — Verify OTP, return JWT
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    // Find the OTP in DB
    const { data: otpRecord, error } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .single()

    if (error || !otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    // Check if OTP is expired
    const now = new Date()
    const expiry = new Date(otpRecord.expires_at)
    if (now > expiry) {
      return res.status(400).json({ message: 'OTP has expired' })
    }

    // Mark OTP as used so it can't be reused
    await supabase
      .from('otps')
      .update({ used: true })
      .eq('id', otpRecord.id)

    // Get user details to put in JWT
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single()

    // Create JWT token — expires in 8 hours
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({ token, user })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
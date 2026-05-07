const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../db/supabase')
const { generateOTP, getOTPExpiry } = require('../utils/otp')
const { sendOTPEmail } = require('../utils/mailer')

// Register New User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
     console.log('📥 Register hit with:', req.body)
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword
      })
      .select('id, name, email')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register user' });
  }
});
//  Login: verify password, send OTP
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    
    email = email.toLowerCase().trim();

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

    // Generate OTP
    const otp = generateOTP()
    const expires_at = getOTPExpiry()

    // Delete any existing unused OTPs for this user first (Cleanup)
    await supabase.from('otps').delete().eq('email', email).eq('used', false);

    // Save new OTP to DB
    await supabase.from('otps').insert({
      email,
      otp,
      expires_at
    })

    // Send OTP via email — fire-and-forget, NEVER block the response
    // Gmail SMTP is blocked from Railway/Vercel cloud IPs. Use Brevo/SendGrid for production.
    sendOTPEmail(email, otp).catch(err => {
      console.error('❌ Email sending failed:', err.message)
      console.log(`📧 OTP for ${email}: ${otp}`)
    })

    res.json({ message: 'OTP sent to your email', otp })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// STEP 2 — Verify OTP, return JWT
router.post('/verify-otp', async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
    
    email = email.toLowerCase().trim();

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

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    // Check user exists
    const { data: user, error } = await supabase
      .from('users').select('id').eq('email', email).single()

    if (error || !user) {
      return res.status(404).json({ message: 'No account found with this email' })
    }

    const otp = generateOTP()
    const expires_at = getOTPExpiry()

    await supabase.from('otps').insert({ email, otp, expires_at })

    // Send OTP via email — fire-and-forget, NEVER block the response
    sendOTPEmail(email, otp).catch(err => {
      console.error('❌ Email sending failed:', err.message)
      console.log(`📧 OTP for ${email}: ${otp}`)
    })

    res.json({ message: 'New OTP sent to your email', otp })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Forgot Password -> Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users').select('id').eq('email', email).single();

    if (error || !user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = generateOTP();
    const expires_at = getOTPExpiry();

    await supabase.from('otps').insert({ email, otp, expires_at });

    // Send OTP via email — fire-and-forget, NEVER block the response
    sendOTPEmail(email, otp).catch(err => {
      console.error('❌ Email sending failed:', err.message)
      console.log(`📧 OTP for ${email}: ${otp}`)
    })

    res.json({ message: 'OTP sent to your email', otp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password -> Verify OTP & Update Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP
    const { data: otpRecord, error } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .single();

    if (error || !otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const now = new Date();
    const expiry = new Date(otpRecord.expires_at);
    if (now > expiry) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    const { error: updateErr } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email);

    if (updateErr) throw updateErr;

    // Mark OTP as used
    await supabase
      .from('otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
const User = require('../models/User');
const { generateToken } = require('../utils/helpers');
const { generateOTPWithExpiry } = require('../utils/generateOTP');
const { generateOTP } = require('../utils/generateOTP');
const sendSMS = require('../utils/sendSMS');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, pin, phone, address, role, password } = req.body;

    // Validate required fields
    if (!firstName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name and phone number'
      });
    }

    // For admin and delivery roles, email and password are required
    if ((role === 'admin' || role === 'delivery') && (!email || !password)) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required for admin and delivery roles'
      });
    }

    // Check if user exists by phone (email is optional)
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number'
      });
    }

    // If email provided, check if it exists
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName: lastName || '',
      email: email || undefined,
      password: password || undefined, // Password for admin/delivery users
      pin: pin || undefined,
      phone,
      role: role || 'customer',
      phoneVerified: true, // Phone verified on registration (no OTP required)
      emailVerified: (role === 'admin' || role === 'delivery') ? true : false, // Auto-verify for admin/delivery
    });

    // Save address if provided
    if (address) {
      const Address = require('../models/Address');
      await Address.create({
        user: user._id,
        label: 'Home',
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country || 'India',
        isDefault: true,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        fullName: user.fullName
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (with phone number - no password required)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { phone, email, password } = req.body;

    // Admin login with email/password
    if (email && password) {
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user has a password (admin users should have password)
      if (!user.password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive'
        });
      }

      // Check if user is admin or delivery
      if (user.role !== 'admin' && user.role !== 'delivery') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or delivery role required.'
        });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName,
          isActive: user.isActive,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified
        }
      });
    }

    // Regular user login with phone number
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number'
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please sign up first.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        isActive: user.isActive,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        savedAddresses: user.savedAddresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login with PIN
// @route   POST /api/auth/login-pin
// @access  Public
exports.loginWithPIN = async (req, res, next) => {
  try {
    const { identifier, pin } = req.body;

    if (!identifier || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and PIN'
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    }).select('+pin');

    if (!user || !user.pin || !(await user.comparePIN(pin))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request OTP
// @route   POST /api/auth/request-otp
// @access  Public
exports.requestOTP = async (req, res, next) => {
  try {
    console.log('Request OTP - Body:', req.body);
    console.log('Request OTP - Headers:', req.headers);
    
    const { phone } = req.body;

    if (!phone) {
      console.error('OTP Request Error: Phone number missing in request body');
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number'
      });
    }
    
    console.log('Processing OTP request for phone:', phone);

    const otpData = generateOTPWithExpiry(5);
    const otpCode = otpData.otp;

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, firstName: 'User', lastName: '' });
    }

    // Save OTP
    user.otp = {
      code: otpCode,
      expiresAt: otpData.expiresAt
    };
    await user.save({ validateBeforeSave: false });

    // Send OTP via SMS
    try {
      const smsResult = await sendSMS(phone, `Your Sejas Fresh OTP is ${otpCode}. Valid for 5 minutes.`);
      console.log('SMS Result:', smsResult);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Continue even if SMS fails - OTP is still generated and saved
    }

    // Prepare response data
    const responseData = {
      phone,
      expiresIn: '5 minutes'
    };

    // Include OTP in response only if SMS is not configured (development/testing)
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !smsSent) {
      responseData.otp = otpCode; // Include OTP for testing when Twilio not configured
    }

    res.json({
      success: true,
      message: smsSent ? 'OTP sent successfully via SMS' : 'OTP sent successfully (check console for OTP)',
      data: responseData
    });

    res.json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone and OTP'
      });
    }

    const user = await User.findOne({ phone });

    // Development bypass: Accept "123456" as valid OTP for testing
    const BYPASS_OTP = '123456';
    const isBypassOTP = otp === BYPASS_OTP;

    if (!isBypassOTP) {
      // Normal OTP verification
      if (!user || !user.otp || !user.otp.code) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP or OTP not requested'
        });
      }

      if (user.otp.code !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }

      if (new Date() > user.otp.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired'
        });
      }
    } else {
      // Bypass OTP - log for development
      console.log(`\n⚠️  BYPASS OTP USED: ${phone} verified with bypass OTP (123456)\n`);
      
      // Ensure user exists (create if doesn't exist for bypass)
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found. Please request OTP first.'
        });
      }
    }

    // Clear OTP and verify phone (only if not bypass)
    if (!isBypassOTP) {
      user.otp = undefined;
    }
    user.phoneVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set PIN
// @route   POST /api/auth/set-pin
// @access  Private
exports.setPIN = async (req, res, next) => {
  try {
    const { pin, confirmPin } = req.body;

    if (!pin || !confirmPin) {
      return res.status(400).json({
        success: false,
        message: 'Please provide PIN and confirmation'
      });
    }

    if (pin !== confirmPin) {
      return res.status(400).json({
        success: false,
        message: 'PINs do not match'
      });
    }

    if (pin.length < 4 || pin.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'PIN must be 4-6 digits'
      });
    }

    req.user.pin = pin;
    await req.user.save();

    res.json({
      success: true,
      message: 'PIN set successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot PIN - Request OTP
// @route   POST /api/auth/forgot-pin
// @access  Public
exports.forgotPIN = async (req, res, next) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone'
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otpData = generateOTPWithExpiry(5);
    const otpCode = otpData.otp;

    user.otp = {
      code: otpCode,
      expiresAt: otpData.expiresAt
    };
    await user.save({ validateBeforeSave: false });

    // Send OTP
    await sendSMS(user.phone, `Your OTP for PIN reset is ${otpCode}. Valid for 5 minutes.`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone: user.phone,
        expiresIn: '5 minutes'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset PIN
// @route   POST /api/auth/reset-pin
// @access  Public
exports.resetPIN = async (req, res, next) => {
  try {
    const { identifier, otp, newPin, confirmPin } = req.body;

    if (!identifier || !otp || !newPin || !confirmPin) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (newPin !== confirmPin) {
      return res.status(400).json({
        success: false,
        message: 'PINs do not match'
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    // Development bypass: Accept "123456" as valid OTP for testing
    const BYPASS_OTP = '123456';
    const isBypassOTP = otp === BYPASS_OTP;

    if (!isBypassOTP) {
      // Normal OTP verification
      if (!user || !user.otp || user.otp.code !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }

      if (new Date() > user.otp.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired'
        });
      }
    } else {
      // Bypass OTP - log for development
      console.log(`\n⚠️  BYPASS OTP USED: ${identifier} verified with bypass OTP (123456) for PIN reset\n`);
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    user.pin = newPin;
    // Clear OTP only if not bypass
    if (!isBypassOTP) {
      user.otp = undefined;
    }
    await user.save();

    res.json({
      success: true,
      message: 'PIN reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedAddresses');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findById(req.user._id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // In a more advanced setup, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    select: false // Don't return password by default
  },
  pin: {
    type: String,
    select: false,
    minlength: 4,
    maxlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'delivery'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  pushToken: {
    type: String,
    default: null
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  savedAddresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }]
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next(); // Don't hash if password is undefined/null
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Hash PIN before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('pin')) return next();
  if (!this.pin) return next(); // Don't hash if PIN is undefined/null
  this.pin = await bcrypt.hash(this.pin, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare PIN
userSchema.methods.comparePIN = async function(candidatePIN) {
  return await bcrypt.compare(candidatePIN, this.pin);
};

module.exports = mongoose.model('User', userSchema);


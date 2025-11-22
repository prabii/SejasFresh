const Address = require('../models/Address');

// @desc    Get all addresses
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      addresses,
      count: addresses.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, zipCode, country, landmark, coordinates, isDefault } = req.body;

    const address = await Address.create({
      user: req.user._id,
      label,
      street,
      city,
      state,
      zipCode,
      country: country || 'India',
      landmark,
      coordinates,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await address.deleteOne();

    const addresses = await Address.find({ user: req.user._id });

    res.json({
      success: true,
      message: 'Address deleted successfully',
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default address
// @route   PATCH /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    address.isDefault = true;
    await address.save();

    const addresses = await Address.find({ user: req.user._id });

    res.json({
      success: true,
      message: 'Default address updated',
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get default address
// @route   GET /api/addresses/default
// @access  Private
exports.getDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({
      user: req.user._id,
      isDefault: true
    });

    res.json({
      success: true,
      address
    });
  } catch (error) {
    next(error);
  }
};


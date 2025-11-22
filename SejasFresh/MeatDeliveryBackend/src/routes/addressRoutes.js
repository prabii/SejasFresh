const express = require('express');
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDefaultAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

// All address routes require authentication
router.use(protect);

router.get('/', getAddresses);
router.get('/default', getDefaultAddress);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

module.exports = router;


const User = require('../models/user.model');

// @desc    Create a new admin/staff user
exports.createAdminUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create new user (password will be hashed by the pre-save hook)
    user = await User.create({ email, password, role });
    // Don't send the password back in the response
    const userResponse = { _id: user._id, email: user.email, role: user.role };
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user' });
  }
};

// @desc    Delete a user
exports.deleteAdminUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};



exports.getAllAdminUsers = async (req, res) => {
  try {
    // .select('-password') exclude the password field
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
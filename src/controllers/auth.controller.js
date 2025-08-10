const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user._id, role: user.role };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};




exports.register = async (req, res) => {
  try {
    // Creates a new user based on the request body
    const user = await User.create(req.body);
    res.status(201).json({ 
      message: 'User created successfully! You can now use these credentials to log in.',
      userId: user._id 
    });
  } catch (error) {
    // This will catch errors, like if the email is already in use
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};
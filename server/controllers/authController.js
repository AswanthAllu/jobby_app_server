// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = id => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  const {name, email, password} = req.body;

  try {
    const userExists = await User.findOne({email});

    if (userExists) {
      return res.status(400).json({message: 'User already exists'});
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({message: 'Invalid user data'});
    }
  } catch (error) {
    // --- THIS IS THE IMPORTANT CHANGE ---
    console.error('REGISTER ERROR:', error); // Log the actual error
    res.status(500).json({message: 'Server Error'});
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  const {username, password} = req.body;

  try {
    const user = await User.findOne({email: username});

    if (user && (await user.matchPassword(password))) {
      res.json({
        jwt_token: generateToken(user._id),
      });
    } else {
      res.status(401).json({error_msg: 'Invalid username or password'});
    }
  } catch (error) {
    // --- THIS IS THE IMPORTANT CHANGE ---
    console.error('LOGIN ERROR:', error); // Log the actual error
    res.status(500).json({message: 'Server Error'});
  }
};
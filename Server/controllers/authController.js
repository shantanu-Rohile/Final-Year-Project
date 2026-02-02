import User from '../Models/User.js';
import { generateToken } from '../middleware/auth.js';

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide username, email and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
     user: {
  id: user._id,
  username: user.username,
  email: user.email,
  profilePicture: user.profilePicture
}

    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('createdRooms');

    res.json({
  success: true,
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture,
    createdRooms: user.createdRooms
  }
});


  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update
// @access  Private
export const updateUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Find logged-in user
    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      user.password = password; // ✅ let your User model's pre-save hook hash it
    }
    // ✅ Handle profile picture upload
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }


    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("❌ Update user error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ... existing signup, login, getMe, updateUser functions

// @desc    Remove profile picture
// @route   PUT /api/auth/remove-picture
// @access  Private
export const removePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Clear profile picture field
    user.profilePicture = "";
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture // will be ""
      }
    });
  } catch (error) {
    console.error("❌ Remove picture error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
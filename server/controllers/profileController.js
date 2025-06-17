// @desc    Get user profile
// @route   GET /api/profile
exports.getProfile = async (req, res) => {
  // The user object is attached to the request in the `protect` middleware
  const user = req.user;

  if (user) {
    // The frontend expects this specific structure
    res.json({
      profile_details: {
        name: user.name,
        profile_image_url: user.profileImageUrl,
        short_bio: user.shortBio,
      }
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
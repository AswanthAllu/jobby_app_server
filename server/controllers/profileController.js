// server/controllers/profileController.js
exports.getProfile = async (req, res) => {
  const user = req.user;
  if (user) {
    res.json({
      profile_details: {
        name: user.name,
        profile_image_url: user.profileImageUrl,
        short_bio: user.shortBio,
      },
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // VERIFY THIS LINE IS CORRECT

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shortBio: { type: String, default: 'A passionate developer.' },
  profileImageUrl: { type: String, default: '/images/default-profile-img.png' },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  // This line will now work because the bcrypt object is complete
  const salt = await bcrypt.genSalt(10); 
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
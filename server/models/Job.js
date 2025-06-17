const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
});

const LifeAtCompanySchema = new mongoose.Schema({
  description: String,
  imageUrl: String,
});

const JobSchema = new mongoose.Schema({
  title: String,
  companyLogoUrl: String,
  companyWebsiteUrl: String,
  rating: Number,
  location: String,
  employmentType: String, // e.g., 'Full Time', 'Part Time'
  packagePerAnnum: String,
  jobDescription: String,
  skills: [SkillSchema],
  lifeAtCompany: LifeAtCompanySchema,
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const Job = mongoose.model('Job', JobSchema);
module.exports = Job;
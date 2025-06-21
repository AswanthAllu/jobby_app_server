// server/models/Job.js
const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const LifeAtCompanySchema = new mongoose.Schema({
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
});

const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    companyLogoUrl: { type: String, default: '' },
    companyWebsiteUrl: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    location: { type: String, required: true },
    employmentType: { type: String, required: true },
    packagePerAnnum: { type: String, default: '' },
    jobDescription: { type: String, required: true },
    skills: [SkillSchema],
    lifeAtCompany: {
      type: LifeAtCompanySchema,
      default: () => ({}), // Provide a default empty object
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.Job || mongoose.model('Job', JobSchema);
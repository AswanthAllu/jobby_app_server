// server/models/Job.js
const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
});

const LifeAtCompanySchema = new mongoose.Schema({
  description: String,
  imageUrl: String,
});

const JobSchema = new mongoose.Schema(
  {
    title: String,
    companyLogoUrl: String,
    companyWebsiteUrl: String,
    rating: Number,
    location: String,
    employmentType: String,
    packagePerAnnum: String,
    jobDescription: String,
    skills: [SkillSchema],
    lifeAtCompany: LifeAtCompanySchema,
  },
  {
    timestamps: true,
  },
);

const Job = mongoose.model('Job', JobSchema);
module.exports = Job;
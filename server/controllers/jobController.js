// server/controllers/jobController.js
const Job = require('../models/Job');

// Helper Functions
const formatJobForList = job => ({
  id: job._id,
  title: job.title,
  company_logo_url: job.companyLogoUrl,
  rating: job.rating,
  location: job.location,
  employment_type: job.employmentType,
  package_per_annum: job.packagePerAnnum,
  job_description: job.jobDescription,
});

const formatJobDetails = job => ({
  id: job._id,
  title: job.title,
  company_logo_url: job.companyLogoUrl,
  company_website_url: job.companyWebsiteUrl,
  rating: job.rating,
  location: job.location,
  employment_type: job.employmentType,
  package_per_annum: job.packagePerAnnum,
  job_description: job.jobDescription,
  skills: job.skills.map(skill => ({
    name: skill.name,
    image_url: skill.imageUrl,
  })),
  life_at_company: {
    description: job.lifeAtCompany.description,
    image_url: job.lifeAtCompany.imageUrl,
  },
});

const formatSimilarJob = job => ({
  id: job._id,
  title: job.title,
  company_logo_url: job.companyLogoUrl,
  rating: job.rating,
  location: job.location,
  employment_type: job.employmentType,
  job_description: job.jobDescription,
});

// Controller Functions
exports.getAllJobs = async (req, res) => {
  const { employment_type, minimum_package, search } = req.query;
  const query = {};

  if (employment_type) {
    const types = employment_type.split(',');
    if (types.length > 0 && types[0] !== '') {
      query.employmentType = { $in: types };
    }
  }

  if (minimum_package && parseInt(minimum_package, 10) > 0) {
    const minSalary = parseInt(minimum_package, 10);
    const allJobs = await Job.find(search ? { title: { $regex: search, $options: 'i' } } : {});
    const filteredJobs = allJobs.filter(job => {
      if (!job.packagePerAnnum) return false;
      const packageNum = parseInt(job.packagePerAnnum.replace(/\D/g, ''), 10) * 100000;
      return packageNum >= minSalary;
    });
    const jobIds = filteredJobs.map(job => job._id);
    query._id = { $in: jobIds };
  } else if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  try {
    const jobs = await Job.find(query);
    res.json({ jobs: jobs.map(formatJobForList) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const similarJobs = await Job.find({
      employmentType: job.employmentType,
      _id: { $ne: job._id },
    }).limit(4);
    res.json({
      job_details: formatJobDetails(job),
      similar_jobs: similarJobs.map(formatSimilarJob),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createJob = async (req, res) => {
  try {
    const jobData = req.body;
    const job = new Job({
      title: jobData.title || 'Sample Job Title',
      companyLogoUrl: jobData.companyLogoUrl || '/images/sample-logo.png',
      companyWebsiteUrl: jobData.companyWebsiteUrl || 'https://example.com',
      rating: jobData.rating || 4.0,
      location: jobData.location || 'Remote',
      employmentType: jobData.employmentType || 'Full Time',
      packagePerAnnum: jobData.packagePerAnnum || '15 LPA',
      jobDescription: jobData.jobDescription || 'Enter job description here.',
      skills: jobData.skills || [],
      lifeAtCompany: jobData.lifeAtCompany || { description: '', imageUrl: '' },
    });
    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
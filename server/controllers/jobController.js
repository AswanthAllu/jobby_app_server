// server/controllers/jobController.js
const Job = require('../models/Job');

// --- Helper function to format the job list summary ---
// We will ensure ALL necessary fields are included here.
const formatJobForList = job => ({
  id: job._id,
  title: job.title,
  company_logo_url: job.companyLogoUrl, // This is the crucial field
  rating: job.rating,
  location: job.location,
  employment_type: job.employmentType,
  package_per_annum: job.packagePerAnnum,
  job_description: job.jobDescription,
});

// --- Helper function for the detailed view ---
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
  })),
  life_at_company: job.lifeAtCompany,
});

// --- Helper function for similar jobs ---
const formatSimilarJob = job => ({
  _id: job._id, // Send _id for linking
  title: job.title,
  company_logo_url: job.companyLogoUrl,
  rating: job.rating,
  location: job.location,
  employment_type: job.employmentType,
  job_description: job.jobDescription,
});

// --- Controller Functions ---

exports.getAllJobs = async (req, res) => {
  try {
    const { employment_type, minimum_package, search } = req.query;
    const query = {};

    if (employment_type) {
      const types = employment_type.split(',');
      if (types.length > 0 && types[0] !== '') {
        query.employmentType = { $in: types };
      }
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    let jobs = await Job.find(query);

    // This salary filter needs to run after the initial query
    if (minimum_package && parseInt(minimum_package, 10) > 0) {
      const minSalary = parseInt(minimum_package, 10);
      jobs = jobs.filter(job => {
        if (!job.packagePerAnnum) return false;
        const packageNum = parseInt(job.packagePerAnnum.replace(/\D/g, ''), 10) * 100000;
        return packageNum >= minSalary;
      });
    }

    // Use the corrected helper function here
    res.json({ jobs: jobs.map(formatJobForList) });
  } catch (error) {
    console.error('GET ALL JOBS ERROR:', error);
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
    console.error('GET JOB BY ID ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      location,
      jobDescription,
      employmentType,
      skills,
      companyLogoUrl,
      companyWebsiteUrl,
      packagePerAnnum,
      rating,
    } = req.body;

    if (!title || !location || !jobDescription || !employmentType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const skillsArray = skills
      ? skills.split(',').map(skillName => ({ name: skillName.trim() }))
      : [];

    const newJob = new Job({
      title,
      location,
      jobDescription,
      employmentType,
      skills: skillsArray,
      companyLogoUrl,
      companyWebsiteUrl,
      packagePerAnnum,
      rating,
    });

    const createdJob = await newJob.save();
    res.status(201).json(createdJob);
  } catch (error) {
    console.error('CREATE JOB ERROR:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { skills, ...updateData } = req.body;
    if (skills !== undefined) {
      updateData.skills = skills
        ? skills.split(',').map(skillName => ({ name: skillName.trim() }))
        : [];
    }
    const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(updatedJob);
  } catch (error) {
    console.error('UPDATE JOB ERROR:', error);
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
  } catch (error)
  {
    console.error('DELETE JOB ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
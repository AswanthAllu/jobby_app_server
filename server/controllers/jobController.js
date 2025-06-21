// server/controllers/jobController.js
const Job = require('../models/Job');

// --- Helper functions remain the same ---
const formatJobForList = job => ({
  id: job._id,
  title: job.title,
  company_logo_url: job.companyLogoUrl,
  rating: job.rating,
  location: job.location,
  employment_type: job.employmentType,
  package_per_annum: job.packagePerAnnum,
  job_description: job.jobDescription,
  skills: job.skills,
});
// ... and so on for your other formatters

// --- Controller Functions ---

exports.getAllJobs = async (req, res) => {
  // This function remains the same
  try {
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
    const jobs = await Job.find(query);
    res.json({ jobs: jobs.map(formatJobForList) });
  } catch (error) {
    console.error('GET ALL JOBS ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getJobById = async (req, res) => {
  // This function remains the same
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
      job_details: job, // Send the raw job object
      similar_jobs: similarJobs,
    });
  } catch (error) {
    console.error('GET JOB BY ID ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- THIS IS THE NEW, BULLETPROOF CREATE FUNCTION ---
exports.createJob = async (req, res) => {
  console.log('--- CREATE JOB ENDPOINT HIT ---');
  console.log('Received Body:', req.body);

  try {
    const {
      title,
      location,
      jobDescription,
      employmentType,
      skills, // comma-separated string
      companyLogoUrl,
      companyWebsiteUrl,
      packagePerAnnum,
      rating,
    } = req.body;

    // Basic validation
    if (!title || !location || !jobDescription || !employmentType) {
      console.error('Validation Failed: Missing required fields.');
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

    console.log('Attempting to save new job:', newJob);
    const createdJob = await newJob.save();
    console.log('--- SAVE SUCCESSFUL ---');
    res.status(201).json(createdJob);

  } catch (error) {
    // This will now catch any validation or other errors
    console.error('---!!! CREATE JOB CRASHED !!!---');
    console.error('THE ERROR IS:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  // This function remains the same
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
  // This function remains the same
  try {
    const job = await Job.findById(req.params.id);
    if (job) {
      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    console.error('DELETE JOB ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
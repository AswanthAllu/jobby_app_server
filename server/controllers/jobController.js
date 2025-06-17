const Job = require('../models/Job');

// @desc    Get all jobs with filtering
// @route   GET /api/jobs
exports.getAllJobs = async (req, res) => {
  const { employment_type, minimum_package, search } = req.query;

  const query = {};

  if (employment_type) {
    // The frontend sends a comma-separated string
    const types = employment_type.split(',');
    query.employmentType = { $in: types };
  }

  if (minimum_package) {
    // Assuming packagePerAnnum is stored as a string like "10 LPA"
    // This is a simplified logic. A better approach would be to store salary as a number.
    // For now, we'll filter based on the numeric part.
    const minSalary = parseInt(minimum_package, 10);
    const allJobs = await Job.find({});
    const filteredJobs = allJobs.filter(job => {
        const packageNum = parseInt(job.packagePerAnnum.replace(/\D/g, ''), 10) * 100000;
        return packageNum >= minSalary;
    });
    const jobIds = filteredJobs.map(job => job._id);
    query._id = { $in: jobIds };
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
  }

  try {
    const jobs = await Job.find(query);
    // The frontend expects this structure
    res.json({ jobs: jobs.map(formatJobForList) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Find similar jobs (e.g., same employment type, different job)
    const similarJobs = await Job.find({
      employmentType: job.employmentType,
      _id: { $ne: job._id } // Exclude the current job
    }).limit(4); // Limit to 4 similar jobs

    // The frontend expects this structure
    res.json({
      job_details: formatJobDetails(job),
      similar_jobs: similarJobs.map(formatSimilarJob)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// --- Helper Functions to match frontend data structure ---

const formatJobForList = (job) => ({
  id: job._id,
  title: job.title,
  company_logo_url: job.companyLogoUrl,
  rating: job.rating,
  location: job.location,
  employment_type: job.employmentType,
  package_per_annum: job.packagePerAnnum,
  job_description: job.jobDescription,
});

const formatJobDetails = (job) => ({
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
  }
});

const formatSimilarJob = (job) => ({
    id: job._id,
    title: job.title,
    company_logo_url: job.companyLogoUrl,
    rating: job.rating,
    location: job.location,
    employment_type: job.employmentType,
    job_description: job.jobDescription,
});
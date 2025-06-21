// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ... (Route Imports)
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// --- NEW: Production-ready CORS Configuration ---
const allowedOrigins = [process.env.CORS_ORIGIN];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
};
app.use(cors(corsOptions));


app.use(express.json());

// ... (Database Connection and the rest of the file remains the same)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.get('/', (req, res) => res.send('Jobby App API is running...'));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
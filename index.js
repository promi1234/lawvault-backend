import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Initialize app and config
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// // Middleware setup
// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Middleware setup
app.use(cors({
  origin: ['http://localhost:5173', 'https://lawvault-app.surge.sh/'], // add your frontend deploy link here
  credentials: true
}));


// File upload configuration
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Database connection
const client = new MongoClient(process.env.MONGO_URI);
let db, usersCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('lawfirm');
    usersCollection = db.collection('users');
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

// Helper function for error responses
const sendResponse = (res, status, success, message, data = null) => {
  return res.status(status).json({ success, message, ...(data && { data }) });
};

// Routes
app.post('/signup', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, password, gender, role = 'client' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return sendResponse(res, 400, false, 'Name, email, and password are required');
    }

    // Check for existing user
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 409, false, 'Email already registered');
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      gender,
      role,
      photo: req.file?.filename || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert new user
    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId;

    // Return success response (excluding password)
    const userData = {
      id: userId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      photo: newUser.photo
    };

    return sendResponse(res, 201, true, 'User registered successfully', userData);

  } catch (error) {
    console.error('Signup error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendResponse(res, 400, false, 'Email and password are required');
    }

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Successful login response (excluding password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo: user.photo
    };

    return sendResponse(res, 200, true, 'Login successful', userData);

  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
});

// ====================== Appointment Route ======================
app.post('/appointments', async (req, res) => {
  try {
    const { name, email, phone, date, time } = req.body;

    // Validation
    if (!name || !email || !phone || !date || !time) {
      return sendResponse(res, 400, false, 'All fields are required');
    }

    // Optional: You can add logic to prevent double-booking
    const existing = await db.collection('appointments').findOne({ date, time });
    if (existing) {
      return sendResponse(res, 409, false, 'This time slot is already booked');
    }

    // Create appointment
    const newAppointment = {
      name,
      email,
      phone,
      date,
      time,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('appointments').insertOne(newAppointment);

    return sendResponse(res, 201, true, 'Appointment booked successfully', {
      id: result.insertedId,
      ...newAppointment
    });

  } catch (error) {
    console.error('Appointment booking error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
});


// Start server
(async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`🔑 Signup endpoint: POST http://localhost:${port}/signup`);
    console.log(`🔐 Login endpoint: POST http://localhost:${port}/login`);
  });
})();
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// নিশ্চিত করো uploads ফোল্ডার আছে
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Static uploads route
app.use('/uploads', express.static(uploadDir));

// MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let userCollection;
let appointmentCollection;

async function connectDB() {
  await client.connect();
  const db = client.db('testdb');
  userCollection = db.collection('users');
  appointmentCollection = db.collection('appointments');
  console.log('✅ MongoDB Connected');
}
connectDB().catch(console.error);

/* ========================= SIGNUP ========================= */
app.post('/signup', upload.single('photo'), async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Duplicate check
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Save to DB
    await userCollection.insertOne({ username, email, password: hashedPassword, photo: photoUrl });
    res.status(201).json({ message: 'User registered successfully', photo: photoUrl });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

/* ========================= LOGIN ========================= */
app.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) return res.status(400).json({ message: 'Please provide all fields' });

    const user = await userCollection.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

/* ========================= APPOINTMENT ========================= */
app.post('/appointments', async (req, res) => {
  try {
    const { name, email, phone, date, time, message } = req.body;
    if (!name || !email || !phone || !date || !time)
      return res.status(400).json({ message: 'Please provide all required fields' });

    const appointment = { name, email, phone, date, time, message: message || '', createdAt: new Date() };
    await appointmentCollection.insertOne(appointment);
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Appointment Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.get('/appointments', async (req, res) => {
  try {
    const appointments = await appointmentCollection.find().toArray();
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

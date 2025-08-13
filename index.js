import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',                  // local frontend
    'https://lawvault-frontend.vercel.app'   // production frontend deploy URL
  ],
  methods: ['GET','POST'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const appointmentCollection = client.db('lawfirm').collection('appointments');
    const userCollection = client.db('lawfirm').collection('users');

    console.log('✅ Connected to MongoDB');

    // ==========================
    // Signup Route
    // ==========================
    app.post('/signup', async (req, res) => {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const existingUser = await userCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await userCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date()
      });

      res.status(201).json({ message: 'Signup successful', userId: result.insertedId });
    });

    // ==========================
    // Login Route
    // ==========================
    app.post('/login', async (req, res) => {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }

      const user = await userCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.status(200).json({ message: 'Login successful', userId: user._id });
    });

    // ==========================
    // Appointment Booking Route
    // ==========================
    app.post('/appointments', async (req, res) => {
      console.log("Received appointment data:", req.body);

      const { name, email, phone, date, time } = req.body;

      if (!name || !email || !phone || !date || !time) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      try {
        const result = await appointmentCollection.insertOne({
          name,
          email,
          phone,
          date,
          time,
          createdAt: new Date()
        });

        console.log('Appointment inserted:', result.insertedId);

        res.status(200).json({ 
          message: 'Appointment booked successfully', 
          appointmentId: result.insertedId 
        });
      } catch (error) {
        console.error('Appointment booking error:', error);
        res.status(500).json({ message: 'Server error while booking appointment' });
      }
    });

    // ==========================
    // Test Route
    // ==========================
    app.get('/', (req, res) => {
      res.send('🧑‍⚖️ Lawfirm server is running');
    });

    // Start server
    app.listen(port, () => {
      console.log(`⚖️ Server listening on port ${port}`);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed', err);
  }
}

run().catch(console.dir);

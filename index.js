import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',  // local frontend
    'https://lawvault-frontend.vercel.app' // production frontend deploy URL
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

    console.log('✅ Connected to MongoDB');

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

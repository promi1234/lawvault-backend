import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());

// express.json() can cause issues with multipart/form-data
// so use it only for non-file routes or after multer middleware for specific routes
app.use(express.json());

// Static folder for uploaded files
app.use('/uploads', express.static('uploads'));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Make sure 'uploads' folder exists in your project root
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

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
    // Connect MongoDB client
    await client.connect();

    const lawyerCollection = client.db('lawfirm').collection('lawyers');
    const usersCollection = client.db('lawfirm').collection('users');

    // GET all lawyers
    app.get('/lawyers', async (req, res) => {
      try {
        const result = await lawyerCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server error' });
      }
    });

    // GET single lawyer
    app.get('/lawyers/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const lawyer = await lawyerCollection.findOne({ _id: new ObjectId(id) });
        if (!lawyer) return res.status(404).send({ message: 'Lawyer not found' });
        res.send(lawyer);
      } catch (err) {
        res.status(500).send({ message: 'Server error' });
      }
    });

    // POST new lawyer
    app.post('/lawyers', async (req, res) => {
      const newLawyer = req.body;
      const result = await lawyerCollection.insertOne(newLawyer);
      res.send(result);
    });

    // DELETE lawyer
    app.delete('/lawyers/:id', async (req, res) => {
      const id = req.params.id;
      const result = await lawyerCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // POST - Signup User with multer file upload
    app.post('/signup', upload.single('photo'), async (req, res) => {
      try {
        // multer saves file info in req.file
        // other form fields in req.body
        const { name, email, password, gender, role } = req.body;
        const photo = req.file ? req.file.filename : null;

        // Required field check
        if (!name || !email || !password) {
          return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(409).json({ message: 'User already exists with this email' });
        }

        // Save user in database with photo filename
        const user = { name, email, password, gender, role, photo };
        const result = await usersCollection.insertOne(user);

        res.status(201).json({
          message: 'User created successfully',
          userId: result.insertedId,
        });
      } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ message: 'Server error during signup' });
      }
    });

    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed', err);
  }
}

run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
  res.send('🧑‍⚖️ Lawfirm server is running');
});

// Start server
app.listen(port, () => {
  console.log(`⚖️ Server listening on port ${port}`);
});

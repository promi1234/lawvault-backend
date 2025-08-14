// // import express from 'express';
// // import cors from 'cors';
// // import dotenv from 'dotenv';
// // import multer from 'multer';
// // import bcrypt from 'bcryptjs';
// // import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

// // dotenv.config();
// // const app = express();
// // const port = process.env.PORT || 5000;

// // // Middleware
// // app.use(cors());
// // app.use(express.json());

// // // Static folder for uploaded files
// // app.use('/uploads', express.static('uploads'));

// // // Multer setup for file uploads
// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, 'uploads/'); // Make sure 'uploads' folder exists in your project root
// //   },
// //   filename: function (req, file, cb) {
// //     cb(null, Date.now() + '-' + file.originalname);
// //   }
// // });
// // const upload = multer({ storage });

// // // MongoDB setup
// // const uri = process.env.MONGO_URI;
// // const client = new MongoClient(uri, {
// //   serverApi: {
// //     version: ServerApiVersion.v1,
// //     strict: true,
// //     deprecationErrors: true,
// //   }
// // });

// // async function run() {
// //   try {
// //     await client.connect();
// //     const lawyerCollection = client.db('lawfirm').collection('lawyers');
// //     const usersCollection = client.db('lawfirm').collection('users');

// //     // Utility Route: Password Hash Generator
// //     app.get('/hash-password/:plain', async (req, res) => {
// //       try {
// //         const plain = req.params.plain;
// //         const hashed = await bcrypt.hash(plain, 10);
// //         res.json({ plain, hashed });
// //       } catch (err) {
// //         console.error('Hash Error:', err);
// //         res.status(500).json({ message: 'Error generating hash' });
// //       }
// //     });

// //     // Lawyer Routes
// //     app.get('/lawyers', async (req, res) => {
// //       try {
// //         const result = await lawyerCollection.find().toArray();
// //         res.send(result);
// //       } catch (err) {
// //         res.status(500).json({ message: 'Error fetching lawyers' });
// //       }
// //     });

// //     app.get('/lawyers/:id', async (req, res) => {
// //       try {
// //         const id = req.params.id;
// //         const result = await lawyerCollection.findOne({ _id: new ObjectId(id) });
// //         res.send(result);
// //       } catch (err) {
// //         res.status(500).json({ message: 'Error fetching lawyer' });
// //       }
// //     });

// //     app.post('/lawyers', async (req, res) => {
// //       const newLawyer = req.body;
// //       const result = await lawyerCollection.insertOne(newLawyer);
// //       res.send(result);
// //     });

// //     app.delete('/lawyers/:id', async (req, res) => {
// //       const id = req.params.id;
// //       const result = await lawyerCollection.deleteOne({ _id: new ObjectId(id) });
// //       res.send(result);
// //     });

// //     // Auth Routes
// //     app.post('/signup', upload.single('photo'), async (req, res) => {
// //       try {
// //         const { name, email, password, gender, role } = req.body;
// //         const photo = req.file ? req.file.filename : null;

// //         if (!name || !email || !password) {
// //           return res.status(400).json({ message: 'Name, email, and password are required' });
// //         }

// //         const existingUser = await usersCollection.findOne({ email });
// //         if (existingUser) {
// //           return res.status(409).json({ message: 'User already exists with this email' });
// //         }

// //         const hashedPassword = await bcrypt.hash(password, 10);
// //         const user = { name, email, password: hashedPassword, gender, role, photo };
// //         const result = await usersCollection.insertOne(user);

// //         res.status(201).json({
// //           message: 'User registered successfully',
// //           userId: result.insertedId
// //         });
// //       } catch (err) {
// //         console.error('Signup Error:', err);
// //         res.status(500).json({ message: 'Server error during signup' });
// //       }
// //     });

// //     app.post('/login', async (req, res) => {
// //       try {
// //         const { email, password } = req.body;
// //         const user = await usersCollection.findOne({ email });

// //         if (!user) {
// //           return res.status(404).json({ message: 'User not found' });
// //         }

// //         const isPasswordValid = await bcrypt.compare(password, user.password);
// //         if (!isPasswordValid) {
// //           return res.status(401).json({ message: 'Invalid credentials' });
// //         }

// //         res.status(200).json({
// //           message: 'Login successful',
// //           user: {
// //             id: user._id,
// //             name: user.name,
// //             email: user.email,
// //             role: user.role,
// //             photo: user.photo
// //           }
// //         });
// //       } catch (err) {
// //         console.error('Login Error:', err);
// //         res.status(500).json({ message: 'Server error during login' });
// //       }
// //     });

// //     console.log('✅ Connected to MongoDB');
// //   } catch (err) {
// //     console.error('❌ MongoDB connection failed', err);
// //   }
// // }

// // run().catch(console.dir);

// // app.get('/', (req, res) => {
// //   res.send('🧑‍⚖️ Lawfirm server is running');
// // });

// // app.listen(port, () => {
// //   console.log(`⚖️ Server listening on port ${port}`);
// // });



// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import bcrypt from 'bcryptjs';
// import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

// dotenv.config();
// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors({
//   origin: [
//     'http://localhost:5173',                  // local frontend
//     'https://lawvault-frontend.vercel.app'    // production frontend deploy URL
//   ],
//   methods: ['GET', 'POST', 'DELETE'],
//   credentials: true
// }));
// app.use(express.json());

// // Static folder for uploaded files
// app.use('/uploads', express.static('uploads'));

// // Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage });

// // MongoDB setup
// const uri = process.env.MONGO_URI;
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     await client.connect();
//     console.log('✅ Connected to MongoDB');

//     const lawyerCollection = client.db('lawfirm').collection('lawyers');
//     const usersCollection = client.db('lawfirm').collection('users');
//     const appointmentCollection = client.db('lawfirm').collection('appointments');

//     // ==========================
//     // Lawyer Routes
//     // ==========================
//     app.get('/lawyers', async (req, res) => {
//       try {
//         const result = await lawyerCollection.find().toArray();
//         res.send(result);
//       } catch (err) {
//         res.status(500).json({ message: 'Error fetching lawyers' });
//       }
//     });

//     app.get('/lawyers/:id', async (req, res) => {
//       try {
//         const id = req.params.id;
//         const result = await lawyerCollection.findOne({ _id: new ObjectId(id) });
//         res.send(result);
//       } catch (err) {
//         res.status(500).json({ message: 'Error fetching lawyer' });
//       }
//     });

//     app.post('/lawyers', async (req, res) => {
//       const newLawyer = req.body;
//       const result = await lawyerCollection.insertOne(newLawyer);
//       res.send(result);
//     });

//     app.delete('/lawyers/:id', async (req, res) => {
//       const id = req.params.id;
//       const result = await lawyerCollection.deleteOne({ _id: new ObjectId(id) });
//       res.send(result);
//     });

//     // ==========================
//     // Signup Route (with photo upload)
//     // ==========================
//     app.post('/signup', upload.single('photo'), async (req, res) => {
//       try {
//         const { name, email, password, gender, role } = req.body;
//         const photo = req.file ? req.file.filename : null;

//         if (!name || !email || !password) {
//           return res.status(400).json({ message: 'Name, email, and password are required' });
//         }

//         const existingUser = await usersCollection.findOne({ email });
//         if (existingUser) {
//           return res.status(409).json({ message: 'User already exists with this email' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = { name, email, password: hashedPassword, gender, role, photo, createdAt: new Date() };
//         const result = await usersCollection.insertOne(user);

//         res.status(201).json({
//           message: 'User registered successfully',
//           userId: result.insertedId
//         });
//       } catch (err) {
//         console.error('Signup Error:', err);
//         res.status(500).json({ message: 'Server error during signup' });
//       }
//     });

//     // ==========================
//     // Login Route
//     // ==========================
//     app.post('/login', async (req, res) => {
//       try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//           return res.status(400).json({ message: 'Email and password required' });
//         }

//         const user = await usersCollection.findOne({ email });
//         if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//         }

//         const isPasswordValid = await bcrypt.compare(password, user.password);
//         if (!isPasswordValid) {
//           return res.status(401).json({ message: 'Invalid credentials' });
//         }

//         res.status(200).json({
//           message: 'Login successful',
//           user: {
//             id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             photo: user.photo
//           }
//         });
//       } catch (err) {
//         console.error('Login Error:', err);
//         res.status(500).json({ message: 'Server error during login' });
//       }
//     });

//     // ==========================
//     // Appointment Booking Route
//     // ==========================
//     app.post('/appointments', async (req, res) => {
//       console.log("Received appointment data:", req.body);

//       const { name, email, phone, date, time } = req.body;

//       if (!name || !email || !phone || !date || !time) {
//         return res.status(400).json({ message: 'All fields are required' });
//       }

//       try {
//         const result = await appointmentCollection.insertOne({
//           name,
//           email,
//           phone,
//           date,
//           time,
//           createdAt: new Date()
//         });

//         console.log('Appointment inserted:', result.insertedId);

//         res.status(200).json({
//           message: 'Appointment booked successfully',
//           appointmentId: result.insertedId
//         });
//       } catch (error) {
//         console.error('Appointment booking error:', error);
//         res.status(500).json({ message: 'Server error while booking appointment' });
//       }
//     });

//     // ==========================
//     // Root route
//     // ==========================
//     app.get('/', (req, res) => {
//       res.send('🧑‍⚖️ Lawfirm server is running');
//     });

//     // ✅ Start server after MongoDB connection
//     app.listen(port, () => {
//       console.log(`⚖️ Server listening on port ${port}`);
//     });

//   } catch (err) {
//     console.error('❌ MongoDB connection failed', err);
//   }
// }

// run().catch(console.dir);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
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
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Static uploads route
app.use('/uploads', express.static(uploadDir));

// MongoDB connection
//const uri = process.env.MONGODB_URI;
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
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Duplicate check
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // যদি ছবি থাকে
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Save to DB
    await userCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      photo: photoUrl
    });

    res.status(201).json({ message: 'User registered successfully', photo: photoUrl });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

/* ========================= LOGIN ========================= */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

/* ========================= APPOINTMENT FORM SUBMIT ========================= */
app.post('/appointments', async (req, res) => {
  try {
    const { name, email, phone, date, time, message } = req.body;

    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const appointment = {
      name,
      email,
      phone,
      date,
      time,
      message: message || '',
      createdAt: new Date()
    };

    await appointmentCollection.insertOne(appointment);
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Appointment Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

/* ========================= GET ALL APPOINTMENTS ========================= */
app.get('/appointments', async (req, res) => {
  try {
    const appointments = await appointmentCollection.find().toArray();
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Get Appointments Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(express.json());

// // Root route (test)
// app.get('/', (req, res) => {
//   res.send('API is working!');
// });

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   })
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch((err) => console.error('❌ MongoDB connection error:', err));

// // Start server
// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });



import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    // ✅ MongoDB client connect করো
    await client.connect();

    const lawyerCollection = client.db('lawfirm').collection('lawyers');

    // ✅ GET all lawyers
    app.get('/lawyers', async (req, res) => {
      try {
        const result = await lawyerCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server error' });
      }
    });

    // ✅ GET single lawyer
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

    // ✅ POST new lawyer
    app.post('/lawyers', async (req, res) => {
      const newLawyer = req.body;
      const result = await lawyerCollection.insertOne(newLawyer);
      res.send(result);
    });

    // ✅ DELETE lawyer
    app.delete('/lawyers/:id', async (req, res) => {
      const id = req.params.id;
      const result = await lawyerCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed', err);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('🧑‍⚖️ Lawfirm server is running');
});

app.listen(port, () => {
  console.log(`⚖️ Server listening on port ${port}`);
});

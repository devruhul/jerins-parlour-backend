const express = require('express');
const app = express();
const admin = require("firebase-admin");
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// initialize firebase admin

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6jlv6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Verify token
async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodedIdToken = await admin.auth().verifyIdToken(idToken);
            req.decodedEmail = decodedIdToken.email;
        }
        catch (error) {
            console.error("Error while verifying token:", error);
            res.status(403).send("Unauthorized");
        }
    }
    next()
}

async function run() {
    try {
        await client.connect();
        const database = client.db("jerins_parlour");
        const servicesCollection = database.collection("services");
        const bookingsCollection = database.collection("bookings");
        const reviewsCollection = database.collection("reviews");
        const usersCollection = database.collection("users");

        // add services to database
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result);
        });

        // get service by id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const result = await servicesCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // delete service by id
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // get 3 services
        app.get('/services', async (req, res) => {
            const result = await servicesCollection.find({}).limit(3).toArray();
            res.send(result);
        })
        // get all services
        app.get('/allServices', async (req, res) => {
            const result = await servicesCollection.find({}).toArray();
            res.send(result);
        })

        // add booking to database
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });

        // get all bookings from database
        app.get('/bookings', async (req, res) => {
            const result = await bookingsCollection.find({}).toArray();
            res.send(result);
        });

        // // get single booking by id
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const result = await bookingsCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // update order status in bookings collection
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body;
            const result = await bookingsCollection.updateOne({ _id: new ObjectId(id) }, { $set: status });
            res.send(result);
        });

        // delete bookings by id
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // send service reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        // save users to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // check if user roll is admin or not
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // uodate user if not existed
        app.put('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const result = await usersCollection.updateOne(query, { $set: user }, { upsert: true });
            res.json(result);
        })

        // add admin roll to user
        app.put('/users/makeAdmin', verifyToken, async (req, res) => {
            const email = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }

        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Jerins Parlour');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6jlv6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

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

        // get all services
        app.get('/services', async (req, res) => {
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




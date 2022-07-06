const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongodb = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Jerins Parlour');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




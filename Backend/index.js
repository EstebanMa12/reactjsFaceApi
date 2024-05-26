const { json, urlencoded } = require('express');
const express = require('express')
const cors = require('cors')
const mongoDB = require('./config/mongoConfig');
const Descriptor = require('./models/descriptor.model');


if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

//Initializations
const port = 3000
const app = express();
app.use(cors());
mongoDB.connect();


app.set('port', port);
app.listen(app.get('port'), async () => {
    console.log(`Server running on port ${app.get('port')}`);
});

// Middleware 
app.use(json());

app.use(urlencoded({ extended: false }));



// POST
app.post('/register', async (req, res) => {
    const { descriptor, name } = req.body;
    const descriptorDB = new Descriptor({ descriptor, name });
    await descriptorDB.save();
    res.json({
        message: 'Descriptor saved',
        data: descriptorDB
    });
});

// GET
app.get('/descriptors', async (req, res) => {
    const descriptors = await Descriptor.find();
    res.json(descriptors);
});
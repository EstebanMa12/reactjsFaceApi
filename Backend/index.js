const {json, urlencoded} = require('express');
const express = require('express')
const cors = require('cors')
const port = 3000

const app = express();
const mongoDB = require( './config/mongoConfig' );


if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

app.use(cors());
mongoDB.connect();


app.set('port', port);
app.listen(app.get('port'), async () => {
    console.log(`Server running on port ${app.get('port')}`);
});

// Middleware 
app.use(json());

app.use(urlencoded({ extended: false }));